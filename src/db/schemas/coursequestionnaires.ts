import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer
} from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { questionnaires } from './questionnaire';

export const courseQuestionnaires = pgTable('course_questionnaires', {
    id: uuid('id').defaultRandom().primaryKey(),
    courseId: uuid('course_id').references(() => courses.id).notNull(),
    questionnaireId: uuid('questionnaire_id').references(() => questionnaires.id).notNull(),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
  });