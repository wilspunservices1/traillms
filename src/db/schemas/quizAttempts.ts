import {
	pgTable,
	text,
	integer,
	timestamp,
	jsonb,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./user";
import { questionnaires } from "./questionnaire";

export const quizAttempts = pgTable("quiz_attempts", {
	id: uuid("id").defaultRandom().primaryKey(),
	user_id: uuid("user_id")
		.notNull()
		.references(() => user.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		}),
	questionnaire_id: uuid("questionnaire_id")
		.notNull()
		.references(() => questionnaires.id, {
			onUpdate: "cascade",
			onDelete: "cascade",
		}),
	score: integer("score").notNull(),
	answers: jsonb("answers").notNull(), // Store answers as JSON
	created_at: timestamp("created_at", { mode: "string" })
		.defaultNow()
		.notNull(),
	updated_at: timestamp("updated_at", { mode: "string" })
		.defaultNow()
		.notNull(),
});

// Types for TypeScript
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type NewQuizAttempt = typeof quizAttempts.$inferInsert;
