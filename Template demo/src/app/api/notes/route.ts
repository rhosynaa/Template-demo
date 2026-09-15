import { NextResponse } from "next/server";
import { createNote, listNotes } from "@/lib/notes-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listNotes();
    return NextResponse.json({ notes: items });
  } catch (error) {
    console.error("GET /api/notes failed", error);
    return NextResponse.json({ notes: [], error: "database_unavailable" }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      templateId?: string;
      title?: string;
    };
    const note = await createNote({
      templateId: body.templateId,
      title: body.title,
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes failed", error);
    return NextResponse.json({ error: "could_not_create_note" }, { status: 500 });
  }
}
