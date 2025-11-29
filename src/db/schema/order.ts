import {
  numeric,
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

  label: varchar('label').notNull(),
  address: varchar('address').notNull(),
  phone: varchar('phone').notNull(),
  line1: varchar('line1'),
  line2: varchar('line2'),
  district: varchar('district').notNull(),
  upazila: varchar('upazila'),
  area: varchar('area'),
  post_code: varchar('post_code').notNull(),
  country: varchar('country'),
  latitude: varchar('latitude'),
  longitude: varchar('longitude'),
  is_default: varchar('is_default'),

  shipping_instructions: varchar('shipping_instructions'),

  sub_total: numeric('sub_total', { precision: 10, scale: 2 }),
  shipping_cost: numeric('shipping_cost', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  tax_total: numeric('tax_total', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  discount_total: numeric('discount_total', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),

  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
});
