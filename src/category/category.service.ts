import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/db/db.service';
import { categories, users } from 'src/db/schema';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly dbService: DrizzleService) {}

  async findOneWithCategoryId(id: string) {
    const category = await this.dbService.db.query.categories.findFirst({
      where: eq(categories.id, id),
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      message: 'Category fetched successfully',
      product: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        is_published: category.is_published,
        created_at: category.created_at,
        updated_at: category.updated_at,
      },
    };
  }

  async findOneWithCategorySlug(slug: string) {
    const category = await this.dbService.db.query.categories.findFirst({
      where: eq(categories.slug, slug),
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return {
      message: 'Category fetched successfully',
      product: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_url: category.image_url,
        is_published: category.is_published,
        created_at: category.created_at,
        updated_at: category.updated_at,
      },
    };
  }
  async createCategory(
    dto: CreateCategoryDto,
    user: typeof users.$inferSelect,
  ) {
    const slugExist = await this.dbService.db.query.categories.findFirst({
      where: eq(categories.slug, dto.slug),
    });

    if (slugExist) {
      throw new ConflictException('Category with this slug already exists');
    }

    const [category] = await this.dbService.db
      .insert(categories)
      .values({ ...dto, user_id: user.id })
      .returning();

    return {
      message: 'Category created successfully',
      category,
    };
  }

  async updateCategory(
    id: string,
    dto: UpdateCategoryDto,
    // file: Express.Multer.File,
    user: typeof users.$inferSelect,
  ) {
    const [category] = await this.dbService.db
      .update(categories)
      .set(dto)
      .where(eq(categories.id, id))
      .returning();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this category',
      );
    }

    return {
      message: 'Category updated successfully',
      category,
    };
  }

  async deleteCategory(id: string, user: typeof users.$inferSelect) {
    const [category] = await this.dbService.db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this category',
      );
    }

    return {
      message: 'Category deleted successfully',
    };
  }

  async getAllCategories() {
    return await this.dbService.db
      .select()
      .from(categories)
      .orderBy(desc(categories.created_at));
  }
}
