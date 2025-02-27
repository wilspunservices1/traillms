import {
  foreignKey,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { courses } from "./courses";

export const managecertificates = pgTable(
  "managecertificates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    courseId: uuid("course_id")
      .references(() => courses.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    isDeleted: text("is_deleted").default("false").notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => {
    return {
      // ✅ Foreign Key: certificateId → courses.id
      managecertificates_courseFk: foreignKey({
        columns: [table.courseId],
        foreignColumns: [courses.id],
        name: "managecertificates_courseFk",
      }),
    };
  }
);
