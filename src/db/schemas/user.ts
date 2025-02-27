// src/db/schemas/user.ts
import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, boolean as pgBoolean, timestamp,json } from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').defaultRandom().primaryKey(),
  uniqueIdentifier: text('uniqueIdentifier').unique().notNull(), // Unique identifier for user
  name: text('name').notNull(),
  username: text('username').unique(),
  phone: text('phone').unique(), // Optional phone field
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  emailVerified: timestamp('emailVerified'),
  image: text('image'),

  // role: text('role').default('user'),
  roles: json('roles').default(sql`'["user"]'::json`).notNull(), // JSON to store multiple roles
  enrolledCourses: json('enrolledCourses').default(sql`'[]'::json`).notNull(), // JSON to store enrolled courses as an array
  // Wishlist field
  wishlist: json('wishlist').default(sql`'[]'::json`).notNull(), // JSON to store wishlist items

  isVerified: pgBoolean('isVerified').default(false).notNull(),
  activationToken: text('activationToken'),
  createdAt: timestamp('createdAt').defaultNow().notNull(), // Track when the user was created
  updatedAt: timestamp('updatedAt').defaultNow().notNull(), // Track when the user was last updated

  // Added fields for instructor details
  instructorBio: text('instructorBio').default(''), // Text field for storing bio of the instructor
  qualifications: json('qualifications').default(sql`'[]'::json`).notNull(), // JSON array to store qualifications  
});


// import { pgTable, uuid, text, boolean as pgBoolean, timestamp } from 'drizzle-orm/pg-core';

// export const user = pgTable('User', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   name: text('name'),
//   username: text('username').unique(),
//   phone: text('phone').unique(),
//   email: text('email').unique().notNull(),
//   password: text('password'),
//   emailVerified: timestamp('emailVerified'),
//   image: text('image'),
//   role: text('role'),
//   isVerified: pgBoolean('isVerified').default(false).notNull(),
//   activationToken: text('activationToken'), // New column for activation token
// });
