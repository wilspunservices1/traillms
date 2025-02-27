import { pgTable, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const blog = pgTable('Blog', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  desc: text('desc').notNull(),
  date: text('date').notNull(),  // Assuming 'date' is a string; if it's a numeric day, use `integer`.
  publishDate: text('publishDate').notNull(),  // Use `timestamp` if storing the full date-time.
  month: text('month').notNull(),
  authorName: text('authorName').notNull(),  // Flattened author name into a single field
});
