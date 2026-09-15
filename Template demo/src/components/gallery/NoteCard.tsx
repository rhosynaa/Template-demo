"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PAPER_SIZES, paperBackground } from "@/lib/editor/paper";
import { StickerSvg } from "@/lib/editor/stickers";
import type { NoteSummary } from "@/lib/editor/types";

function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function NoteCard({ note }: { note: NoteSummary }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const size = PAPER_SIZES[note.paper.size] ?? PAPER_SIZES.a4;

  /* computed post-mount: Date.now() differs between SSR and hydration */
  const [updated, setUpdated] = useState("…");
  useEffect(() => {
    setUpdated(ago(note.updatedAt));
  }, [note.updatedAt]);

  const remove = async () => {
    if (!confirm(`Delete “${note.title}”?`)) return;
    setBusy(true);
    await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
    router.refresh();
    setBusy(false);
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#e8e0f5] bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(90,60,150,.55)]">
      <Link href={`/editor/${note.id}`} className="block">
        <div
          className="relative mb-3 flex h-36 items-end overflow-hidden rounded-xl border border-[#eee7f8]"
          style={paperBackground(note.paper)}
        >
          <div className="absolute inset-x-3 top-3">
            <p
              className="truncate text-[22px] leading-tight text-[#2f2a3a]"
              style={{ fontFamily: "var(--font-title)" }}
            >
              {note.title}
            </p>
            <p
              className="mt-1 line-clamp-3 text-[11.5px] leading-snug text-[#6f6880]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {note.snippet || "An empty page, waiting for ideas…"}
            </p>
          </div>
          <div className="relative flex w-full items-end justify-end gap-1 p-2">
            {note.stickers.slice(0, 4).map((s, i) => (
              <span key={`${s}-${i}`} className="block h-7 w-7 opacity-90">
                <StickerSvg sticker={s} />
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-[#3b3548]">{note.title}</p>
          <p className="text-[11.5px] text-[#948aa9]">
            {size.label} · {note.elementCount} objects · {updated}
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="shrink-0 rounded-lg border border-transparent px-2 py-1 text-[11.5px] text-[#b09fd0] opacity-0 transition group-hover:opacity-100 hover:border-[#f0d4dd] hover:text-[#c4607f]"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
