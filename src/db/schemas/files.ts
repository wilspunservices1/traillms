import { pgTable, serial, varchar, integer, uuid } from "drizzle-orm/pg-core";
import { courses } from "./courses"; // Import the courses table for foreign key reference

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }), // Optional field, nullable by default
  path: varchar("path", { length: 255 }), // Optional field, nullable by default
  size: integer("size"), // Optional field, nullable by default
  courseId: uuid("courseId").references(() => courses.id), // Foreign key to courses table, optional
  // courseId: uuid('courseId').references(() => courses.id, {onDelete: 'cascade'}).notNull(),
});
