import { pgTable, bigint, text } from 'drizzle-orm/pg-core';

export const meeting = pgTable('Meeting', {
  id: bigint('id', { mode: 'number' }).primaryKey(), // Specify mode as 'number' or 'bigint'
  title: text('title').notNull(),
  date: text('date').notNull(),
  duration: text('duration').notNull(),
  startingTime: text('startingTime').notNull(),
  speakerName: text('speakerName').notNull(),
  department: text('department').notNull(),
});
