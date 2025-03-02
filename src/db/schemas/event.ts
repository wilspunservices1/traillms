import { pgTable, integer, text } from 'drizzle-orm/pg-core';

export const event = pgTable('Event', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  duration: text('duration').notNull(),
  speaker: text('speaker').notNull(),
});
