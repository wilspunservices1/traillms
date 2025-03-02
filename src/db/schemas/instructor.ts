// src/db/schemas/instructorApplications.ts
import { pgTable, uuid, text, timestamp, json } from 'drizzle-orm/pg-core';

export const instructorApplications = pgTable('InstructorApplications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').notNull(),
  instructorBio: text('instructorBio').default(''),
  qualifications: json('qualifications').default('[]').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected'
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});
