import { pgTable,text,timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
// VerificationToken Model
export const verificationToken = pgTable('VerificationToken', {
    identifier: text('identifier').notNull(),
    token: text('token').unique().notNull(),
    expires: timestamp('expires').notNull(),
  }, (table) => ({
    verificationTokenUnique: uniqueIndex('verificationTokenUnique').on(table.identifier, table.token),
  }));