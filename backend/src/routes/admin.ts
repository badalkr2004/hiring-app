import { Router } from 'express';
import { query, param, body } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authenticate, authorize } from '@/middleware/auth';
import { UserRole } from '@prisma/client';
import {
  getDashboardStats,
  getAllUsers,
  getAllCompanies,
  updateUserStatus,
  verifyCompany,
  deleteUser,
  getAllApplications
} from '@/controllers/adminController';

const router = Router();

// All admin routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', [
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('role').optional().isIn(['USER', 'COMPANY', 'all']),
    query('search').optional().trim(),
    query('isActive').optional().isBoolean()
  ])
], getAllUsers);

router.patch('/users/:id/status', [
  validate([
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('isActive').isBoolean().withMessage('isActive must be a boolean')
  ])
], updateUserStatus);

router.delete('/users/:id', [
  validate([
    param('id').isMongoId().withMessage('Invalid user ID')
  ])
], deleteUser);

// Company management
router.get('/companies', [
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('verified').optional().isBoolean(),
    query('search').optional().trim()
  ])
], getAllCompanies);

router.patch('/companies/:id/verify', [
  validate([
    param('id').isMongoId().withMessage('Invalid company ID')
  ])
], verifyCompany);

// Application management
router.get('/applications', [
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED', 'all'])
  ])
], getAllApplications);

export default router;