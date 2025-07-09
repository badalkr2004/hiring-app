import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import prisma from "@/config/database";
import { hashPassword, comparePassword } from "@/utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { AuthRequest } from "@/middleware/auth";
import { ApiError } from "@/utils/ApiError";
import { validationResult } from "express-validator";
import { sendMail } from "@/utils/mail";

export const register = async (req: Request, res: Response) => {
  const {
    email,
    password,
    firstName,
    lastName,
    role = UserRole.USER,
    companyName,
    companySize,
    industry,
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && existingUser.isVerified) {
    throw new ApiError("User already exists with this email", 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Create user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailOtp: otp,
      isVerified: false,
      ...(role === UserRole.COMPANY &&
        companyName && {
          company: {
            upsert: {
              update: {
                name: companyName,
                size: companySize,
                industry,
              },
              create: {
                name: companyName,
                size: companySize,
                industry,
              },
            },
          },
        }),
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      emailOtp: otp,
      ...(role === UserRole.COMPANY &&
        companyName && {
          company: {
            create: {
              name: companyName,
              size: companySize,
              industry,
            },
          },
        }),
    },
    include: {
      company: true,
    },
  });

  // send otp to email
  const body = `
    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px 0;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
        <div style="text-align: center;">
          <img src="https://img.icons8.com/color/96/000000/lock--v1.png" alt="OTP" style="margin-bottom: 16px;" />
          <h2 style="color: #22223b; margin-bottom: 8px;">Verify Your Email Address</h2>
          <p style="color: #4a4e69; font-size: 16px; margin-bottom: 24px;">
            Please use the following One-Time Password (OTP) to verify your email address:
          </p>
          <div style="display: inline-block; background: #f2e9e4; border-radius: 6px; padding: 18px 32px; margin-bottom: 24px;">
            <span style="font-size: 32px; letter-spacing: 8px; color: #22223b; font-weight: bold;">${otp}</span>
          </div>
          <p style="color: #9a8c98; font-size: 14px; margin-top: 0;">
            This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
        <hr style="border: none; border-top: 1px solid #e0e1dd; margin: 32px 0 16px 0;">
        <p style="color: #bfc0c0; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} Job Flow. All rights reserved.
        </p>
      </div>
    </div>
  `;

  await sendMail(user.email, "OTP for email verification", body);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      message: "OTP sent to your email",
    },
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError("User not found", 404);
  }

  if (user.emailOtp !== otp) {
    throw new ApiError("Invalid OTP", 400);
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, emailOtp: null },
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
    message: "Email verified successfully",
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user with company data
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      company: true,
    },
  });

  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new ApiError("Account is deactivated", 401);
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError("Invalid credentials", 401);
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    },
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError("Refresh token required", 400);
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Check if refresh token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new ApiError("Invalid or expired refresh token", 401);
  }

  // Generate new access token
  const tokenPayload = {
    userId: storedToken.user.id,
    email: storedToken.user.email,
    role: storedToken.user.role,
  };

  const newAccessToken = generateAccessToken(tokenPayload);

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
    },
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Remove refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      company: true,
    },
    omit: {
      password: true,
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

export const changePassword = async (req: AuthRequest, res: Response) => {
  // 1. Handle validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user?.id; // make sure your auth middleware adds this
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(new ApiError("user not found", 404));
    }

    // 3. Compare current password
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // 4. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 5. Update password in DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res
      .status(500)
      .json(new ApiError("Failed to change the password", 400));
  }
};
