import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger.js';

export async function sendResetEmail(to: string, link: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"TaskFlow Support" <support@taskflow.com>',
      to,
      subject: 'Reset your TaskFlow password',
      html: `
        <h2>Reset your password</h2>
        <p>Click the link below to create a new password:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    logger.info('Reset password email sent', {
      messageId: info.messageId,
      to,
    });
  } catch (error) {
    logger.error('Failed to send reset email', { error, to });
    throw new Error('Unable to send password reset email.');
  }
}
