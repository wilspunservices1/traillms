import { text, varchar, uuid, pgTable, foreignKey } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { courses } from "./courses";
import { questionnaires } from "./questionnaire";

export const chapters = pgTable("chapters", {
	id: uuid("id").defaultRandom().primaryKey(),
	// courseId: uuid('courseId').references(() => courses.id).notNull(),
	courseId: uuid("courseId")
		.references(() => courses.id, { onDelete: "cascade" })
		.notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	description: text("description"),
	questionnaireId: uuid("questionnaireId"),
	order: varchar("order", { length: 50 }), // Order of the chapter in the course
	duration: varchar("duration", { length: 100 }).notNull(), // Duration of the chapter
});

export type Chapter = InferSelectModel<typeof chapters>;
export type ChapterInsert = InferInsertModel<typeof chapters>;
