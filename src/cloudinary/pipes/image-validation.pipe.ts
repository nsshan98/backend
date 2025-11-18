import { BadRequestException, PipeTransform } from '@nestjs/common';

interface ImageUploadValidation {
  required?: boolean;
}

export class ImageUploadValidationPipe implements PipeTransform {
  constructor(private options: ImageUploadValidation = { required: true }) {}
  transform(file: Express.Multer.File | undefined) {
    const { required } = this.options;

    if (!file) {
      if (required) {
        throw new BadRequestException('File is required');
      } else {
        return undefined;
      }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      throw new BadRequestException('File size is too large');
    }

    return file;
  }
}
