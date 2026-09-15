import Link from "next/link";
import NewNoteButton from "@/components/gallery/NewNoteButton";
import TemplateCard from "@/components/gallery/TemplateCard";
import { TEMPLATES } from "@/lib/editor/templates";

export const dynamic = "force-dynamic";

export default function TemplatesPage() {
  const templates = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    blurb: t.blurb,
    tags: t.tags,
    doc: t.build(),
  }));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3fd_0%,#f3eff8_60%,#f6f1f6_100%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="text-[30px] leading-none text-[#2f2a3a]"
          style={{ fontFamily: "var(--font-title)" }}
        >
          Noatic
        </Link>
        <NewNoteButton
          templateId="blank"
          className="rounded-xl bg-[#2f2a3a] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#8a6fd1]"
        >
          New page
        </NewNoteButton>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-6 pt-2">
        <h1
          className="text-[clamp(2.2rem,5vw,3.4rem)] leading-none text-[#2f2a3a]"
          style={{ fontFamily: "var(--font-title)" }}
        >
          Template gallery
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] text-[#5c5470]" style={{ fontFamily: "var(--font-body)" }}>
          Each template is assembled from the same building blocks as the editor — text blocks,
          stickers, shapes and drawings — so every heading, illustration and equation box can be
          moved, restyled or deleted.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} featured={t.id === "physics"} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid items-center gap-8 rounded-3xl border border-[#e8e0f5] bg-white/70 p-6 md:grid-cols-2">
          <div>
            <h2
              className="text-[30px] leading-none text-[#2f2a3a]"
              style={{ fontFamily: "var(--font-sub)", letterSpacing: "0.05em" }}
            >
              THE REFERENCE SPREAD
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-[#5c5470]">
              The Physics · Module Four template recreates this page: Playlist Script title with
              purple leaf sprigs, an Amatic SC module line, a two-column grid layout, wavy
              underlined section headings, hand-drawn motion graphs, the falling-apple force
              diagram, the car-crash illustration and a wobbly “important equations” box.
            </p>
            <NewNoteButton
              templateId="physics"
              className="mt-5 rounded-2xl bg-[#2f2a3a] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[#8a6fd1]"
            >
              Open it in the editor
            </NewNoteButton>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/templates/physics-reference.jpg"
            alt="Physics module four reference notes"
            className="w-full rounded-2xl border border-[#e5dcf4] shadow-[0_24px_60px_-34px_rgba(90,60,150,.6)]"
          />
        </div>
      </section>
    </main>
  );
}
