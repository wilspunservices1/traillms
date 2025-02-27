// src/db/schemas/certificateTracking.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { certification } from './certification';

export const certificateTracking = pgTable('CertificateTracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  certificateId: uuid('certificateId')
    .references(() => certification.id)
    .notNull(),
  verificationCode: text('verificationCode').unique().notNull(),
  holderName: text('holderName').notNull(),
  issueDate: timestamp('issueDate').notNull(),
  expiryDate: timestamp('expiryDate'),
  lastVerifiedAt: timestamp('lastVerifiedAt'),
  status: text('status').notNull(), // ACTIVE, EXPIRED, REVOKED
  grade: text('grade'),
  score: text('score'),
  digitalSignature: text('digitalSignature'),
  verificationHistory: text('verificationHistory'), // JSON string of verification history
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
}); 