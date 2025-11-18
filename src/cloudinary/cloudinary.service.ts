import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinaryType, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof cloudinaryType,
  ) {}

  async uploadImage(
    file?: Express.Multer.File,
    department: string = 'general',
  ): Promise<UploadApiResponse | null> {
    if (!file) return null;
    return new Promise((resolve, reject) => {
      const folderPath = `backend-drizzleorm/employees/${department}`;
      this.cloudinary.uploader
        .upload_stream(
          { folder: folderPath, resource_type: 'auto' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as UploadApiResponse);
          },
        )
        .end(file?.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return await this.cloudinary.uploader.destroy(publicId);
  }
}
