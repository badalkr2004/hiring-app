// utils/fileManager.ts
import cloudinary from "../config/cloudinary";

export class FileManager {
  // Delete file from Cloudinary
  static async deleteFile(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
  ) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      console.error("Error deleting file from Cloudinary:", error);
      throw error;
    }
  }

  // Delete multiple files
  static async deleteMultipleFiles(
    publicIds: string[],
    resourceType: "image" | "video" | "raw" = "image"
  ) {
    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      console.error("Error deleting multiple files from Cloudinary:", error);
      throw error;
    }
  }

  // Get file info
  static async getFileInfo(
    publicId: string,
    resourceType: "image" | "video" | "raw" = "image"
  ) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
      return result;
    } catch (error) {
      console.error("Error getting file info from Cloudinary:", error);
      throw error;
    }
  }

  // Generate optimized URL
  static generateOptimizedUrl(publicId: string, options: any = {}) {
    return cloudinary.url(publicId, {
      quality: "auto",
      fetch_format: "auto",
      ...options,
    });
  }

  // Extract public ID from Cloudinary URL
  static extractPublicId(cloudinaryUrl: string): string {
    const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : "";
  }
}
