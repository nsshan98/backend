import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { products } from './product';
import { categories } from './category';

export const productCategories = pgTable(
  'product_categories',
  {
    product_id: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    category_id: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    added_at: timestamp('added_at').defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.product_id, table.category_id),
  }),
);
