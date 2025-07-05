import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/ApiError";
import { StringValue } from "ms";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new ApiError("JWT secret not configured", 500);
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as StringValue,
    issuer: "jobflow-api",
    audience: "jobflow-client",
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new ApiError("JWT refresh secret not configured", 500);
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as StringValue,
    issuer: "jobflow-api",
    audience: "jobflow-client",
  });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new ApiError("JWT refresh secret not configured", 500);
  }

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new ApiError("Invalid refresh token", 401);
  }
};
