import cloudinary from "../core/cloudinaryConfig";

class CloudUploadService {
    static async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileType = file.mimetype.startsWith("video") ? "video" : "image";

        // Set resource_type based on file type (video or image)
        const result = await cloudinary.uploader.upload(file.path, {
            resource_type: fileType,
            folder: "uploads",
            timeout: 60000, // Specify a folder if needed
        });

        return result.secure_url;
    }

    static async uploadFiles(files: Express.Multer.File[] | Express.Multer.File): Promise<string | string[]> {
        if (Array.isArray(files)) {
            // If it's an array, upload all files and return array of URLs
            const uploadPromises = files.map(file => CloudUploadService.uploadFile(file));
            return Promise.all(uploadPromises);
        }

        // Handle a single file upload
        return CloudUploadService.uploadFile(files);
    }
}

export default CloudUploadService;
