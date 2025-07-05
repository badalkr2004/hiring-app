import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile
} from '@/controllers/authController';

const router = Router();

// Register
router.post('/register', [
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    body('role').optional().isIn(['USER', 'COMPANY']).withMessage('Invalid role'),
    body('companyName').optional().trim().isLength({ min: 1 })
  ])
], register);

// Login
router.post('/login', [
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ])
], login);

// Refresh token
router.post('/refresh', [
  validate([
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ])
], refreshToken);

// Logout
router.post('/logout', authenticate, logout);

// Get profile
router.get('/profile', authenticate, getProfile);

export default router;