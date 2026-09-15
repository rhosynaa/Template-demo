"use client";

import { useMemo, useRef, useState } from "react";
import {
  PALETTE,
  PAPER_PATTERNS,
  PAPER_SIZE_LIST,
  SWATCHES,
  uid,
} from "@/lib/editor/paper";
import {
  STICKER_CATEGORY_LABELS,
  STICKER_LIST,
  StickerSvg,
  type StickerCategory,
} from "@/lib/editor/stickers";
import {
  TEMPLATES,
  shape as makeShape,
  sticker as makeSticker,
} from "@/lib/editor/templates";
import type {
  ImageElement,
  ShapeElement,
  ShapeKind,
  StickerElement,
} from "@/lib/editor/types";
import type { EditorApi } from "./useEditor";
import type { Tool } from "./PaperCanvas";

type Tab = "paper" | "desk" | "stickers" | "shapes" | "media" | "layers";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "paper", label: "Paper", icon: "▤" },
  { id: "desk", label: "Desk", icon: "▦" },
  { id: "stickers", label: "Stickers", icon: "✦" },
  { id: "shapes", label: "Shapes", icon: "◍" },
  { id: "media", label: "Media", icon: "🖼" },
  { id: "layers", label: "Layers", icon: "≡" },
];

const SHAPE_ITEMS: { id: ShapeKind; label: string }[] = [
  { id: "rect", label: "Rounded box" },
  { id: "circle", label: "Circle" },
  { id: "cloud", label: "Cloud" },
  { id: "banner", label: "Banner" },
  { id: "bubble", label: "Speech bubble" },
  { id: "tape", label: "Tape strip" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#eee7f8] px-4 py-3.5">
      <h4 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a90b0]">
        {title}
      </h4>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-2 flex items-center justify-between gap-3 text-[12.5px] text-[#5c5470]">
      <span className="shrink-0">{label}</span>
      {children}
    </label>
  );
}

export default function Toolbox({
  api,
  open,
  onClose,
  penColor,
  setPenColor,
  penWidth,
  setPenWidth,
  tool,
  setTool,
}: {
  api: EditorApi;
  open: boolean;
  onClose: () => void;
  penColor: string;
  setPenColor: (c: string) => void;
  penWidth: number;
  setPenWidth: (n: number) => void;
  tool: Tool;
  setTool: (t: Tool) => void;
}) {
  const [tab, setTab] = useState<Tab>("paper");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const deskFileRef = useRef<HTMLInputElement | null>(null);
  const { doc, selected } = api;

  const grouped = useMemo(() => {
    const map = new Map<StickerCategory, typeof STICKER_LIST>();
    STICKER_LIST.forEach((s) => {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    });
    return [...map.entries()];
  }, []);

  const addImageFromFile = (file: File, target: "paper" | "desk") => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      if (target === "desk") {
        api.setDesk({ imageUrl: src });
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxW = 340;
        const ratio = img.height / img.width || 1;
        const w = Math.min(maxW, img.width || maxW);
        const el: ImageElement = {
          id: uid("im"),
          kind: "image",
          x: 120,
          y: 160,
          w,
          h: Math.round(w * ratio),
          rotation: 0,
          z: 0,
          opacity: 1,
          src,
          radius: 8,
        };
        api.addElement(el);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <aside className="nt-no-print flex h-full w-[286px] shrink-0 flex-col border-r border-[#e8e0f5] bg-[#fbf9ff]">
      <div className="flex items-center justify-between px-4 pb-1 pt-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8a7fa6]">
          Toolbox
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-0.5 text-[16px] leading-none text-[#9a90b0] hover:bg-white"
          title="Hide toolbox"
        >
          ‹‹
        </button>
      </div>

      <div className="flex flex-wrap gap-1 px-3 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-2.5 py-1.5 text-[12px] transition ${
              tab === t.id
                ? "bg-[#ece3fc] text-[#5c4a91]"
                : "text-[#6d6580] hover:bg-white"
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="nt-scroll flex-1 overflow-y-auto">
        {tab === "paper" && (
          <>
            <Section title="Paper size">
              <div className="grid grid-cols-2 gap-1.5">
                {PAPER_SIZE_LIST.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => api.setPaper({ size: s.id })}
                    className={`rounded-lg border px-2 py-1.5 text-left text-[12px] ${
                      doc.paper.size === s.id
                        ? "border-[#c3b0ec] bg-[#f1e9ff] text-[#5c4a91]"
                        : "border-[#e8e0f5] bg-white text-[#5c5470] hover:border-[#d6c8f0]"
                    }`}
                  >
                    <span className="block font-medium">{s.label}</span>
                    <span className="text-[10.5px] text-[#9a90b0]">{s.hint}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Paper type">
              <div className="grid grid-cols-2 gap-1.5">
                {PAPER_PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => api.setPaper({ pattern: p.id })}
                    className={`rounded-lg border px-2 py-1.5 text-[12px] ${
                      doc.paper.pattern === p.id
                        ? "border-[#c3b0ec] bg-[#f1e9ff] text-[#5c4a91]"
                        : "border-[#e8e0f5] bg-white text-[#5c5470] hover:border-[#d6c8f0]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Colours">
              <Row label="Ruling colour">
                <input
                  type="color"
                  value={doc.paper.accent}
                  onChange={(e) => api.setPaper({ accent: e.target.value }, false)}
                  className="h-7 w-12 rounded-md"
                />
              </Row>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["#e3ddf2", "#dfe9f5", "#e7f0e4", "#f7e3ea", "#f0e9d8", "#d8d4e0"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => api.setPaper({ accent: c })}
                    className="h-5 w-5 rounded border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <Row label="Sheet colour">
                <input
                  type="color"
                  value={doc.paper.color}
                  onChange={(e) => api.setPaper({ color: e.target.value }, false)}
                  className="h-7 w-12 rounded-md"
                />
              </Row>
              <Row label={`Line gap ${doc.paper.lineGap}px`}>
                <input
                  type="range"
                  min={12}
                  max={48}
                  value={doc.paper.lineGap}
                  onChange={(e) => api.setPaper({ lineGap: Number(e.target.value) }, false)}
                  className="w-32"
                />
              </Row>
            </Section>

            <Section title="Start over">
              <div className="grid gap-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (confirm(`Replace this page with “${t.name}”?`)) {
                        api.replaceDoc(t.build());
                      }
                    }}
                    className="rounded-lg border border-[#e8e0f5] bg-white px-2.5 py-1.5 text-left text-[12px] text-[#5c5470] hover:border-[#c3b0ec]"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </Section>
          </>
        )}

        {tab === "desk" && (
          <>
            <Section title="Desk background">
              <Row label="Desk colour">
                <input
                  type="color"
                  value={doc.desk.color}
                  onChange={(e) => api.setDesk({ color: e.target.value }, false)}
                  className="h-7 w-12 rounded-md"
                />
              </Row>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {["#efe9f7", "#eef0f6", "#f3ece6", "#e9f0ec", "#2f2a3a", "#f7eef3"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => api.setDesk({ color: c })}
                    className="h-5 w-5 rounded border border-black/10"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => deskFileRef.current?.click()}
                className="mb-2 w-full rounded-lg border border-dashed border-[#c8b8ea] bg-white px-3 py-2 text-[12.5px] text-[#5c4a91] hover:bg-[#f7f2ff]"
              >
                Upload desk image
              </button>
              <input
                ref={deskFileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addImageFromFile(f, "desk");
                  e.target.value = "";
                }}
              />
              <input
                type="url"
                placeholder="…or paste an image URL"
                defaultValue={doc.desk.imageUrl?.startsWith("data:") ? "" : (doc.desk.imageUrl ?? "")}
                onBlur={(e) => api.setDesk({ imageUrl: e.target.value || null })}
                className="mb-2 w-full rounded-lg border border-[#e8e0f5] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#c3b0ec]"
              />
              <Row label={`Image opacity ${Math.round(doc.desk.imageOpacity * 100)}%`}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(doc.desk.imageOpacity * 100)}
                  onChange={(e) =>
                    api.setDesk({ imageOpacity: Number(e.target.value) / 100 }, false)
                  }
                  className="w-28"
                />
              </Row>
              <Row label="Soft lighting">
                <input
                  type="checkbox"
                  checked={doc.desk.texture}
                  onChange={(e) => api.setDesk({ texture: e.target.checked })}
                />
              </Row>
              {doc.desk.imageUrl && (
                <button
                  type="button"
                  onClick={() => api.setDesk({ imageUrl: null })}
                  className="mt-1 text-[12px] text-[#a08fc4] underline"
                >
                  Remove desk image
                </button>
              )}
            </Section>
          </>
        )}

        {tab === "stickers" && (
          <>
            {grouped.map(([cat, list]) => (
              <Section key={cat} title={STICKER_CATEGORY_LABELS[cat]}>
                <div className="grid grid-cols-4 gap-1.5">
                  {list.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      title={`${s.label} — drag or click`}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData(
                          "application/x-noatic",
                          JSON.stringify({ type: "sticker", id: s.id }),
                        )
                      }
                      onClick={() =>
                        api.addElement(
                          makeSticker({
                            x: 260,
                            y: 260,
                            w: s.size[0],
                            h: s.size[1],
                            sticker: s.id,
                            color: s.color,
                            accent: s.accent,
                          }),
                        )
                      }
                      className="flex aspect-square items-center justify-center rounded-lg border border-[#eee7f8] bg-white p-1.5 hover:border-[#c3b0ec]"
                    >
                      <StickerSvg sticker={s.id} />
                    </button>
                  ))}
                </div>
              </Section>
            ))}
          </>
        )}

        {tab === "shapes" && (
          <>
            <Section title="Shape builder">
              <div className="grid grid-cols-2 gap-1.5">
                {SHAPE_ITEMS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        "application/x-noatic",
                        JSON.stringify({ type: "shape", id: s.id }),
                      )
                    }
                    onClick={() =>
                      api.addElement(
                        makeShape({
                          x: 240,
                          y: 300,
                          w: s.id === "banner" || s.id === "tape" ? 220 : 200,
                          h: s.id === "banner" || s.id === "tape" ? 66 : 130,
                          shape: s.id,
                          html: s.id === "tape" ? "" : "Type here",
                        }),
                      )
                    }
                    className="rounded-lg border border-[#e8e0f5] bg-white px-2 py-2 text-[12px] text-[#5c5470] hover:border-[#c3b0ec]"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11.5px] leading-snug text-[#9a90b0]">
                Double-click a shape to type inside it. Drag corners to resize, use the round
                handle to rotate.
              </p>
            </Section>

            <Section title="Pen tool">
              <Row label="Colour">
                <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
                  className="h-7 w-12 rounded-md"
                />
              </Row>
              <Row label={`Width ${penWidth}px`}>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="w-28"
                />
              </Row>
              <button
                type="button"
                onClick={() => setTool(tool === "pen" ? "select" : "pen")}
                className={`w-full rounded-lg border px-3 py-2 text-[12.5px] ${
                  tool === "pen"
                    ? "border-[#c3b0ec] bg-[#ece3fc] text-[#5c4a91]"
                    : "border-[#e8e0f5] bg-white text-[#5c5470]"
                }`}
              >
                {tool === "pen" ? "Drawing… click to stop" : "Start freehand drawing"}
              </button>
            </Section>
          </>
        )}

        {tab === "media" && (
          <>
            <Section title="Upload image">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-lg border border-dashed border-[#c8b8ea] bg-white px-3 py-4 text-[12.5px] text-[#5c4a91] hover:bg-[#f7f2ff]"
              >
                Choose an image from your computer
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) addImageFromFile(f, "paper");
                  e.target.value = "";
                }}
              />
              <p className="mt-2 text-[11.5px] leading-snug text-[#9a90b0]">
                Images land on the page as free-floating objects — drag, resize, rotate and set
                their opacity below.
              </p>
            </Section>

            {selected?.kind === "image" && (
              <Section title="Selected image">
                <Row label={`Opacity ${Math.round(selected.opacity * 100)}%`}>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={Math.round(selected.opacity * 100)}
                    onChange={(e) =>
                      api.updateElement(selected.id, { opacity: Number(e.target.value) / 100 })
                    }
                    className="w-28"
                  />
                </Row>
                <Row label={`Corner radius ${(selected as ImageElement).radius ?? 0}px`}>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    value={(selected as ImageElement).radius ?? 0}
                    onChange={(e) =>
                      api.updateElement(selected.id, {
                        radius: Number(e.target.value),
                      } as Partial<ImageElement>)
                    }
                    className="w-28"
                  />
                </Row>
              </Section>
            )}
          </>
        )}

        {tab === "layers" && (
          <Section title={`Layers (${doc.elements.length})`}>
            <div className="flex flex-col gap-1">
              {[...doc.elements]
                .sort((a, b) => b.z - a.z)
                .map((el) => (
                  <div
                    key={el.id}
                    className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[12px] ${
                      api.selectedId === el.id
                        ? "border-[#c3b0ec] bg-[#f4eeff]"
                        : "border-[#eee7f8] bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => api.setSelectedId(el.id)}
                      className="flex-1 truncate text-left text-[#5c5470]"
                    >
                      {el.kind === "text"
                        ? (el.html.replace(/<[^>]+>/g, "").slice(0, 22) || "Text")
                        : el.kind === "sticker"
                          ? `✦ ${(el as StickerElement).sticker}`
                          : el.kind === "shape"
                            ? `◍ ${(el as ShapeElement).shape}`
                            : el.kind === "image"
                              ? "🖼 image"
                              : "✎ drawing"}
                    </button>
                    <button
                      type="button"
                      title="Bring forward"
                      onClick={() => api.reorder(el.id, "forward")}
                      className="px-1 text-[#9a90b0] hover:text-[#5c4a91]"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      title="Send backward"
                      onClick={() => api.reorder(el.id, "backward")}
                      className="px-1 text-[#9a90b0] hover:text-[#5c4a91]"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      title={el.locked ? "Unlock" : "Lock"}
                      onClick={() => api.updateElement(el.id, { locked: !el.locked })}
                      className="px-1 text-[#9a90b0] hover:text-[#5c4a91]"
                    >
                      {el.locked ? "🔒" : "🔓"}
                    </button>
                  </div>
                ))}
            </div>
          </Section>
        )}
      </div>

      {selected && (
        <div className="border-t border-[#e8e0f5] bg-white/70 px-4 py-3">
          <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a90b0]">
            Selected {selected.kind}
          </h4>
          <Row label={`Opacity ${Math.round(selected.opacity * 100)}%`}>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(selected.opacity * 100)}
              onChange={(e) =>
                api.updateElement(selected.id, { opacity: Number(e.target.value) / 100 })
              }
              className="w-28"
            />
          </Row>
          <Row label={`Rotation ${selected.rotation}°`}>
            <input
              type="range"
              min={-180}
              max={180}
              value={selected.rotation}
              onChange={(e) =>
                api.updateElement(selected.id, { rotation: Number(e.target.value) })
              }
              className="w-28"
            />
          </Row>
          {(selected.kind === "sticker" || selected.kind === "shape") && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SWATCHES.slice(0, 12).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() =>
                    api.updateElement(
                      selected.id,
                      selected.kind === "sticker" ? { color: c } : { fill: c },
                    )
                  }
                  className="h-5 w-5 rounded border border-black/10"
                  style={{ background: c }}
                />
              ))}
            </div>
          )}
          <div className="mt-1 flex gap-1.5">
            <button
              type="button"
              onClick={() => api.reorder(selected.id, "front")}
              className="flex-1 rounded-lg border border-[#e8e0f5] bg-white px-2 py-1 text-[11.5px] text-[#5c5470] hover:border-[#c3b0ec]"
            >
              To front
            </button>
            <button
              type="button"
              onClick={() => api.reorder(selected.id, "back")}
              className="flex-1 rounded-lg border border-[#e8e0f5] bg-white px-2 py-1 text-[11.5px] text-[#5c5470] hover:border-[#c3b0ec]"
            >
              To back
            </button>
            <button
              type="button"
              onClick={() => api.removeElement(selected.id)}
              className="rounded-lg border border-[#f0d4dd] bg-white px-2 py-1 text-[11.5px] text-[#b4607f] hover:bg-[#fdf2f6]"
              style={{ color: PALETTE.red }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
