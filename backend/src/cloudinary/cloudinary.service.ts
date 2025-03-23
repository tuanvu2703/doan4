import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {

    /**
   * Tự động chọn phương thức tải lên phù hợp dựa trên kích thước tệp và MIME type.
   * @param file Tệp được tải lên.
   * @returns URL của tệp được tải lên.
   */
    async uploadFile(file: Express.Multer.File): Promise<string> {
      // Đặt kích thước tối đa cho upload_stream
      const MAX_STREAM_SIZE = 10 * 1024 * 1024; // 10 MB
  
      // Kiểm tra loại tài nguyên dựa trên MIME type
      const resourceType = file.mimetype.startsWith('image/')
        ? 'image'
        : file.mimetype.startsWith('video/')
        ? 'video'
        : 'auto';
  
      // Nếu tệp lớn hơn MAX_STREAM_SIZE, sử dụng upload_large
      if (file.size > MAX_STREAM_SIZE) {
        console.log(`Using upload_large for file: ${file.originalname}, size: ${file.size}`);
        return this.uploadLargeFile(file, resourceType);
      }
  
      // Sử dụng upload_stream cho tệp nhỏ hơn MAX_STREAM_SIZE
      console.log(`Using upload_stream for file: ${file.originalname}, size: ${file.size}`);
      return this.uploadStream(file, resourceType);
    }
  
    /**
     * Tải lên tệp nhỏ bằng phương thức upload_stream.
     * @param file Tệp được tải lên.
     * @param resourceType Loại tài nguyên (image, video, auto).
     */
    private async uploadStream(file: Express.Multer.File, resourceType: string): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: resourceType }, // Đặt loại tài nguyên
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          },
        );
  
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    }
  
    /**
     * Tải lên tệp lớn bằng phương thức upload_large.
     * @param file Tệp được tải lên.
     * @param resourceType Loại tài nguyên (image, video, auto).
     */
    private async uploadLargeFile(file: Express.Multer.File, resourceType: string): Promise<string> {
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload_large(
          `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, // Tải lên theo dạng base64
          { resource_type: resourceType }, // Đặt loại tài nguyên
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          },
        );
      });
    }
  }
