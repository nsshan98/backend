import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  image_url: varchar('image_url', { length: 512 }),
  stock_quantity: integer('stock_quantity').notNull().default(0),
  cost_price: integer('cost_price').notNull(),
  regular_price: integer('regular_price').notNull(),
  sale_price: integer('sale_price'),
  is_published: boolean('is_published').notNull().default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
