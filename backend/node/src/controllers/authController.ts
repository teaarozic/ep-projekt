import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/middleware/authMiddleware.js';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from '@/services/authService.js';
import {
  registerSchema,
  loginSchema,
} from '@/utils/validation/authValidation.js';
import {
  forgotPassword,
  resetPassword,
  googleLoginUser,
} from '@/services/authService.js';
import { AppError } from '@/utils/AppError.js';
import passport from '@/config/passport.js';
import jwt from 'jsonwebtoken';

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await registerUser(email, password);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const tokens = await loginUser(email, password);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;
    const token = await refreshAccessToken(refreshToken);
    res.json({ success: true, data: token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (_req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const forgotPasswordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    await forgotPassword(email);
    res.status(200).json({
      success: true,
      message: 'If your email exists, a reset link has been sent.',
    });
  } catch (err) {
    next(err);
  }
};

export const resetPasswordController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      throw new AppError('Token and password are required', 400);

    await resetPassword(token, password);
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const googleLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.method === 'GET') {
      return passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
      })(req, res, next);
    }

    const { token } = req.body;
    if (!token) throw new AppError('Google token is required', 400);

    const tokens = await googleLoginUser(token);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
};

export const googleCallback = (req: AuthRequest, res: Response) => {
  const user = req.user as {
    id: number;
    email: string;
    name?: string;
    role?: string;
  };

  const jwtSecret = process.env.JWT_SECRET!;
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name || 'Unknown User',
      role: user.role || 'USER',
    },
    jwtSecret,
    { expiresIn: '1h' }
  );

  const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`;
  res.redirect(redirectUrl);
};
