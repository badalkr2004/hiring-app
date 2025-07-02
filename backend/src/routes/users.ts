import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import { updateProfile, uploadAvatar } from '@/controllers/userController';

const router = Router();

// Update profile
router.put('/profile', [
  authenticate,
  validate([
    body('firstName').optional().trim().isLength({ min: 1 }),
    body('lastName').optional().trim().isLength({ min: 1 }),
    body('phone').optional().trim(),
    body('location').optional().trim(),
    body('skills').optional().isArray(),
    body('experience').optional().trim()
  ])
], updateProfile);

// Upload avatar
router.post('/avatar', authenticate, uploadAvatar);

export default router;