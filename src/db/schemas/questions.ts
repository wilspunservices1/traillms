import {
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	boolean,
	integer,
} from "drizzle-orm/pg-core";
import { questionnaires } from "./questionnaire";

export const questions = pgTable("questions", {
	id: uuid("id").defaultRandom().primaryKey(),
	questionnaireId: uuid("questionnaire_id").references(
		() => questionnaires.id,
		{ onUpdate: "cascade", onDelete: "cascade" }
	),
	question: text("question"),
	options: text("options"), // Stored as JSON string
	correctAnswer: varchar("correct_answer", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});
