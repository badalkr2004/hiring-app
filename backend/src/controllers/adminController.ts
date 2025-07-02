import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import prisma from '@/config/database';
import { AppError } from '@/utils/AppError';
import { AuthRequest } from '@/middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalCompanies,
    totalJobs,
    activeJobs,
    totalApplications,
    pendingApplications,
    newUsersThisMonth,
    newJobsThisMonth
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: UserRole.ADMIN } } }),
    prisma.company.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'PENDING' } }),
    prisma.user.count({
      where: {
        role: { not: UserRole.ADMIN },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    }),
    prisma.job.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCompanies,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      newUsersThisMonth,
      newJobsThisMonth
    }
  });
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, role, search, isActive } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    role: { not: UserRole.ADMIN }
  };

  if (role && role !== 'all') {
    where.role = role as UserRole;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        location: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            verified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};

export const getAllCompanies = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, verified, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (verified !== undefined) {
    where.verified = verified === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { industry: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            jobs: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.company.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      companies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === UserRole.ADMIN) {
    throw new AppError('Cannot modify admin users', 403);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      isVerified: true
    }
  });

  res.json({
    success: true,
    data: { user: updatedUser }
  });
};

export const verifyCompany = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const company = await prisma.company.findUnique({
    where: { id }
  });

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  const updatedCompany = await prisma.company.update({
    where: { id },
    data: { verified: true },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  res.json({
    success: true,
    data: { company: updatedCompany }
  });
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === UserRole.ADMIN) {
    throw new AppError('Cannot delete admin users', 403);
  }

  await prisma.user.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (status && status !== 'all') {
    where.status = status;
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    }),
    prisma.application.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
};