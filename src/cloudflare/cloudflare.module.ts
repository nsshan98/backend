import { S3 } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudflareService } from './cloudflare.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'R2_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new S3({
          endpoint: config.getOrThrow('R2_ENDPOINT'),
          region: 'auto',
          credentials: {
            accessKeyId: config.getOrThrow<string>('R2_ACCESS_KEY_ID'),
            secretAccessKey: config.getOrThrow<string>('R2_SECRET_KEY'),
          },
        });
      },
    },
    CloudflareService,
  ],
  exports: ['R2_CLIENT', CloudflareService],
})
export class CloudflareModule {}
