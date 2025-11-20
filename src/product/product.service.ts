import { ConflictException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from 'src/db/db.service';
import { products, users } from 'src/db/schema';
import { CreateProductDto } from './dto/createProduct.dto';

@Injectable()
export class ProductService {
  constructor(private readonly dbService: DrizzleService) {}

  async createProduct(dto: CreateProductDto, user: typeof users.$inferSelect) {
    const slugExist = await this.dbService.db
      .select()
      .from(products)
      .where(eq(products.slug, dto.slug))
      .limit(1)
      .execute();

    if (slugExist.length > 0) {
      throw new ConflictException('Product with this slug already exists');
    }

    const newProduct = await this.dbService.db
      .insert(products)
      .values({ ...dto, user_id: user.id })
      .returning()
      .execute();

    return {
      message: 'Product created successfully',
      newProduct,
    };
  }
}
