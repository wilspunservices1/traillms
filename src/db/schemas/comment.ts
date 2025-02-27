// src/db/schemas/comments.ts
import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { user } from '@/db/schemas/user'; // Assuming you have a user schema file
import { courses } from '@/db/schemas/courses'; // Assuming you have a course schema file

export const comments = pgTable('Comment', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => user.id),
    courseId: uuid('course_id').references(() => courses.id),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});
