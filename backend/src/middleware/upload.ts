// middleware/upload.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import { Request } from "express";
import path from "path";
import { AuthRequest } from "./auth";

// Define folder structure for different file types
const getFolderPath = (fieldname: string, req: Request): string => {
  const basePath = "job-platform";

  switch (fieldname) {
    case "avatar":
      return req.baseUrl.includes("community")
        ? `${basePath}/community-images/avatars`
        : `${basePath}/user-avatars`;
    case "banner":
      return `${basePath}/community-images/banners`;
    case "logo":
      return `${basePath}/company-logos`;
    case "resume":
      return `${basePath}/resumes`;
    case "file":
      return `${basePath}/chat-files`;
    default:
      return `${basePath}/misc`;
  }
};

// Get resource type based on file type
const getResourceType = (mimetype: string): "image" | "video" | "raw" => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
};

// Get allowed formats based on field name
const getAllowedFormats = (fieldname: string): string[] => {
  switch (fieldname) {
    case "avatar":
    case "banner":
    case "logo":
      return ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    case "resume":
      return ["pdf", "doc", "docx"];
    case "file":
      return [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "pdf",
        "doc",
        "docx",
        "txt",
        "csv",
        "zip",
        "rar",
      ];
    default:
      return [];
  }
};

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: AuthRequest, file: Express.Multer.File) => {
    const folder = getFolderPath(file.fieldname, req);
    const resourceType = getResourceType(file.mimetype);
    const allowedFormats = getAllowedFormats(file.fieldname);

    // Generate unique public_id
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = path
      .parse(file.originalname)
      .name.replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 20);

    const publicId = `${originalName}_${timestamp}_${randomString}`;

    return {
      folder,
      resource_type: resourceType,
      public_id: publicId,
      allowed_formats: allowedFormats,
      // Transformation based on file type
      transformation: getTransformation(file.fieldname, resourceType),
      // Add tags for better organization
      tags: [file.fieldname, req.user?.id || "anonymous"],
    };
  },
});

// Get transformation settings based on field type
const getTransformation = (fieldname: string, resourceType: string) => {
  if (resourceType !== "image") return undefined;

  switch (fieldname) {
    case "avatar":
      return [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ];
    case "banner":
      return [
        { width: 1200, height: 400, crop: "fill" },
        { quality: "auto", fetch_format: "auto" },
      ];
    case "logo":
      return [
        { width: 300, height: 300, crop: "fit" },
        { quality: "auto", fetch_format: "auto" },
      ];
    case "file":
      return [
        { width: 800, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ];
    default:
      return [{ quality: "auto", fetch_format: "auto" }];
  }
};

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes: { [key: string]: string[] } = {
    avatar: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    banner: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
    logo: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ],
    resume: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    file: [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
      // Archives
      "application/zip",
      "application/x-rar-compressed",
    ],
  };

  const fieldAllowedTypes = allowedTypes[file.fieldname] || allowedTypes.file;

  if (fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type for ${
          file.fieldname
        }. Allowed types: ${fieldAllowedTypes.join(", ")}`
      )
    );
  }
};

// Size limits configuration
const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB default
  files: 5,
  fields: 10,
  fieldNameSize: 50,
  fieldSize: 1024 * 1024,
};

// Main upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Specific upload configurations
export const uploadAvatarFile = multer({
  storage,
  fileFilter,
  limits: {
    ...limits,
    fileSize: 5 * 1024 * 1024, // 5MB for images (Cloudinary will optimize)
    files: 1,
  },
});

export const uploadResumeFile = multer({
  storage,
  fileFilter,
  limits: {
    ...limits,
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

export const uploadChatFile = multer({
  storage,
  fileFilter,
  limits: {
    ...limits,
    fileSize: 15 * 1024 * 1024, // 15MB
    files: 1,
  },
});

export const uploadCommunityImages = multer({
  storage,
  fileFilter,
  limits: {
    ...limits,
    fileSize: 8 * 1024 * 1024, // 8MB
    files: 2,
  },
});

export const uploadMultipleFiles = multer({
  storage,
  fileFilter,
  limits: {
    ...limits,
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});
