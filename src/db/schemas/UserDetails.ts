import { sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';

export const userDetails = pgTable('userDetails', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('userId').references(() => user.id).notNull(), // Foreign key to User table
  biography: text('biography'),
  expertise: text('expertise')
    .array()
    .notNull()
    .default(sql`'{}'::text[]`), // Setting the default value for the array field
  registrationDate: timestamp('registrationDate').defaultNow().notNull(),
});



// // src/db/schemas/userDetails.ts
// import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
// import { user } from './user';

// export const userDetails = pgTable('UserDetails', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   userId: uuid('userId').references(() => user.id).notNull(), // Foreign key to User table
//   biography: text('biography'),
//   expert: text('expert'),
//   registrationDate: timestamp('registrationDate').defaultNow().notNull(),
// });
