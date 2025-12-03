import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleService } from 'src/db/db.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { orderItems, products, users } from 'src/db/schema';
import { idempotency_keys } from 'src/db/schema/idempotencyKeys';
import { inArray, sql } from 'drizzle-orm';
import { orders } from 'src/db/schema/order';
import Decimal from 'decimal.js';
import { user_addresses } from 'src/db/schema/userAddress';

interface PreparedOrderItem {
  product: typeof products.$inferSelect;
  quantity: number;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  subTotal: string;
}

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

    return await this.dbService.db.transaction(async (tx) => {
      const productIds = dto.items.map((item) => item.product_id);
      const productRows = await tx
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
        .for('update');
      const prodMap = new Map(productRows.map((p) => [String(p.id), p]));

      let subTotal = 0;
      const itemsToInsert: PreparedOrderItem[] = [];

      for (const itm of dto.items) {
        const p = prodMap.get(itm.product_id);
        if (!p) {
          throw new NotFoundException('Product not found');
        }
        if (p.stock_quantity < itm.quantity) {
          throw new BadRequestException('Insufficient stock');
        }
        const unitPrice = new Decimal(p.regular_price.toString());
        const qty = new Decimal(itm.quantity);
        const lineSubtotal = unitPrice.mul(qty);
        subTotal += lineSubtotal.toNumber();

        itemsToInsert.push({
          product: p,
          quantity: itm.quantity,
          product_name_snapshot: p.name,
          unit_price_snapshot: p.regular_price,
          subTotal: lineSubtotal.toFixed(2),
        });
      }

      const shippingCost = new Decimal(dto.shipping_cost);
      const taxTotal = new Decimal(dto.tax_total);
      const discountTotal = new Decimal(dto.discount_total);
      const total =
        subTotal +
        shippingCost.toNumber() +
        taxTotal.toNumber() -
        discountTotal.toNumber();

      const [createdOrder] = await tx
        .insert(orders)
        .values({
          label: dto.shipping_address.label ?? 'Home',
          address: dto.shipping_address.address,
          phone: dto.shipping_address.phone,
          line1: dto.shipping_address.line1 ?? '',
          line2: dto.shipping_address.line2 ?? '',
          district: dto.shipping_address.district,
          upazila: dto.shipping_address.upazila ?? '',
          area: dto.shipping_address.area ?? '',
          post_code: dto.shipping_address.post_code,

          sub_total: subTotal.toFixed(2),
          shipping_cost: shippingCost.toFixed(2),
          tax_total: taxTotal.toFixed(2),
          discount_total: discountTotal.toFixed(2),
          total: total.toFixed(2),

          status: 'pending',
          payment_status: 'unpaid',

          shipping_instructions: dto.shipping_instructions ?? '',

          user_id: user.id,
        })
        .returning();

      // Batch insert all order items at once
      await tx.insert(orderItems).values(
        itemsToInsert.map((itms) => ({
          order_id: createdOrder.id,
          product_id: itms.product.id,
          product_name: itms.product_name_snapshot,
          unit_price: itms.unit_price_snapshot.toString(),
          quantity: itms.quantity.toString(),
          total_price: itms.subTotal,
          cost_price: itms.product.cost_price.toString(),
          discounted_price: itms.product.sale_price?.toString() ?? null,
          product_image: itms.product.image_url?.[0] ?? null,
        })),
      );

      // Update stock quantities for each product
      for (const itms of itemsToInsert) {
        await tx
          .update(products)
          .set({ stock_quantity: sql`stock_quantity - ${itms.quantity}` })
          .where(
            sql`id = ${itms.product.id} AND stock_quantity >= ${itms.quantity}`,
          );
      }

      if (dto.shipping_address && dto.should_save_address) {
        await tx.insert(user_addresses).values({
          user_id: user.id,
          label: dto.shipping_address.label,
          address: dto.shipping_address.address,
          phone: dto.shipping_address.phone,
          line1: dto.shipping_address.line1,
          line2: dto.shipping_address.line2,
          district: dto.shipping_address.district,
          upazila: dto.shipping_address.upazila,
          area: dto.shipping_address.area,
          post_code: dto.shipping_address.post_code,
          country: dto.shipping_address.country,
          latitude: dto.shipping_address.latitude,
          longitude: dto.shipping_address.longitude,
          is_default: true,
        });
      }

      if (dto.idempotency_key) {
        await tx.insert(idempotency_keys).values({
          key: dto.idempotency_key,
          user_id: user.id,
          order_id: createdOrder.id,
        });
      }

      return {
        id: createdOrder.id,
        status: createdOrder.status,
        items: itemsToInsert.map((item) => ({
          product_id: item.product.id,
          product_name: item.product_name_snapshot,
          quantity: item.quantity,
          unit_price: item.unit_price_snapshot,
          total_price: item.subTotal,
        })),
      };
    });
  }

  async getAllOrders() {
    return await this.dbService.db.select().from(orders);
  }
}
