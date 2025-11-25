import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status').notNull().default('pending'),
  payment_status: varchar('payment_status').notNull().default('pending'),

  shipping_address: varchar('shipping_address').notNull(),
  shipping_phone_number: varchar('shipping_phone_number').notNull(),
  shipping_email: varchar('shipping_email'),
  shipping_line1: varchar('shipping_line1'),
  shipping_city: varchar('shipping_city'),
  shipping_district: varchar('shipping_district'),
  shipping_instructions: varchar('shipping_instructions'),

  sub_total: integer('sub_total'),
  shipping_cost: integer('shipping_cost').notNull().default(0),
  tax_total: integer('tax_total').notNull().default(0),
  discount_total: integer('discount_total').notNull().default(0),
  total: integer('total').notNull(),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
});
