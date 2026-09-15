import { NextResponse } from "next/server";
import { deleteNote, getNote, updateNote } from "@/lib/notes-service";
import type { NoteDoc } from "@/lib/editor/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const note = await getNote(id);
    if (!note) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("GET /api/notes/[id] failed", error);
    return NextResponse.json({ error: "database_unavailable" }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const body = (await request.json()) as { title?: string; doc?: NoteDoc };
    const note = await updateNote(id, { title: body.title, doc: body.doc });
    if (!note) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("PATCH /api/notes/[id] failed", error);
    return NextResponse.json({ error: "could_not_save" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  try {
    const ok = await deleteNote(id);
    return NextResponse.json({ ok });
  } catch (error) {
    console.error("DELETE /api/notes/[id] failed", error);
    return NextResponse.json({ error: "could_not_delete" }, { status: 500 });
  }
}
