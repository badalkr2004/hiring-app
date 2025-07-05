import { Response } from "express";
import prisma from "@/config/database";
import { ApiError } from "@/utils/ApiError";
import { AuthRequest } from "@/middleware/auth";

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const {
    firstName,
    lastName,
    phone,
    location,
    skills,
    experience,
    bio,
    education,
    linkedIn,
    github,
    portfolio,
  } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      firstName,
      lastName,
      phone,
      location,
      skills,
      experience,
      bio,
      education,
      linkedIn,
      github,
      portfolio,
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
      bio: true,
      education: true,
      linkedIn: true,
      github: true,
      portfolio: true,
      experience: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      company: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      avatar: req.body.url, // Assuming req.file.path contains the URL of the uploaded image
    },
  });
  res.json({
    success: true,
    message: "Avatar updated successfully",
  });
};
