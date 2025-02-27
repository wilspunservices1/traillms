import { text, boolean, varchar, uuid, decimal, timestamp, pgTable } from "drizzle-orm/pg-core";
import { user } from './user';
import { courses } from './courses';

export const cart = pgTable('cart', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('userId').references(() => user.id).notNull(), // Reference to the user
    courseId: uuid('courseId').references(() => courses.id).notNull(), // Reference to the course
    createdAt: timestamp('createdAt').defaultNow().notNull(), // Track when the item was added to the cart
  });
  