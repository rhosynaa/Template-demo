"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { FONT_LIST, HIGHLIGHTS, SWATCHES, fontCss } from "@/lib/editor/paper";
import type { FontKey, TextElement } from "@/lib/editor/types";
import type { EditorApi } from "./useEditor";
import type { Tool } from "./PaperCanvas";

function exec(cmd: string, value?: string) {
  try {
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(cmd, false, value);
  } catch {
    /* unsupported command */
  }
}

function wrapSelection(className: string, cssVar?: string) {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const span = document.createElement("span");
  span.className = className;
  if (cssVar) span.style.setProperty("--mk", cssVar);
  try {
    range.surroundContents(span);
  } catch {
    span.appendChild(range.extractContents());
    range.insertNode(span);
  }
  sel.removeAllRanges();
  const after = document.createRange();
  after.selectNodeContents(span);
  sel.addRange(after);
}

function Btn({
  children,
  onClick,
  active,
  title,
  wide,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 items-center justify-center rounded-lg border text-[13px] transition ${
        wide ? "px-2.5" : "w-8"
      } ${
        active
          ? "border-[#c3b0ec] bg-[#ede6fb] text-[#5c4a91]"
          : "border-transparent bg-white/70 text-[#4b4459] hover:border-[#e2d9f5] hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <div className="mx-1 h-6 w-px bg-[#e4dcf2]" />;

const HEADINGS: { label: string; font: FontKey; size: number; hint: string }[] = [
  { label: "Title", font: "title", size: 88, hint: "Playlist Script" },
  { label: "Heading 1", font: "title", size: 56, hint: "Playlist Script" },
  { label: "Heading 2", font: "sub", size: 34, hint: "Amatic SC" },
  { label: "Heading 3", font: "sub", size: 26, hint: "Amatic SC" },
  { label: "Body", font: "body", size: 17, hint: "Patrick Hand" },
  { label: "Equation", font: "equation", size: 15, hint: "Kalam" },
];

export default function Ribbon({
  api,
  zoom,
  setZoom,
  fitZoom,
  tool,
  setTool,
  onToggleToolbox,
  toolboxOpen,
}: {
  api: EditorApi;
  zoom: number;
  setZoom: (z: number) => void;
  fitZoom: number;
  tool: Tool;
  setTool: (t: Tool) => void;
  onToggleToolbox: () => void;
  toolboxOpen: boolean;
}) {
  const [showHeadings, setShowHeadings] = useState(false);
  const [showColors, setShowColors] = useState<null | "text" | "mark">(null);
  const selected = api.selected;
  const textSel = selected && selected.kind === "text" ? (selected as TextElement) : null;

  const applyPreset = (font: FontKey, size: number) => {
    if (!selected) return;
    api.pushHistory();
    api.updateElement(selected.id, { font, fontSize: size } as Partial<TextElement>);
    setShowHeadings(false);
  };

  const saveLabel =
    api.save === "saving"
      ? "Saving…"
      : api.save === "saved"
        ? "All changes saved"
        : api.save === "error"
          ? "Offline — retrying"
          : api.save === "dirty"
            ? "Unsaved changes"
            : "Saved";

  return (
    <div className="nt-no-print sticky top-0 z-30 border-b border-[#e6def3] bg-[#faf7fe]/95 backdrop-blur">
      {/* title row */}
      <div className="flex items-center gap-3 px-3 pt-2.5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-[15px] font-semibold tracking-tight text-[#5c4a91] hover:bg-white"
        >
          <span
            style={{ fontFamily: "var(--font-title)" }}
            className="text-[22px] leading-none"
          >
            Noatic
          </span>
        </Link>
        <input
          value={api.title}
          onChange={(e) => api.setTitle(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-[14px] text-[#3b3548] outline-none hover:border-[#e4dcf2] focus:border-[#c3b0ec] focus:bg-white"
          placeholder="Untitled note"
        />
        <span className="hidden text-[12px] text-[#8b8399] sm:block">{saveLabel}</span>
        <button
          type="button"
          onClick={() => void api.flush()}
          className="rounded-lg border border-[#d9cdf3] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#5c4a91] hover:bg-[#f4eeff]"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[#d9cdf3] bg-white px-3 py-1.5 text-[12.5px] font-medium text-[#5c4a91] hover:bg-[#f4eeff]"
        >
          Export
        </button>
      </div>

      {/* tools row */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2">
        <Btn title="Toolbox" onClick={onToggleToolbox} active={toolboxOpen} wide>
          ☰ Toolbox
        </Btn>
        <Sep />
        <Btn title="Undo (⌘Z)" onClick={api.undo}>
          ↶
        </Btn>
        <Btn title="Redo (⌘⇧Z)" onClick={api.redo}>
          ↷
        </Btn>
        <Sep />
        <Btn title="Select / move" onClick={() => setTool("select")} active={tool === "select"}>
          ⬚
        </Btn>
        <Btn title="Text box" onClick={() => setTool("text")} active={tool === "text"} wide>
          T&nbsp;Text
        </Btn>
        <Btn title="Pen" onClick={() => setTool("pen")} active={tool === "pen"} wide>
          ✎ Pen
        </Btn>
        <Sep />

        {/* headings */}
        <div className="relative">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setShowHeadings((s) => !s)}
            disabled={!selected}
            className="flex h-8 items-center gap-1 rounded-lg border border-transparent bg-white/70 px-2.5 text-[13px] text-[#4b4459] hover:border-[#e2d9f5] hover:bg-white disabled:opacity-40"
          >
            {textSel
              ? (HEADINGS.find((h) => h.font === textSel.font && h.size === textSel.fontSize)
                  ?.label ?? "Style")
              : "Style"}
            <span className="text-[10px]">▾</span>
          </button>
          {showHeadings && (
            <div className="absolute left-0 top-9 z-40 w-56 rounded-xl border border-[#e6def3] bg-white p-1.5 shadow-xl">
              {HEADINGS.map((h) => (
                <button
                  key={h.label}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyPreset(h.font, h.size)}
                  className="flex w-full items-baseline justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-[#f5efff]"
                >
                  <span
                    style={{ fontFamily: fontCss(h.font) }}
                    className="text-[17px] text-[#3b3548]"
                  >
                    {h.label}
                  </span>
                  <span className="text-[11px] text-[#9b93ab]">{h.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* font family for the selected block */}
        <select
          value={textSel?.font ?? ""}
          disabled={!selected}
          onChange={(e) => {
            if (!selected) return;
            api.pushHistory();
            api.updateElement(selected.id, { font: e.target.value as FontKey } as Partial<TextElement>);
          }}
          className="h-8 rounded-lg border border-[#e6def3] bg-white px-2 text-[12.5px] text-[#4b4459] disabled:opacity-40"
        >
          <option value="" disabled>
            Font
          </option>
          {FONT_LIST.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={8}
          max={160}
          value={textSel?.fontSize ?? 17}
          disabled={!textSel}
          onChange={(e) => {
            if (!textSel) return;
            api.updateElement(textSel.id, { fontSize: Number(e.target.value) });
          }}
          className="h-8 w-16 rounded-lg border border-[#e6def3] bg-white px-2 text-[12.5px] disabled:opacity-40"
        />

        <Sep />
        <Btn title="Bold" onClick={() => exec("bold")}>
          <b>B</b>
        </Btn>
        <Btn title="Italic" onClick={() => exec("italic")}>
          <i>I</i>
        </Btn>
        <Btn title="Underline" onClick={() => exec("underline")}>
          <u>U</u>
        </Btn>
        <Btn title="Wavy underline" onClick={() => wrapSelection("nt-wavy")} wide>
          <span className="nt-wavy">wavy</span>
        </Btn>
        <Btn
          title="Marker highlight"
          onClick={() => wrapSelection("nt-marker", HIGHLIGHTS[0])}
          wide
        >
          <span
            className="nt-marker"
            style={{ "--mk": HIGHLIGHTS[0] } as React.CSSProperties}
          >
            marker
          </span>
        </Btn>
        <Btn title="Circle it" onClick={() => wrapSelection("nt-circle")} wide>
          <span className="nt-circle">circle</span>
        </Btn>

        <Sep />
        <div className="relative">
          <Btn
            title="Text colour"
            onClick={() => setShowColors((s) => (s === "text" ? null : "text"))}
            wide
          >
            A<span className="ml-1 inline-block h-2.5 w-4 rounded-sm bg-[#8a6fd1]" />
          </Btn>
          {showColors === "text" && (
            <div className="absolute left-0 top-9 z-40 grid w-[184px] grid-cols-5 gap-1.5 rounded-xl border border-[#e6def3] bg-white p-2 shadow-xl">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    exec("foreColor", c);
                    if (selected && !api.editingId) {
                      api.updateElement(selected.id, { color: c } as Partial<TextElement>);
                    }
                    setShowColors(null);
                  }}
                  className="h-6 w-6 rounded-md border border-black/10"
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Btn
            title="Highlighter"
            onClick={() => setShowColors((s) => (s === "mark" ? null : "mark"))}
            wide
          >
            ▨<span className="ml-1 inline-block h-2.5 w-4 rounded-sm bg-[#e0d3fb]" />
          </Btn>
          {showColors === "mark" && (
            <div className="absolute left-0 top-9 z-40 w-[184px] rounded-xl border border-[#e6def3] bg-white p-2 shadow-xl">
              <p className="mb-1.5 text-[11px] text-[#8b8399]">Marker (uneven edge)</p>
              <div className="grid grid-cols-6 gap-1.5">
                {HIGHLIGHTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      wrapSelection("nt-marker", c);
                      setShowColors(null);
                    }}
                    className="h-6 w-6 rounded-md border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <p className="mb-1.5 mt-2 text-[11px] text-[#8b8399]">Flat background</p>
              <div className="grid grid-cols-6 gap-1.5">
                {HIGHLIGHTS.map((c) => (
                  <button
                    key={`f${c}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      exec("hiliteColor", c);
                      setShowColors(null);
                    }}
                    className="h-6 w-6 rounded-md border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Sep />
        <Btn title="Align left" onClick={() => selected && api.updateElement(selected.id, { align: "left" } as Partial<TextElement>)}>
          ⇤
        </Btn>
        <Btn title="Align centre" onClick={() => selected && api.updateElement(selected.id, { align: "center" } as Partial<TextElement>)}>
          ≡
        </Btn>
        <Btn title="Align right" onClick={() => selected && api.updateElement(selected.id, { align: "right" } as Partial<TextElement>)}>
          ⇥
        </Btn>
        <Btn title="Bulleted list" onClick={() => exec("insertUnorderedList")}>
          •
        </Btn>
        <Btn title="Clear formatting" onClick={() => exec("removeFormat")} wide>
          ⌫ clear
        </Btn>

        <div className="ml-auto flex items-center gap-1">
          <Btn title="Zoom out" onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}>
            −
          </Btn>
          <span className="w-12 text-center text-[12px] tabular-nums text-[#6d6580]">
            {Math.round(zoom * 100)}%
          </span>
          <Btn title="Zoom in" onClick={() => setZoom(Math.min(2.5, zoom + 0.1))}>
            +
          </Btn>
          <Btn title="Fit page" onClick={() => setZoom(fitZoom)} wide>
            Fit
          </Btn>
          <Btn title="Actual size (true paper size)" onClick={() => setZoom(1)} wide>
            100%
          </Btn>
        </div>
      </div>
    </div>
  );
}
