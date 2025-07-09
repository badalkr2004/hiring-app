import { Response } from "express";
import prisma from "@/config/database";
import { ApiError } from "@/utils/ApiError";
import { AuthRequest } from "@/middleware/auth";
import { FileManager } from "../utils/fileManager";

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
    avatar,
    resume,
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
      avatar,
      resume,
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
      resume: true,
      company: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
};
export const updateProfilebyAdmin = async (req: AuthRequest, res: Response) => {
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
    avatar,
    resume,
  } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params!.id },
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
      avatar,
      resume,
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
      resume: true,
      company: true,
    },
  });

  res.json({
    success: true,
    data: { user },
  });
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      resume: true,
      company: true,
    },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

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
    data: {
      avatar: req.body.url, // Return the updated avatar URL
    },
  });
};

export const uploadResume = async (req: AuthRequest, res: Response) => {
  if (!req.body.url) {
    throw new ApiError("Resume URL is required", 400);
  }

  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      resume: req.body.url, // Assuming req.file.path contains the URL of the uploaded resume
    },
  });

  res.json({
    success: true,
    message: "Resume uploaded successfully",
  });
};

// get all users for admin dashboard
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, search } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    role: {
      not: "ADMIN", // Exclude admin users
    },
  };

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: "insensitive" } },
      { lastName: { contains: search as string, mode: "insensitive" } },
      { email: { contains: search as string, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
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
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      totalCount: total,
      pageInfo: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / take),
      },
    },
  });
};

// controllers/userController.ts (example)

export const updateUserAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      throw new ApiError("Avatar file is required", 400);
    }

    // Get current user to delete old avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Delete old avatar if exists
    if (currentUser?.avatar) {
      const oldPublicId = FileManager.extractPublicId(currentUser.avatar);
      if (oldPublicId) {
        await FileManager.deleteFile(oldPublicId, "image").catch(console.error);
      }
    }

    // Update user with new avatar URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: file.path }, // Cloudinary URL
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    res.json({
      message: "Avatar updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
};

// user resume handling
export const updateUserResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      throw new ApiError("No file uploaded", 400);
    }

    // Validate file type (additional check)
    const allowedMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ApiError("Invalid file type", 400);
    }

    // Get current user to delete old resume
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        resume: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!currentUser) {
      throw new ApiError("User not found", 404);
    }

    // Delete old resume from Cloudinary if exists
    if (currentUser.resume) {
      try {
        const oldPublicId = FileManager.extractPublicId(currentUser.resume);
        if (oldPublicId) {
          await FileManager.deleteFile(oldPublicId, "raw");
          console.log(`Deleted old resume: ${oldPublicId}`);
        }
      } catch (deleteError) {
        console.error("Error deleting old resume:", deleteError);
        // Continue with upload even if deletion fails
      }
    }
    // Update user with new resume URL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        resume: file.path, // Cloudinary URL
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        resume: true,
        updatedAt: true,
      },
    });

    // Log the resume update activity
    console.log(`Resume updated for user ${userId}: ${file.originalname}`);

    res.json({
      success: true,
      message: "Resume updated successfully",
      data: {
        user: updatedUser,
        resumeInfo: {
          originalName: file.originalname,
          size: file.size,
          uploadedAt: new Date(),
          url: file.path,
        },
      },
    });
  } catch (error) {
    console.error("Update resume error:", error);

    // If there was an error after file upload, try to clean up
    if (req.file?.path) {
      try {
        const publicId = FileManager.extractPublicId(req.file.path);
        if (publicId) {
          await FileManager.deleteFile(publicId, "raw");
        }
      } catch (cleanupError) {
        console.error("Error cleaning up uploaded file:", cleanupError);
      }
    }

    throw new ApiError("Failed to update resume", 500);
  }
};

export const getUserResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        resume: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (!user.resume) {
      throw new ApiError("No resume found", 404);
    }

    // Get file info from Cloudinary
    try {
      const publicId = FileManager.extractPublicId(user.resume);
      const fileInfo = await FileManager.getFileInfo(publicId, "raw");

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          resume: {
            url: user.resume,
            uploadedAt: user.updatedAt,
            size: fileInfo.bytes,
            format: fileInfo.format,
            originalFilename: fileInfo.original_filename,
          },
        },
      });
    } catch (cloudinaryError) {
      // If we can't get file info from Cloudinary, still return the URL
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          resume: {
            url: user.resume,
            uploadedAt: user.updatedAt,
          },
        },
      });
    }
  } catch (error) {
    console.error("Get user resume error:", error);
    res.status(500).json({
      error: "Failed to fetch resume",
      message: "An error occurred while fetching your resume",
    });
  }
};

export const deleteUserResume = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { resume: true },
    });

    if (!user || !user.resume) {
      throw new ApiError("No resume found", 404);
    }

    // Delete from Cloudinary
    try {
      const publicId = FileManager.extractPublicId(user.resume);
      if (publicId) {
        await FileManager.deleteFile(publicId, "raw");
        console.log(`Deleted resume: ${publicId}`);
      }
    } catch (deleteError) {
      console.error("Error deleting resume from Cloudinary:", deleteError);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Update user record
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        resume: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        resume: true,
      },
    });

    res.json({
      success: true,
      message: "Resume deleted successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({
      error: "Failed to delete resume",
      message: "An error occurred while deleting your resume",
    });
  }
};

// Get resume for job application (employers can view applicant resumes)
export const getApplicantResume = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user!.id;

    // First, verify that the requesting user is the employer for this application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: { userId: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            resume: true,
          },
        },
      },
    });

    if (!application) {
      throw new ApiError("Application not found", 404);
    }

    // Check if the requesting user is the employer
    if (application.job.company.userId !== userId) {
      throw new ApiError(
        "You can only view resumes for applications to your job postings",
        403
      );
    }

    if (!application.user.resume) {
      throw new ApiError("No resume found", 404);
    }

    // Get file info from Cloudinary
    try {
      const publicId = FileManager.extractPublicId(application.user.resume);
      const fileInfo = await FileManager.getFileInfo(publicId, "raw");

      res.json({
        success: true,
        data: {
          applicant: {
            id: application.user.id,
            firstName: application.user.firstName,
            lastName: application.user.lastName,
            email: application.user.email,
          },
          application: {
            id: application.id,
            status: application.status,
            appliedAt: application.createdAt,
          },
          resume: {
            url: application.user.resume,
            size: fileInfo.bytes,
            format: fileInfo.format,
            originalFilename: fileInfo.original_filename,
          },
        },
      });
    } catch (cloudinaryError) {
      // If we can't get file info, still return the URL
      res.json({
        success: true,
        data: {
          applicant: {
            id: application.user.id,
            firstName: application.user.firstName,
            lastName: application.user.lastName,
            email: application.user.email,
          },
          application: {
            id: application.id,
            status: application.status,
            appliedAt: application.createdAt,
          },
          resume: {
            url: application.user.resume,
          },
        },
      });
    }
  } catch (error) {
    console.error("Get applicant resume error:", error);
    throw new ApiError("Failed to fetch applicant resume", 500);
  }
};
