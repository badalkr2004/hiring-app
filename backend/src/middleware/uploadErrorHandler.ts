// middleware/uploadErrorHandler.ts
import { ApiError } from "@/utils/ApiError";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Upload error:", error);

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        throw new ApiError("File too large", 400, {
          error: "File too large",
          message: `File size should not exceed the allowed limit`,
          code: "FILE_TOO_LARGE",
        });
      case "LIMIT_FILE_COUNT":
        throw new ApiError("Too many files", 400, {
          message: "Maximum number of files exceeded",
          code: "TOO_MANY_FILES",
        });

      case "LIMIT_UNEXPECTED_FILE":
        throw new ApiError("Unexpected file", 400, {
          message: `Unexpected file: ${error.field}`,
          code: "UNEXPECTED_FILE",
        });
      default:
        throw new ApiError("Upload error", 400, {
          error: "Upload error",
          message: error.message,
          code: "UPLOAD_ERROR",
        });
    }
  }

  // Cloudinary specific errors
  if (error.message?.includes("Invalid image file")) {
    throw new ApiError("Invalid image", 400, {
      error: "Invalid file",
      message: "The uploaded file is not a valid image",
      code: "INVALID_IMAGE",
    });
  }

  if (error.message?.includes("File size too large")) {
    throw new ApiError("File too large", 400, {
      error: "File too large",
      message: "File exceeds the maximum allowed size",
      code: "FILE_TOO_LARGE",
    });
  }

  if (error.message?.includes("Invalid file type")) {
    throw new ApiError("Invalid file type", 400, {
      error: "Invalid file type",
      message: error.message,
      code: "INVALID_FILE_TYPE",
    });
  }

  // Network or Cloudinary API errors
  if (error.http_code) {
    throw new ApiError("Upload service error", 500, {
      error: "Upload service error",
      message: error.message,
      code: "CLOUD_UPLOAD_ERROR",
    });
  }

  next(error);
};
