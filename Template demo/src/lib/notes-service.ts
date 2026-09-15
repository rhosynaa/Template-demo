import { desc, eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { notes } from "@/db/schema";
import { emptyDoc } from "./editor/paper";
import { buildTemplateDoc, getTemplate } from "./editor/templates";
import type { NoteDoc, NoteRecord, NoteSummary } from "./editor/types";

/* ------------------------------------------------------------------ *
 * Self-healing table bootstrap.
 *
 * Preview/sandbox environments can restart with a fresh database where
 * `drizzle-kit push` hasn't run (or its effects were lost). Without this,
 * every note page 404s and note creation 500s. We lazily create the table
 * — matching drizzle's definition exactly — the first time it's touched.
 * The resulting promise is cached so it costs one round-trip per process.
 * ------------------------------------------------------------------ */

const NOTES_DDL = `CREATE TABLE IF NOT EXISTS "notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text DEFAULT 'Untitled note' NOT NULL,
  "template_id" text DEFAULT 'blank' NOT NULL,
  "doc" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
)`;

let ensurePromise: Promise<void> | null = null;

export function ensureNotesTable(): Promise<void> {
  ensurePromise ??= pool
    .query(NOTES_DDL)
    .then(() => undefined)
    .catch((error) => {
      /* allow the next request to retry */
      ensurePromise = null;
      throw error;
    });
  return ensurePromise;
}

/**
 * Runs a notes query; if Postgres reports the table is missing (42P01) —
 * e.g. it was dropped after boot, or the environment swapped in a fresh
 * database — the cached ensure is invalidated, the table recreated and the
 * query retried exactly once.
 */
async function withTable<T>(query: () => Promise<T>): Promise<T> {
  try {
    await ensureNotesTable();
    return await query();
  } catch (error) {
    if ((error as { code?: string | undefined })?.code === "42P01") {
      ensurePromise = null;
      await ensureNotesTable();
      return await query();
    }
    throw error;
  }
}

function toDoc(value: unknown): NoteDoc {
  const doc = value as Partial<NoteDoc> | null;
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.elements)) {
    return emptyDoc();
  }
  const base = emptyDoc();
  return {
    version: 1,
    paper: { ...base.paper, ...(doc.paper ?? {}) },
    desk: { ...base.desk, ...(doc.desk ?? {}) },
    elements: doc.elements,
  };
}

function toSummary(row: typeof notes.$inferSelect): NoteSummary {
  const doc = toDoc(row.doc);
  const firstText = doc.elements.find(
    (el) => el.kind === "text" && el.html.replace(/<[^>]+>/g, "").trim().length > 12,
  );
  const snippet =
    firstText && firstText.kind === "text"
      ? firstText.html
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 120)
      : "";
  const stickers = doc.elements
    .filter((el) => el.kind === "sticker")
    .slice(0, 5)
    .map((el) => (el.kind === "sticker" ? el.sticker : ""))
    .filter(Boolean);

  return {
    id: row.id,
    title: row.title,
    templateId: row.templateId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    paper: doc.paper,
    elementCount: doc.elements.length,
    snippet,
    stickers,
  };
}

function toRecord(row: typeof notes.$inferSelect): NoteRecord {
  return { ...toSummary(row), doc: toDoc(row.doc) };
}

export async function listNotes(): Promise<NoteSummary[]> {
  const rows = await withTable(() =>
    db.select().from(notes).orderBy(desc(notes.updatedAt)).limit(60),
  );
  return rows.map(toSummary);
}

export async function getNote(id: string): Promise<NoteRecord | null> {
  const rows = await withTable(() =>
    db.select().from(notes).where(eq(notes.id, id)).limit(1),
  );
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function createNote(input: {
  templateId?: string;
  title?: string;
  doc?: NoteDoc;
}): Promise<NoteRecord> {
  const templateId = input.templateId ?? "blank";
  const template = getTemplate(templateId);
  const doc = input.doc ?? buildTemplateDoc(templateId);
  const title =
    input.title ?? (templateId === "blank" ? "Untitled note" : template.name);

  const rows = await withTable(() =>
    db.insert(notes).values({ title, templateId: template.id, doc }).returning(),
  );
  return toRecord(rows[0]);
}

export async function updateNote(
  id: string,
  patch: { title?: string; doc?: NoteDoc },
): Promise<NoteRecord | null> {
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof patch.title === "string") values.title = patch.title.slice(0, 160);
  if (patch.doc) values.doc = patch.doc;

  const rows = await withTable(() =>
    db.update(notes).set(values).where(eq(notes.id, id)).returning(),
  );
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const rows = await withTable(() => db.delete(notes).where(eq(notes.id, id)).returning());
  return rows.length > 0;
}
