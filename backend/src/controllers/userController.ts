import { Response } from "express";
import prisma from "@/config/database";
import { ApiError } from "@/utils/ApiError";
import { AuthRequest } from "@/middleware/auth";

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
      experience,
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
      company: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
};

export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    throw new ApiError("No file uploaded", 400);
  }
  console.log(req.user?.id, req.file.path);
  // Update the user's avatar URL in the database
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { avatar: req.file.path },
  });

  res.json({
    success: true,
    message: "Avatar uploaded successfully",
    data: { avatarUrl: req.file.path },
  });
};
