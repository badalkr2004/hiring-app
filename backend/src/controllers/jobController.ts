import { Request, Response } from 'express';
import { JobType, JobStatus } from '@prisma/client';
import prisma from '@/config/database';
import { AppError } from '@/utils/AppError';
import { AuthRequest } from '@/middleware/auth';

export const getJobs = async (req: Request, res: Response) => {
  const {
    search,
    location,
    type,
    category,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  // Build where clause
  const where: any = {
    status: JobStatus.ACTIVE,
    expiresAt: {
      gte: new Date()
    }
  };

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { company: { name: { contains: search as string, mode: 'insensitive' } } }
    ];
  }

  if (location) {
    where.location = { contains: location as string, mode: 'insensitive' };
  }

  if (type && type !== 'all') {
    where.type = type as JobType;
  }

  if (category && category !== 'all') {
    where.category = { contains: category as string, mode: 'insensitive' };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            verified: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        [sortBy as string]: sortOrder as 'asc' | 'desc'
      },
      skip,
      take: Number(limit)
    }),
    prisma.job.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};

export const getJobById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          description: true,
          logo: true,
          website: true,
          size: true,
          industry: true,
          location: true,
          verified: true
        }
      },
      _count: {
        select: {
          applications: true
        }
      }
    }
  });

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Increment view count
  await prisma.job.update({
    where: { id },
    data: { views: { increment: 1 } }
  });

  res.json({
    success: true,
    data: { job }
  });
};

export const createJob = async (req: AuthRequest, res: Response) => {
  const {
    title,
    description,
    requirements,
    benefits,
    location,
    type,
    category,
    salary,
    featured = false,
    expiresAt
  } = req.body;

  // Get user's company
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { company: true }
  });

  if (!user?.company) {
    throw new AppError('Company profile required to post jobs', 400);
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      requirements,
      benefits,
      location,
      type,
      category,
      salary,
      featured,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      companyId: user.company.id
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          verified: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: { job }
  });
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if job exists and user owns it
  const existingJob = await prisma.job.findUnique({
    where: { id },
    include: { company: { include: { user: true } } }
  });

  if (!existingJob) {
    throw new AppError('Job not found', 404);
  }

  if (existingJob.company.user.id !== req.user!.id) {
    throw new AppError('Not authorized to update this job', 403);
  }

  const job = await prisma.job.update({
    where: { id },
    data: updateData,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          verified: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: { job }
  });
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Check if job exists and user owns it
  const existingJob = await prisma.job.findUnique({
    where: { id },
    include: { company: { include: { user: true } } }
  });

  if (!existingJob) {
    throw new AppError('Job not found', 404);
  }

  if (existingJob.company.user.id !== req.user!.id) {
    throw new AppError('Not authorized to delete this job', 403);
  }

  await prisma.job.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
};

export const getCompanyJobs = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Get user's company
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { company: true }
  });

  if (!user?.company) {
    throw new AppError('Company profile not found', 404);
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: { companyId: user.company.id },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.job.count({
      where: { companyId: user.company.id }
    })
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};