import { Module } from '@nestjs/common';
import { DbModule } from 'src/db/db.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [DbModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
