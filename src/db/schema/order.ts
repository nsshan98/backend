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
  total_amount: integer('total_amount'),
  address: varchar('address'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),
});
