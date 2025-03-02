import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const categories = pgTable('Categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(), // Track when the category was created
  updatedAt: timestamp('updatedAt').defaultNow().notNull(), // Track when the category was last updated
});
