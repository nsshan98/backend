import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateProductDto } from './dto/updateProduct.dto';

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

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile(new ImageUploadValidationPipe({ required: false }))
    image: Express.Multer.File | null,
    @AuthenticatedUser()
    user: typeof users.$inferSelect,
  ) {
    return await this.productService.updateProduct(id, dto, user);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Delete('delete/:id')
  async deleteProduct(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthenticatedUser()
    user: typeof users.$inferSelect,
  ) {
    return this.productService.deleteProduct(id, user);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('all-products')
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('by-id/:id')
  async findOneWithProductId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.productService.findOneWithProductId(id);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN, Role.USER)
  @Get('by-slug/:slug')
  async findOneWithProductSlug(@Param('slug') slug: string) {
    return this.productService.findOneWithProductSlug(slug);
  }
}
