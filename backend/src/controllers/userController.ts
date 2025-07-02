import { Response } from 'express';
import prisma from '@/config/database';
import { AppError } from '@/utils/AppError';
import { AuthRequest } from '@/middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { firstName, lastName, phone, location, skills, experience } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      firstName,
      lastName,
      phone,
      location,
      skills,
      experience
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      avatar: true,
      phone: true,
      location: true,
      skills: true,
      experience: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      company: true
    }
  });

  res.json({
    success: true,
    data: { user }
  });
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  // This would typically handle file upload to cloud storage
  // For now, we'll just return a placeholder
  res.json({
    success: true,
    message: 'Avatar upload endpoint - implement with multer and cloudinary'
  });
};