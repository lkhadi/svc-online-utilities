import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey(),
  content: text('content').notNull(),
  title: text('title').notNull().default('Untitled'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const noteHistory = pgTable('note_history', {
  id: uuid('id').primaryKey(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
