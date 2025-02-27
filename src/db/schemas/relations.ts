import { relations } from "drizzle-orm";
import { chapters } from "./courseChapters";
import { courses } from "./courses";
import { lectures } from "./lectures";

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
	chapters: many(chapters),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
	course: one(courses, {
		fields: [chapters.courseId],
		references: [courses.id],
	}),
	lectures: many(lectures),
}));

export const lecturesRelations = relations(lectures, ({ one }) => ({
	chapter: one(chapters, {
		fields: [lectures.chapterId],
		references: [chapters.id],
	}),
}));
