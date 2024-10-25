"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinaryConfig_1 = __importDefault(require("../core/cloudinaryConfig"));
class CloudUploadService {
    static uploadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileType = file.mimetype.startsWith("video") ? "video" : "image";
            // Set resource_type based on file type (video or image)
            const result = yield cloudinaryConfig_1.default.uploader.upload(file.path, {
                resource_type: fileType,
                folder: "uploads",
                timeout: 60000, // Specify a folder if needed
            });
            return result.secure_url;
        });
    }
    static uploadFiles(files) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(files)) {
                // If it's an array, upload all files and return array of URLs
                const uploadPromises = files.map(file => CloudUploadService.uploadFile(file));
                return Promise.all(uploadPromises);
            }
            // Handle a single file upload
            return CloudUploadService.uploadFile(files);
        });
    }
}
exports.default = CloudUploadService;
