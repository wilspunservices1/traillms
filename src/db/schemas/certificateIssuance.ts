// src/db/schemas/certificateIssuance.ts

import { pgTable, uuid, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { user } from './user'; // Adjust the import path as needed
import { certification } from './certification'; // Adjust the import path as needed


export const certificateIssuance = pgTable('CertificateIssuance', {
  id: uuid('id').defaultRandom().primaryKey(),

  // References the certificate template that was issued
  certificateId: uuid('certificateId')
    .references(() => certification.id)
    .notNull(),

  // The user (instructor/admin) who issued the certificate
  issuedBy: uuid('issuedBy')
    .references(() => user.id)
    .notNull(),

  // The user (student) who received the certificate
  issuedTo: uuid('issuedTo')
    .references(() => user.id)
    .notNull(),

  // User's signature (if applicable)
  signature: text('signature'),

  // Description or additional details
  description: text('description'),

  // Unique identifier for the issued certificate (for verification)
  issuanceUniqueIdentifier: text('issuanceUniqueIdentifier').unique().notNull(),

  // Indicates whether the certificate has been revoked
  isRevoked: boolean('isRevoked').default(false).notNull(),

  // Reason for revocation, if applicable
  revocationReason: text('revocationReason'),

  // Expiration status
  isExpired: boolean('isExpired').default(false).notNull(),

  // Optional field for tracking certificate expiry
  expirationDate: timestamp('expirationDate'),

  // Timestamps
  issuedAt: timestamp('issuedAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
});