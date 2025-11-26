import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from 'src/db/db.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { users } from 'src/db/schema';
import { idempotency_keys } from 'src/db/schema/idempotencyKeys';
import { sql } from 'drizzle-orm';
import { orders } from 'src/db/schema/order';

@Injectable()
export class OrderService {
  constructor(private readonly dbService: DrizzleService) {}

  async createOrder(dto: CreateOrderDto, user: typeof users.$inferSelect) {
    if (!dto.idempotency_key) {
      throw new NotFoundException('Idempotency key is required');
    }

    if (dto.idempotency_key) {
      const existing = await this.dbService.db
        .select()
        .from(idempotency_keys)
        .where(sql`key = ${dto.idempotency_key}`);

      if (existing.length) {
        const rec = existing[0];
        const [order] = await this.dbService.db
          .select()
          .from(orders)
          .where(sql`id = ${rec.order_id}`);
        return { id: order.id, status: order.status };
      }
    }
  }
}
