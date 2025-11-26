import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const idempotency_keys = pgTable('order_idempotency_keys', {
  key: varchar('key', { length: 255 }).primaryKey(),
  user_id: uuid('user_id').notNull(),
  order_id: uuid('order_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
