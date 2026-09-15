import { notFound } from "next/navigation";
import EditorShell from "@/components/editor/EditorShell";
import { getNote } from "@/lib/notes-service";

export const dynamic = "force-dynamic";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNote(id).catch(() => null);
  if (!note) notFound();
  return <EditorShell note={note} />;
}
