import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enum/role.enum';
import { AuthenticatedUser } from 'src/auth/decorators/authenticated-user.decorators';
import { users } from 'src/db/schema';
import { CreateProductDto } from './dto/createProduct.dto';
import { ImageUploadValidationPipe } from 'src/cloudinary/pipes/image-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFile(new ImageUploadValidationPipe({ required: false }))
    image: Express.Multer.File | null,
    @AuthenticatedUser() user: typeof users.$inferSelect,
  ) {
    return this.productService.createProduct(dto, user);
  }
}
