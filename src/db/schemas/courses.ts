import { text, boolean, varchar, uuid, decimal, timestamp, pgTable , json} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel, sql } from 'drizzle-orm';
import { user } from './user';
import { foreignKey } from "drizzle-orm/mysql-core";
import { certification } from "./certification";

export const courses = pgTable("courses", {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  lesson: varchar("lesson", { length: 100 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),

  description: text("description"),
  
  featured: boolean("featured").default(false),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Actual price
  estimatedPrice: decimal("estimatedPrice", { precision: 10, scale: 2 }), // Original price before discount
  isFree: boolean("isFree").default(false),
  tag: varchar("tag", { length: 100 }).notNull(),
  skillLevel: varchar("skillLevel", { length: 100 }).notNull(),
  // categories: varchar("categories", { length: 100 }).notNull(),
  categories: json("categories")
    .default(sql`('[]')`)
    .notNull(),
  insName: varchar("insName", { length: 255 }).notNull(),
  thumbnail: text("thumbnail"), // Store as base64 string
  createdAt: timestamp('createdAt').defaultNow().notNull(), // Track when the category was created
  updatedAt: timestamp('updatedAt').defaultNow().notNull(), // Track when the course was last updated
  userId: uuid("userId").references(() => user.id).notNull(),
  demoVideoUrl: varchar("demoVideoUrl", { length: 500 }), // URL link for the demo video
  isPublished: boolean("isPublished").default(false), // New field to indicate if the course is published or in draft mode
  enrolledCount: decimal("enrolledCount", { precision: 10, scale: 0 }).default("0").notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  extras: json('extras').default(sql`'{}'`).notNull(), // JSON to store extra course information
  // New field to store reviews as JSON
  reviews: json('reviews')
    .default(sql`'[]'`) // Default to an empty array of reviews
    .notNull(),
  comments: json('comments').default(sql`'[]'`).notNull(),

  // New field to store the selected certificate
  certificateId: uuid("certificateId").references(() => certification.id), // Nullable reference to a certificate
});

export type Course = InferSelectModel<typeof courses>;
export type CourseInsert = InferInsertModel<typeof courses>;