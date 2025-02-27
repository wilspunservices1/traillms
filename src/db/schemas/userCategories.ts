import { pgTable, uuid } from 'drizzle-orm/pg-core';
import { user } from './user';
import { categories } from './categories';

export const userCategories = pgTable('UserCategories', {
  userId: uuid('userId')
    .references(() => user.id)
    .notNull(),
  categoryId: uuid('categoryId')
    .references(() => categories.id)
    .notNull(),
});
