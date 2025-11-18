import { InferModel } from 'drizzle-orm';
import { users } from './user';

export type User = InferModel<typeof users>;
export type UserInsert = InferModel<typeof users, 'insert'>;
