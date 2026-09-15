"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function NewNoteButton({
  templateId,
  className,
  children,
  title,
}: {
  templateId: string;
  className?: string;
  children: ReactNode;
  title?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const create = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, title }),
      });
      const data = (await res.json()) as { note?: { id: string }; error?: string };
      if (data.note?.id) router.push(`/editor/${data.note.id}`);
      else {
        setBusy(false);
        alert("Could not create the note. Is the database running?");
      }
    } catch {
      setBusy(false);
      alert("Could not create the note.");
    }
  };

  return (
    <button type="button" onClick={create} disabled={busy} className={className}>
      {busy ? "Opening…" : children}
    </button>
  );
}
