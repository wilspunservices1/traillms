import { text, varchar, uuid, pgTable, foreignKey, boolean } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { chapters } from './courseChapters';

// Lectures Table
export const lectures = pgTable("lectures", {
    id: uuid('id').defaultRandom().primaryKey(),
    // chapterId: uuid('chapterId').references(() => chapters.id).notNull(),
    chapterId: uuid('chapterId').references(() => chapters.id, {onDelete: 'cascade'}).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    duration: varchar("duration", { length: 100 }).notNull(),
    videoUrl: varchar("videoUrl", { length: 500 }).notNull(), // URL of the lecture video
    isPreview: boolean("isPreview").default(false), // Indicates if this lecture is available as a preview
    isLocked: boolean("isLocked").default(true), // Indicates if the lecture is locked (non-preview)
    order: varchar("order", { length: 50 }), // Order of the lecture in the chapter
  });

export type Lecture = InferSelectModel<typeof lectures>;
export type LectureInsert = InferInsertModel<typeof lectures>;
