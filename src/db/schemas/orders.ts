// src/db/schemas/orders.ts
import { pgTable, uuid, text, timestamp, decimal, json , jsonb} from 'drizzle-orm/pg-core';
import { user } from './user';

export const orders = pgTable('Orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid("userId").references(() => user.id,{onDelete: 'cascade'}).notNull(),
  // userId: uuid("userId").references(() => users.id).notNull(), // Updated reference
  status: text('status').notNull(), // Payment status (e.g., pending, completed, failed)
  totalAmount: decimal('totalAmount', { precision: 10, scale: 2 }).notNull(), // Total amount paid
  paymentMethod: text('paymentMethod').notNull(), // Payment method (e.g., credit card, PayPal)
  items: json('items').notNull(), // JSON to store ordered items (e.g., courseId, productId, etc.)
  createdAt: timestamp('createdAt').defaultNow().notNull(), // Track when the order was made
  updatedAt: timestamp('updatedAt').defaultNow().notNull(), // Track when the order was last updated
});