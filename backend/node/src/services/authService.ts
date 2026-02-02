import { prisma } from '@/lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { AppError } from '@/utils/AppError.js';
import crypto from 'crypto';
import { sendResetEmail } from '@/utils/email.js';
import { OAuth2Client, LoginTicket } from 'google-auth-library';
import { logger } from '@/lib/logger.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function registerUser(email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { email, password: hashed, role: 'USER' },
    });
    return { id: user.id, email: user.email };
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new AppError('User already exists', 400);
    }
    throw err;
  }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.provider && user.provider !== 'local') {
    throw new AppError(`Please login using ${user.provider}`, 400);
  }

  if (!user.password) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError('Server misconfiguration', 500);
  }

  const role = user.role.toUpperCase() as 'USER' | 'ADMIN' | 'SA';

  const payload = {
    id: user.id,
    email: user.email,
    role,
    name: user.name || null,
  };

  const accessToken = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign(payload, secret, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken, role };
}

export async function refreshAccessToken(refreshToken: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError('Server misconfiguration', 500);
  if (!refreshToken) throw new AppError('No refresh token provided', 401);

  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  try {
    const payload = jwt.verify(refreshToken, secret) as {
      id: number;
      email: string;
      role: 'USER' | 'ADMIN' | 'SA';
    };

    const newAccessToken = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      secret,
      { algorithm: 'HS256', expiresIn: '1h' }
    );

    const newRefreshToken = jwt.sign(
      { id: payload.id, email: payload.email, role: payload.role },
      secret,
      { algorithm: 'HS256', expiresIn: '7d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null },
    });

    throw new AppError('Invalid or expired refresh token', 401);
  }
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExp: expires,
    },
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendResetEmail(email, resetLink);
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() },
    },
  });

  if (!user) throw new AppError('Invalid or expired token', 400);

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  return { message: 'Password reset successfully' };
}

export async function googleLoginUser(googleToken: string) {
  try {
    const ticket: LoginTicket = await googleClient.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token', 400);
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      const dummyPassword = await bcrypt.hash('google-oauth-user', 10);
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: (payload.name ?? payload.email.split('@')[0]) as string | null,
          password: dummyPassword,
          role: 'USER',
        },
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new AppError('Server misconfiguration', 500);

    const jwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || null,
    };

    const accessToken = jwt.sign(jwtPayload, secret, {
      algorithm: 'HS256',
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign(jwtPayload, secret, {
      algorithm: 'HS256',
      expiresIn: '7d',
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken, role: user.role };
  } catch (err) {
    logger.error('Google login failed', { error: err });
    throw new AppError('Failed to authenticate with Google', 500);
  }
}
