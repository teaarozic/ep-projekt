import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  googleLogin,
  googleCallback,
  forgotPasswordController,
  resetPasswordController,
} from '@/controllers/authController.js';
import passport from '@/config/passport.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);

router.get('/google', googleLogin);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

router.post('/google', googleLogin);

export default router;
