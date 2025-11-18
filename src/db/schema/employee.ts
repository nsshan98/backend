// src/db/schema/employee.ts
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  json,
  timestamp,
} from 'drizzle-orm/pg-core';

type EmployeeImage = {
  image_public_id: string;
  image_url: string;
};

export const employees = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  show_email: boolean('show_email').default(true),
  official_phone: varchar('official_phone', { length: 20 }),
  show_official_phone: boolean('show_official_phone').default(true),
  personal_phone: varchar('personal_phone', { length: 20 }),
  show_personal_phone: boolean('show_personal_phone').default(true),
  designation: varchar('designation', { length: 255 }).notNull(),
  department: varchar('department', { length: 255 }).notNull(),
  type: varchar('type', { length: 255 }),
  serial: integer('serial'),
  sorting_order: integer('sorting_order'),
  is_published: boolean('is_published').default(true),
  image: json('image').$type<EmployeeImage | null>(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  user_id: uuid('user_id').notNull(), // FK reference to User table
});
