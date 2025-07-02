import { Request, Response } from 'express';
import prisma from '@/config/database';
import { AppError } from '@/utils/AppError';
import { AuthRequest } from '@/middleware/auth';

export const getCompanies = async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, industry, verified } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (industry) {
    where.industry = { contains: industry as string, mode: 'insensitive' };
  }

  if (verified !== undefined) {
    where.verified = verified === 'true';
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        website: true,
        size: true,
        industry: true,
        location: true,
        foundedYear: true,
        verified: true,
        createdAt: true,
        _count: {
          select: {
            jobs: {
              where: { status: 'ACTIVE' }
            }
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

export const getCompanyById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: {
        where: { status: 'ACTIVE' },
        select: {
          id: true,
          title: true,
          location: true,
          type: true,
          salary: true,
          createdAt: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      _count: {
        select: {
          jobs: {
            where: { status: 'ACTIVE' }
          }
        }
      }
    }
  });

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  res.json({
    success: true,
    data: { company }
  });
};

export const updateCompany = async (req: AuthRequest, res: Response) => {
  const updateData = req.body;

  // Get user's company
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { company: true }
  });

  if (!user?.company) {
    throw new AppError('Company profile not found', 404);
  }

  const company = await prisma.company.update({
    where: { id: user.company.id },
    data: updateData
  });

  res.json({
    success: true,
    data: { company }
  });
};