import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './user';

export const user_addresses = pgTable('user_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),

  user_id: uuid('user_id')
    .notNull()
    .references(() => users.id),

  label: varchar('label', { length: 32 }).default('Home'),

  address: text('address').notNull(),
  phone: varchar('phone', { length: 32 }).notNull(),

  line1: text('line1'),
  line2: text('line2'),

  district: varchar('district', { length: 64 }).notNull(),
  upazila: varchar('upazila', { length: 64 }),
  area: varchar('area', { length: 128 }),

  post_code: varchar('post_code', { length: 16 }).notNull(),
  country: varchar('country', { length: 64 }).default('Bangladesh'),

  latitude: numeric('latitude', { precision: 10, scale: 6 }),
  longitude: numeric('longitude', { precision: 10, scale: 6 }),

  is_default: boolean('is_default').default(false),

  created_at: timestamp('created_at').defaultNow().notNull(),
});
