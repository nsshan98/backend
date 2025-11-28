import { numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { orders } from './order';
import { products } from './product';

export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),

  order_id: uuid('order_id')
    .references(() => orders.id)
    .notNull(),

  product_id: uuid('product_id')
    .references(() => products.id)
    .notNull(),

  product_name: text('product_name').notNull(),
  product_image: text('product_image'),
  cost_price: numeric('cost_price').notNull(),
  unit_price: numeric('unit_price').notNull(),
  discounted_price: numeric('discounted_price'),
  quantity: numeric('quantity').notNull(),
  total_price: numeric('total_price').notNull(),

  created_at: timestamp('created_at').defaultNow(),
});
