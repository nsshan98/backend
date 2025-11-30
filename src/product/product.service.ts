import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DrizzleService } from 'src/db/db.service';
import { categories, products, users } from 'src/db/schema';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { productCategories } from 'src/db/schema/productCategories';
import { CloudflareService } from 'src/cloudflare/cloudflare.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly dbService: DrizzleService,
    private cloudflareService: CloudflareService,
  ) {}

  async findOneWithProductId(id: string) {
    const product = await this.dbService.db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const categoryWithProduct = await this.dbService.db
      .select({
        cat: categories,
      })
      .from(productCategories)
      .leftJoin(categories, eq(categories.id, productCategories.category_id))
      .where(eq(productCategories.product_id, id));

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
        categories: categoryWithProduct.map((category) => {
          return {
            id: category.cat?.id,
            name: category.cat?.name,
          };
        }),
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
    const categoryWithProduct = await this.dbService.db
      .select({
        cat: categories,
      })
      .from(productCategories)
      .leftJoin(categories, eq(categories.id, productCategories.category_id))
      .where(eq(productCategories.product_id, product.id));

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
        categories: categoryWithProduct.map((category) => {
          return {
            id: category.cat?.id,
            name: category.cat?.name,
          };
        }),
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    };
  }

  async createProduct(
    dto: CreateProductDto,
    file: Express.Multer.File,
    user: typeof users.$inferSelect,
  ) {
    const slugExist = await this.dbService.db.query.products.findFirst({
      where: eq(products.slug, dto.slug),
    });

    if (slugExist) {
      throw new ConflictException('Product with this slug already exists');
    }

    let image: { key: string; url: string }[] = [];

    if (file) {
      const keyBase = `products/${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const uploaded = await this.cloudflareService.uploadImage(
        file.buffer,
        `${keyBase}_main.webp`,
      );

      image.push({
        key: `${keyBase}_main.webp`,
        url: uploaded,
      });
    }

    const [product] = await this.dbService.db
      .insert(products)
      .values({ ...dto, image_url: image[0].url, user_id: user.id })
      .returning();

    if (dto.category_ids?.length) {
      await this.dbService.db.insert(productCategories).values(
        dto.category_ids.map((categoryId) => ({
          product_id: product.id,
          category_id: categoryId,
        })),
      );
    }

    const category = await this.dbService.db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.category_id, categories.id))
      .where(eq(productCategories.product_id, product.id));

    return {
      message: 'Product created successfully',
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
        category,
      },
    };
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    user: typeof users.$inferSelect,
  ) {
    const existingProduct = await this.dbService.db.query.products.findFirst({
      where: eq(products.id, id),
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (existingProduct.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to update this product',
      );
    }

    const { category_ids, ...updateData } = dto;

    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const slugExist = await this.dbService.db.query.products.findFirst({
        where: eq(products.slug, updateData.slug),
      });

      if (slugExist) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    let product = existingProduct;
    const hasProductUpdates = Object.keys(updateData).length > 0;

    if (hasProductUpdates) {
      [product] = await this.dbService.db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();
    }

    if (category_ids !== undefined) {
      await this.dbService.db
        .delete(productCategories)
        .where(eq(productCategories.product_id, id));

      if (category_ids.length > 0) {
        await this.dbService.db.insert(productCategories).values(
          category_ids.map((categoryId) => ({
            product_id: product.id,
            category_id: categoryId,
          })),
        );
      }
    }

    const category = await this.dbService.db
      .select({
        id: categories.id,
        name: categories.name,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.category_id, categories.id))
      .where(eq(productCategories.product_id, id));

    return {
      message: 'Product updated successfully',
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
        category,
      },
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
