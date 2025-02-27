import {
	pgTable,
	text,
	timestamp,
	uuid,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { chapters } from "./courseChapters";

export const questionnaires = pgTable("questionnaires", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),

	// Every questionnaire MUST belong to a course
	courseId: uuid("course_id")
		.notNull()
		.references(() => courses.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		}),

	// A questionnaire MAY belong to a chapter (optional)
	chapterId: uuid("chapter_id").references(() => chapters.id, {
		onUpdate: "cascade",
		onDelete: "cascade",
	}),

	isRequired: boolean("is_required").default(true),
	minPassScore: integer("min_pass_score").default(80),

	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
// import {
//   pgTable,
//   text,
//   timestamp,
//   uuid,
//   varchar,
//   boolean,
//   integer
// } from 'drizzle-orm/pg-core';

// export const questionnaires = pgTable('questionnaires', {
// id: uuid('id').defaultRandom().primaryKey(),
// title: text('title').notNull(),
// courseId: text('course_id').notNull(),
// chapterId: text('chapter_id'), // Make it optional as it can be assigned later
// isRequired: boolean('is_required').default(true),
// minPassScore: integer('min_pass_score').default(80),
// // status: text('status').default('active'),
// // video_id: text('video_id'),
// createdAt: timestamp('created_at').defaultNow(),
// updatedAt: timestamp('updated_at').defaultNow()
// });
