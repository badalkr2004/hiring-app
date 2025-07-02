import { Router } from 'express';
import { body, query } from 'express-validator';
import { validate } from '@/middleware/validation';
import { authenticate, authorize, optionalAuth } from '@/middleware/auth';
import { UserRole } from '@prisma/client';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getCompanyJobs
} from '@/controllers/jobController';

const router = Router();

// Get all jobs (public)
router.get('/', [
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().trim(),
    query('location').optional().trim(),
    query('type').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP', 'all']),
    query('category').optional().trim(),
    query('sortBy').optional().isIn(['createdAt', 'title', 'salary', 'views']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ])
], optionalAuth, getJobs);

// Get job by ID (public)
router.get('/:id', getJobById);

// Get company's jobs
router.get('/company/my-jobs', authenticate, authorize(UserRole.COMPANY), getCompanyJobs);

// Create job
router.post('/', [
  authenticate,
  authorize(UserRole.COMPANY),
  validate([
    body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is needed'),
    body('benefits').optional().isArray(),
    body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
    body('type').isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP']),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('salary').trim().isLength({ min: 1 }).withMessage('Salary is required'),
    body('featured').optional().isBoolean(),
    body('expiresAt').optional().isISO8601()
  ])
], createJob);

// Update job
router.put('/:id', [
  authenticate,
  authorize(UserRole.COMPANY),
  validate([
    body('title').optional().trim().isLength({ min: 1 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('requirements').optional().isArray({ min: 1 }),
    body('benefits').optional().isArray(),
    body('location').optional().trim().isLength({ min: 1 }),
    body('type').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE', 'INTERNSHIP']),
    body('category').optional().trim().isLength({ min: 1 }),
    body('salary').optional().trim().isLength({ min: 1 }),
    body('featured').optional().isBoolean(),
    body('status').optional().isIn(['ACTIVE', 'CLOSED', 'DRAFT']),
    body('expiresAt').optional().isISO8601()
  ])
], updateJob);

// Delete job
router.delete('/:id', authenticate, authorize(UserRole.COMPANY), deleteJob);

export default router;