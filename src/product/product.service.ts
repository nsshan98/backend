import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/db/db.service';
import { products, users } from 'src/db/schema';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';

@Injectable()
export class ProductService {
  constructor(private readonly dbService: DrizzleService) {}

  async findOneWithProductId(id: string) {
    const product = await this.dbService.db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product fetched successfully',
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        cost_price: product.cost_price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        is_published: product.is_published,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    };
  }

  async findOneWithProductSlug(slug: string) {
    const product = await this.dbService.db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return {
      message: 'Product fetched successfully',
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        image_url: product.image_url,
        stock_quantity: product.stock_quantity,
        cost_price: product.cost_price,
        regular_price: product.regular_price,
        sale_price: product.sale_price,
        is_published: product.is_published,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    };
  }

  async createProduct(dto: CreateProductDto, user: typeof users.$inferSelect) {
    const slugExist = await this.dbService.db.query.products.findFirst({
      where: eq(products.slug, dto.slug),
    });

    if (slugExist) {
      throw new ConflictException('Product with this slug already exists');
    }

    const [product] = await this.dbService.db
      .insert(products)
      .values({ ...dto, user_id: user.id })
      .returning();

    return {
      message: 'Product created successfully',
      product,
    };
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    // file: Express.Multer.File,
    user: typeof users.$inferSelect,
  ) {
    const [product] = await this.dbService.db
      .update(products)
      .set(dto)
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }

    return {
      message: 'Product updated successfully',
      product,
    };
  }

  async deleteProduct(id: string, user: typeof users.$inferSelect) {
    const [product] = await this.dbService.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to delete this product',
      );
    }

    return {
      message: 'Product deleted successfully',
    };
  }

  async getAllProducts() {
    return await this.dbService.db
      .select()
      .from(products)
      .orderBy(desc(products.created_at));
  }
}
