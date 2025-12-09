import {
  ConflictException,
  ForbiddenException,
  Inject,
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
import { S3 } from '@aws-sdk/client-s3';
import { AuthenticatedUser } from 'src/auth/decorators/authenticated-user.decorators';

@Injectable()
export class ProductService {
  constructor(
    @Inject('R2_CLIENT') private readonly r2Client: S3,
    private readonly dbService: DrizzleService,
    private cloudflareService: CloudflareService,
  ) {}

  async findOneWithProductId(id: string, user: typeof users.$inferSelect) {
    const product = await this.dbService.db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to access this product',
      );
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

  async findOneWithProductSlug(slug: string, user: typeof users.$inferSelect) {
    const product = await this.dbService.db.query.products.findFirst({
      where: eq(products.slug, slug),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.user_id !== user.id) {
      throw new ForbiddenException(
        'You are not authorized to access this product',
      );
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
    user: typeof users.$inferSelect,
    file?: Express.Multer.File | null,
  ) {
    const slugExist = await this.dbService.db.query.products.findFirst({
      where: eq(products.slug, dto.slug),
    });

    if (slugExist) {
      throw new ConflictException('Product with this slug already exists');
    }

    const image: { key: string; url: string }[] = [];

    if (file) {
      const keyBase = `products/${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const uploaded = await this.cloudflareService.uploadImage(
        file.buffer,
        `${keyBase}_main.webp`,
      );

      image.push({
        key: `${keyBase}_main.webp`,
        url: `${process.env.R2_PUBLIC_DOMAIN}/${uploaded}`,
      });
    }

    const [product] = await this.dbService.db
      .insert(products)
      .values({ ...dto, image_url: image[0]?.url || null, user_id: user.id })
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
    file?: Express.Multer.File | null,
  ) {
    // 1. Fetch and validate existing product
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

    // 2. Validate slug uniqueness
    const { category_ids, ...updateData } = dto;

    if (updateData.slug && updateData.slug !== existingProduct.slug) {
      const slugExists = await this.dbService.db.query.products.findFirst({
        where: eq(products.slug, updateData.slug),
      });

      if (slugExists) {
        throw new ConflictException('Product with this slug already exists');
      }
    }

    // 3. Handle image logic
    let newImageUrl: string | null = existingProduct.image_url;
    let oldImageKey: string | null = null;

    // Extract old image key if exists
    if (existingProduct.image_url) {
      oldImageKey = existingProduct.image_url.split('.r2.dev/')[1];
    }

    // Determine if we should delete the old image
    const shouldDeleteImage = dto.image === null;
    const shouldUploadNewImage = file !== undefined && file !== null;

    if (shouldDeleteImage) {
      // User explicitly wants to remove the image
      newImageUrl = null;
    } else if (shouldUploadNewImage) {
      // Upload new image
      const keyBase = `products/${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const uploadedKey = await this.cloudflareService.uploadImage(
        file.buffer,
        `${keyBase}_main.webp`,
      );
      newImageUrl = `${process.env.R2_PUBLIC_DOMAIN}/${uploadedKey}`;
    } else {
      // Keep existing image - don't delete old key
      oldImageKey = null;
    }

    // 4. Update product and categories in transaction
    const updatedProduct = await this.dbService.db.transaction(async (tx) => {
      // Update product with new data
      const [product] = await tx
        .update(products)
        .set({
          ...updateData,
          image_url: newImageUrl,
          updated_at: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      // Update categories if provided
      if (category_ids !== undefined) {
        await tx
          .delete(productCategories)
          .where(eq(productCategories.product_id, id));

        if (category_ids.length > 0) {
          await tx.insert(productCategories).values(
            category_ids.map((categoryId) => ({
              product_id: product.id,
              category_id: categoryId,
            })),
          );
        }
      }

      return product;
    });

    // 5. Delete old image from R2 after successful DB update
    if (oldImageKey && (shouldDeleteImage || shouldUploadNewImage)) {
      try {
        await this.r2Client.deleteObject({
          Bucket: process.env.R2_BUCKET,
          Key: oldImageKey,
        });
      } catch (error) {
        console.error('Failed to delete old image:', error);
        // Don't throw - image deletion failure shouldn't break the update
      }
    }

    // 6. Fetch categories for response
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
        id: updatedProduct.id,
        name: updatedProduct.name,
        slug: updatedProduct.slug,
        description: updatedProduct.description,
        image_url: updatedProduct.image_url || null,
        stock_quantity: updatedProduct.stock_quantity,
        cost_price: updatedProduct.cost_price,
        regular_price: updatedProduct.regular_price,
        sale_price: updatedProduct.sale_price,
        is_published: updatedProduct.is_published,
        created_at: updatedProduct.created_at,
        updated_at: updatedProduct.updated_at,
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

  async getAllProducts(@AuthenticatedUser() user: typeof users.$inferSelect) {
    return await this.dbService.db
      .select()
      .from(products)
      .where(eq(products.user_id, user.id))
      .orderBy(desc(products.created_at));
  }
}
