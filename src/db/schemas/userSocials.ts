// src/db/schemas/userSocials.ts
import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { user } from './user';

export const userSocials = pgTable('UserSocials', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').references(() => user.id).notNull(), // Foreign key to User table
  facebook: text('facebook').default('').notNull(),
  twitter: text('twitter').default('').notNull(),
  linkedin: text('linkedin').default('').notNull(),
  website: text('website').default('').notNull(),
  github: text('github').default('').notNull(),
});
