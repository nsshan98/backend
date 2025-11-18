import {
  pgTable,
  varchar,
  text,
  timestamp,
  pgEnum,
  uuid,
} from 'drizzle-orm/pg-core';
import { Role } from 'src/auth/enum/role.enum';

export const roleEnum = pgEnum('role_enum', [
  Role.SUPPA_DUPPA_ADMIN,
  Role.USER,
  Role.ADMIN,
  Role.EDITOR,
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  first_name: varchar('first_name', { length: 255 }).notNull(),
  last_name: varchar('last_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  hashed_refresh_token: text('hashed_refresh_token'),
  role: roleEnum('role').notNull().default(Role.USER),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
