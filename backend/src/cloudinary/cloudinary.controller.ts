import { Controller, Post, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class CloudinaryController {
    constructor(
        private cloudinaryService: CloudinaryService
    ){}

    @Post('img')
    @UseInterceptors(FilesInterceptor('files',15))
    async uploadImage(@UploadedFiles() files: Express.Multer.File[]) {
      const uploadResults = await Promise.all(
        files.map(file => this.cloudinaryService.uploadFile(file))
      );
      return uploadResults;
    }
}
