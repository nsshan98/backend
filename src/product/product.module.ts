import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CloudflareService } from 'src/cloudflare/cloudflare.service';
import { CloudflareModule } from 'src/cloudflare/cloudflare.module';

@Module({
  imports: [DbModule, CloudflareModule],
  controllers: [ProductController],
  providers: [ProductService, CloudflareService],
})
export class ProductModule {}
