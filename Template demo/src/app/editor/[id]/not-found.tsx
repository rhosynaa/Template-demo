import Link from "next/link";
import NewNoteButton from "@/components/gallery/NewNoteButton";

export default function NoteNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f7f3fd,#f3eff8)] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#e8e0f5] bg-white p-8 text-center shadow-[0_24px_60px_-34px_rgba(90,60,150,.55)]">
        <p
          className="text-[42px] leading-none text-[#8a6fd1]"
          style={{ fontFamily: "var(--font-title)" }}
        >
          page not found
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#5c5470]">
          This note couldn’t be opened — it may have been deleted, or the workspace database was
          restarted and the page no longer exists here.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <NewNoteButton
            templateId="blank"
            className="w-full rounded-2xl bg-[#2f2a3a] px-5 py-3 text-[14px] font-medium text-white transition hover:bg-[#8a6fd1]"
          >
            Start a fresh page
          </NewNoteButton>
          <NewNoteButton
            templateId="physics"
            className="w-full rounded-2xl border border-[#d6c8f0] bg-white px-5 py-3 text-[14px] font-medium text-[#5c4a91] transition hover:bg-[#f7f2ff]"
          >
            Open the Physics template
          </NewNoteButton>
          <Link
            href="/"
            className="w-full rounded-2xl border border-transparent px-5 py-2.5 text-[13.5px] text-[#8b8399] transition hover:bg-[#f4eeff]"
          >
            Back to the gallery
          </Link>
        </div>
      </div>
    </main>
  );
}
