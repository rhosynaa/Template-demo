import { sql } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * A Noatic note = one "paper" document living on the desk.
 * The full editor document (paper settings, desk settings, elements) is
 * stored as a single JSONB blob so the canvas schema can evolve freely.
 */
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default("Untitled note"),
  templateId: text("template_id").notNull().default("blank"),
  doc: jsonb("doc").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type NoteRow = typeof notes.$inferSelect;
export type NoteInsert = typeof notes.$inferInsert;
