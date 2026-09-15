import Link from "next/link";
import NewNoteButton from "@/components/gallery/NewNoteButton";
import NoteCard from "@/components/gallery/NoteCard";
import TemplateCard from "@/components/gallery/TemplateCard";
import { TEMPLATES } from "@/lib/editor/templates";
import { listNotes } from "@/lib/notes-service";
import type { NoteSummary } from "@/lib/editor/types";

export const dynamic = "force-dynamic";

const PHASES = [
  {
    n: "01",
    title: "Foundation & layout",
    body: "A real desk with a custom background, and paper at true physical size — A4, A5, Letter, Legal or Tabloid — lined, grid, dot or blank.",
  },
  {
    n: "02",
    title: "The text engine",
    body: "Click the paper and write. Playlist Script titles, Amatic SC subheadings, Patrick Hand body, Kalam equations, wavy underlines and uneven marker highlights.",
  },
  {
    n: "03",
    title: "Visuals & canvas",
    body: "Stickers, shapes you can type inside, uploaded images with opacity, a freehand pen and right-click layering over or under the text.",
  },
  {
    n: "04",
    title: "Templates",
    body: "Ready-made spreads — starting with the Physics Module Four page — that load straight into the editor, fully editable.",
  },
];

export default async function HomePage() {
  let notes: NoteSummary[] = [];
  let dbError = false;
  try {
    notes = await listNotes();
  } catch {
    dbError = true;
  }

  const templates = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    blurb: t.blurb,
    tags: t.tags,
    doc: t.build(),
  }));

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3fd_0%,#f3eff8_38%,#f6f1f6_100%)]">
      {/* ------------------------------ header ------------------------------ */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span
          className="text-[30px] leading-none text-[#2f2a3a]"
          style={{ fontFamily: "var(--font-title)" }}
        >
          Noatic
        </span>
        <nav className="flex items-center gap-1.5 text-[13px]">
          <Link
            href="/templates"
            className="rounded-xl px-3 py-2 text-[#5c5470] transition hover:bg-white"
          >
            Templates
          </Link>
          <NewNoteButton
            templateId="blank"
            className="rounded-xl bg-[#2f2a3a] px-4 py-2 font-medium text-white transition hover:bg-[#8a6fd1]"
          >
            New page
          </NewNoteButton>
        </nav>
      </header>

      {/* ------------------------------- hero ------------------------------- */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-4">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_.95fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e0d5f4] bg-white/70 px-3 py-1 text-[11.5px] font-medium uppercase tracking-[0.16em] text-[#8a6fd1]">
              aesthetic note studio
            </p>
            <h1 className="text-[clamp(2.6rem,6vw,4.4rem)] leading-[1.02] text-[#2f2a3a]">
              <span style={{ fontFamily: "var(--font-title)" }}>Write notes</span>
              <br />
              <span
                style={{ fontFamily: "var(--font-sub)", letterSpacing: "0.06em" }}
                className="text-[#8a6fd1]"
              >
                THAT LOOK LIKE ART
              </span>
            </h1>
            <p
              className="mt-4 max-w-lg text-[18px] leading-relaxed text-[#5c5470]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              A blank-page editor built like a real desk: your paper sits in the middle at its
              true size, and everything else — stickers, doodles, shapes, highlighter — floats
              around it.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <NewNoteButton
                templateId="blank"
                className="rounded-2xl bg-[#2f2a3a] px-6 py-3 text-[14px] font-medium text-white transition hover:bg-[#8a6fd1]"
              >
                Start a blank page
              </NewNoteButton>
              <NewNoteButton
                templateId="physics"
                className="rounded-2xl border border-[#d6c8f0] bg-white px-6 py-3 text-[14px] font-medium text-[#5c4a91] transition hover:bg-[#f7f2ff]"
              >
                Open the Physics template
              </NewNoteButton>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#e7defa] blur-2xl" />
            <div className="absolute -bottom-8 right-4 h-28 w-28 rounded-full bg-[#fbd9c3] blur-2xl" />
            <div className="relative rotate-[1.4deg] rounded-[22px] border border-[#e5dcf4] bg-white p-3 shadow-[0_30px_70px_-34px_rgba(90,60,150,.65)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/templates/physics-reference.jpg"
                alt="Physics module four notes"
                className="w-full rounded-[14px]"
              />
              <p className="px-1 pb-1 pt-2.5 text-[12px] text-[#948aa9]">
                The reference spread — rebuilt as a live, editable template.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------- templates ---------------------------- */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2
              className="text-[34px] leading-none text-[#2f2a3a]"
              style={{ fontFamily: "var(--font-sub)", letterSpacing: "0.04em" }}
            >
              TEMPLATE GALLERY
            </h2>
            <p className="mt-1 text-[13.5px] text-[#6f6880]">
              Every template opens as a fully editable page — nothing is baked in.
            </p>
          </div>
          <Link
            href="/templates"
            className="hidden rounded-xl border border-[#e0d5f4] bg-white px-4 py-2 text-[13px] text-[#5c4a91] hover:bg-[#f7f2ff] sm:block"
          >
            See all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((t) => (
            <TemplateCard key={t.id} template={t} featured={t.id === "physics"} />
          ))}
        </div>
      </section>

      {/* ------------------------------- notes ------------------------------ */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2
            className="text-[34px] leading-none text-[#2f2a3a]"
            style={{ fontFamily: "var(--font-sub)", letterSpacing: "0.04em" }}
          >
            YOUR PAGES
          </h2>
          <span className="text-[13px] text-[#948aa9]">{notes.length} saved</span>
        </div>

        {dbError && (
          <p className="rounded-2xl border border-[#f0d4dd] bg-white px-4 py-3 text-[13px] text-[#b4607f]">
            The notes table isn’t reachable yet. Run <code>npx drizzle-kit push</code> to create
            it.
          </p>
        )}

        {!dbError && notes.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#d8cdf0] bg-white/60 px-6 py-14 text-center">
            <p
              className="text-[26px] text-[#5c4a91]"
              style={{ fontFamily: "var(--font-title)" }}
            >
              nothing here yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-[#6f6880]">
              Start with a blank page or pick a template above — your pages autosave and show up
              here.
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {notes.map((n) => (
            <NoteCard key={n.id} note={n} />
          ))}
        </div>
      </section>

      {/* ------------------------------ phases ------------------------------ */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-6">
        <h2
          className="mb-5 text-[34px] leading-none text-[#2f2a3a]"
          style={{ fontFamily: "var(--font-sub)", letterSpacing: "0.04em" }}
        >
          BUILT IN FOUR PHASES
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {PHASES.map((p) => (
            <div
              key={p.n}
              className="rounded-2xl border border-[#e8e0f5] bg-white/80 p-5"
            >
              <span
                className="text-[30px] leading-none text-[#c9bae9]"
                style={{ fontFamily: "var(--font-title)" }}
              >
                {p.n}
              </span>
              <h3 className="mt-2 text-[15px] font-semibold text-[#332d42]">{p.title}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#6f6880]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#e8e0f5] bg-white/60 py-6 text-center text-[12.5px] text-[#948aa9]">
        Noatic · Next.js 16 · React 19 · Tailwind 4 · Drizzle + PostgreSQL
      </footer>
    </main>
  );
}
