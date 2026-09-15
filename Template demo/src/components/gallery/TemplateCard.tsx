"use client";

import type { NoteDoc } from "@/lib/editor/types";
import MiniPage from "./MiniPage";
import NewNoteButton from "./NewNoteButton";

export interface TemplateCardData {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  doc: NoteDoc;
}

export default function TemplateCard({
  template,
  featured,
}: {
  template: TemplateCardData;
  featured?: boolean;
}) {
  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-[0_26px_60px_-30px_rgba(90,60,150,.6)] ${
        featured ? "border-[#d6c8f0]" : "border-[#e8e0f5]"
      }`}
    >
      <div className="relative flex h-[248px] items-start justify-center overflow-hidden bg-[#f3eef9] pt-4">
        <div className="nt-shadow-paper overflow-hidden rounded-[4px]">
          <MiniPage doc={template.doc} width={featured ? 232 : 196} />
        </div>
        {featured && (
          <span className="absolute left-4 top-4 rounded-full bg-[#8a6fd1] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-[#eee7f8] p-4">
        <h3 className="text-[16px] font-semibold tracking-tight text-[#332d42]">
          {template.name}
        </h3>
        <p className="flex-1 text-[12.5px] leading-relaxed text-[#6f6880]">{template.blurb}</p>
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-[#f4eeff] px-2 py-0.5 text-[10.5px] font-medium text-[#7a68a5]"
            >
              {t}
            </span>
          ))}
        </div>
        <NewNoteButton
          templateId={template.id}
          className="mt-1.5 w-full rounded-xl bg-[#2f2a3a] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#8a6fd1] disabled:opacity-60"
        >
          Use this template
        </NewNoteButton>
      </div>
    </div>
  );
}
