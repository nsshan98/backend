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
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enum/role.enum';
import { AuthenticatedUser } from 'src/auth/decorators/authenticated-user.decorators';
import { users } from 'src/db/schema';
import { ImageUploadValidationPipe } from 'src/cloudinary/pipes/image-validation.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile(new ImageUploadValidationPipe({ required: false }))
    image: Express.Multer.File | null,
    @AuthenticatedUser() user: typeof users.$inferSelect,
  ) {
    return this.categoryService.createCategory(dto, user);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile(new ImageUploadValidationPipe({ required: false }))
    image: Express.Multer.File | null,
    @AuthenticatedUser()
    user: typeof users.$inferSelect,
  ) {
    const result = await this.categoryService.updateCategory(id, dto, user);

    return {
      message: 'Category updated successfully',
      category: result.category,
    };
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Delete('delete/:id')
  async deleteCategory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AuthenticatedUser()
    user: typeof users.$inferSelect,
  ) {
    return this.categoryService.deleteCategory(id, user);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('all-categories')
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('by-id/:id')
  async findOneWithCategoryId(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.findOneWithCategoryId(id);
  }

  @Roles(Role.SUPPA_DUPPA_ADMIN)
  @Get('by-slug/:slug')
  async findOneWithCategorySlug(@Param('slug') slug: string) {
    return this.categoryService.findOneWithCategorySlug(slug);
  }
}
