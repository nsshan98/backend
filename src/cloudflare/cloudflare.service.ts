import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

@Injectable()
export class CloudflareService {
  private bucket: string;
  constructor(
    @Inject('R2_CLIENT') private r2: S3,
    private readonly config: ConfigService,
  ) {
    this.bucket = this.config.getOrThrow('R2_BUCKET');
  }

  async uploadImage(buffer: Buffer, key: string) {
    const optimized = await sharp(buffer)
      .resize(1200)
      .webp({ quality: 70 })
      .toBuffer();

    await this.r2.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: optimized,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return `${key}`;
  }
}
