import { Request, Response } from "express";
import { ApplicationStatus } from "@prisma/client";
import prisma from "@/config/database";
import { ApiError } from "@/utils/ApiError";
import { AuthRequest } from "@/middleware/auth";

export const applyToJob = async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;
  const { coverLetter, resume } = req.body;

  // Check if job exists and is active
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { company: true },
  });

  if (!job) {
    throw new ApiError("Job not found", 404);
  }

  if (job.status !== "ACTIVE") {
    throw new ApiError("Job is no longer accepting applications", 400);
  }

  // Check if user already applied
  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_jobId: {
        userId: req.user!.id,
        jobId,
      },
    },
  });

  if (existingApplication) {
    throw new ApiError("You have already applied to this job", 409);
  }

  // Create application
  const application = await prisma.application.create({
    data: {
      userId: req.user!.id,
      jobId,
      coverLetter,
      resume,
    },
    include: {
      job: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: { application },
  });
};

export const getUserApplications = async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {
    userId: req.user!.id,
  };

  if (status && status !== "all") {
    where.status = status as ApplicationStatus;
  }

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                verified: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.application.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

export const getCompanyApplications = async (
  req: AuthRequest,
  res: Response
) => {
  const { page = 1, limit = 10, status, jobId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  // Get user's company
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { company: true },
  });

  if (!user?.company) {
    throw new ApiError("Company profile not found", 404);
  }

  const where: any = {
    job: {
      companyId: user.company.id,
    },
  };

  if (status && status !== "all") {
    where.status = status as ApplicationStatus;
  }

  if (jobId) {
    where.jobId = jobId as string;
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
            email: true,
            avatar: true,
            phone: true,
            location: true,
            skills: true,
            experience: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    }),
    prisma.application.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    },
  });
};

export const updateApplicationStatus = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  // Check if application exists and user owns the company
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: {
        include: {
          company: {
            include: { user: true },
          },
        },
      },
    },
  });

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  if (application.job.company.user.id !== req.user!.id) {
    throw new ApiError("Not authorized to update this application", 403);
  }

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: {
      status,
      notes,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: { application: updatedApplication },
  });
};

export const getApplicationById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          phone: true,
          location: true,
          skills: true,
          experience: true,
          resume: true,
        },
      },
      job: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              verified: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  // Check if user can access this application
  const canAccess =
    application.userId === req.user!.id || // User owns the application
    (await prisma.user.findFirst({
      where: {
        id: req.user!.id,
        company: {
          jobs: {
            some: { id: application.jobId },
          },
        },
      },
    })); // User owns the company that posted the job

  if (!canAccess) {
    throw new ApiError("Not authorized to view this application", 403);
  }

  res.json({
    success: true,
    data: { application },
  });
};

export const withdrawApplication = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new ApiError("Application not found", 404);
  }

  if (application.userId !== req.user!.id) {
    throw new ApiError("Not authorized to withdraw this application", 403);
  }

  if (application.status === ApplicationStatus.HIRED) {
    throw new ApiError("Cannot withdraw a hired application", 400);
  }

  await prisma.application.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: "Application withdrawn successfully",
  });
};

export const userApplicationStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    // Extract user ID from the authenticated request
    const userId = req.user!.id;

    // Extract jobId from query parameters
    const jobId = req.query.jobId as string;

    // Validate that jobId exists
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required.",
      });
    }

    // Query the database to check if the user has applied for the job
    const application = await prisma.application.findFirst({
      where: {
        userId: userId,
        jobId: jobId,
      },
    });

    // Respond with the application status
    if (application) {
      return res.json({
        success: true,
        data: {
          applied: true,
          applicationId: application.id, // Optional: Include application ID if needed
        },
      });
    } else {
      return res.json({
        success: true,
        data: {
          applied: false,
        },
      });
    }
  } catch (error) {
    console.error("Error checking application status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while checking application status.",
    });
  }
};

export const getApplicationByJobId = async (
  req: AuthRequest,
  res: Response
) => {
  const { jobId } = req.params;

  if (!jobId) {
    throw new ApiError("Job ID is required", 400);
  }

  // Get applications for the job
  const applications = await prisma.application.findMany({
    where: { jobId: jobId as string },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatar: true,
          resume: true,
          phone: true,
          location: true,
          skills: true,
          experience: true,
          github: true,
          linkedIn: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          type: true,
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: { applications },
  });
};
