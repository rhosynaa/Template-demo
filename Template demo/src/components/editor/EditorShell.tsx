"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { deskBackground, paperDims } from "@/lib/editor/paper";
import type { NoteRecord } from "@/lib/editor/types";
import PaperCanvas, { type Tool } from "./PaperCanvas";
import Ribbon from "./Ribbon";
import Toolbox from "./Toolbox";
import { useEditor } from "./useEditor";

export default function EditorShell({ note }: { note: NoteRecord }) {
  const api = useEditor(note.id, note.doc, note.title);
  const [tool, setTool] = useState<Tool>("select");
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [penColor, setPenColor] = useState("#8a6fd1");
  const [penWidth, setPenWidth] = useState(3);
  const [zoom, setZoom] = useState(0.8);
  const [fitZoom, setFitZoom] = useState(0.8);
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const deskRef = useRef<HTMLDivElement | null>(null);
  const paperRef = useRef<HTMLDivElement | null>(null);
  const touchedZoom = useRef(false);
  const dims = paperDims(api.doc.paper);

  /* ---- fit-to-desk, Word style ---- */
  useEffect(() => {
    const node = deskRef.current;
    if (!node) return;
    const measure = () => {
      const w = node.clientWidth - 96;
      const h = node.clientHeight - 72;
      const next = Math.max(0.2, Math.min(1, Math.min(w / dims.w, h / dims.h)));
      setFitZoom(Number(next.toFixed(3)));
      if (!touchedZoom.current) setZoom(Number(next.toFixed(3)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [dims.w, dims.h]);

  const changeZoom = useCallback((z: number) => {
    touchedZoom.current = true;
    setZoom(Number(z.toFixed(3)));
  }, []);

  /* ---- shortcuts ---- */
  const apiRef = useRef(api);
  apiRef.current = api;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const a = apiRef.current;
      const t = e.target as HTMLElement | null;
      const typing =
        !!t &&
        (t.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape" && a.editingId) {
        e.preventDefault();
        a.setEditingId(null);
        return;
      }
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) a.redo();
        else a.undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void a.flush();
        return;
      }
      if (typing) return;
      if (mod && e.key.toLowerCase() === "d" && a.selectedId) {
        e.preventDefault();
        a.duplicateElement(a.selectedId);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && a.selectedId) {
        e.preventDefault();
        a.removeElement(a.selectedId);
        return;
      }
      if (e.key === "Escape") {
        a.setSelectedId(null);
        a.setEditingId(null);
        setMenu(null);
        setTool("select");
        return;
      }
      if (e.key.startsWith("Arrow") && a.selectedId && a.selected) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        a.updateElement(a.selectedId, { x: a.selected.x + dx, y: a.selected.y + dy });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const desk = api.doc.desk;

  const menuItems: { label: string; run: () => void }[] = menu
    ? [
        { label: "Bring to front", run: () => api.reorder(menu.id, "front") },
        { label: "Bring forward", run: () => api.reorder(menu.id, "forward") },
        { label: "Send backward", run: () => api.reorder(menu.id, "backward") },
        { label: "Send to back", run: () => api.reorder(menu.id, "back") },
        { label: "Duplicate", run: () => api.duplicateElement(menu.id) },
        {
          label: api.doc.elements.find((e) => e.id === menu.id)?.locked ? "Unlock" : "Lock",
          run: () => {
            const el = api.doc.elements.find((e) => e.id === menu.id);
            if (el) api.updateElement(menu.id, { locked: !el.locked });
          },
        },
        { label: "Delete", run: () => api.removeElement(menu.id) },
      ]
    : [];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f2fb]">
      <Ribbon
        api={api}
        zoom={zoom}
        setZoom={changeZoom}
        fitZoom={fitZoom}
        tool={tool}
        setTool={setTool}
        toolboxOpen={toolboxOpen}
        onToggleToolbox={() => setToolboxOpen((s) => !s)}
      />

      <div className="flex min-h-0 flex-1">
        <Toolbox
          api={api}
          open={toolboxOpen}
          onClose={() => setToolboxOpen(false)}
          penColor={penColor}
          setPenColor={setPenColor}
          penWidth={penWidth}
          setPenWidth={setPenWidth}
          tool={tool}
          setTool={setTool}
        />

        {!toolboxOpen && (
          <button
            type="button"
            onClick={() => setToolboxOpen(true)}
            className="nt-no-print h-full w-8 shrink-0 border-r border-[#e8e0f5] bg-[#fbf9ff] text-[#9a90b0] hover:text-[#5c4a91]"
            title="Show toolbox"
          >
            ››
          </button>
        )}

        {/* ------------------------------ the desk ------------------------------ */}
        <div
          ref={deskRef}
          className="nt-scroll relative flex-1 overflow-auto"
          style={deskBackground(desk)}
        >
          <div className="relative flex min-h-full w-full justify-center px-12 py-9">
            <div
              style={{ width: dims.w * zoom, height: dims.h * zoom }}
              className="relative"
            >
              <PaperCanvas
                api={api}
                zoom={zoom}
                tool={tool}
                setTool={setTool}
                penColor={penColor}
                penWidth={penWidth}
                paperRef={paperRef}
                onContextMenu={(id, x, y) => setMenu({ id, x, y })}
              />
            </div>
          </div>
        </div>
      </div>

      {menu && (
        <div
          className="nt-no-print fixed z-50 w-48 overflow-hidden rounded-xl border border-[#e6def3] bg-white py-1 shadow-2xl"
          style={{ left: menu.x, top: menu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                item.run();
                setMenu(null);
              }}
              className={`block w-full px-3 py-1.5 text-left text-[13px] hover:bg-[#f5efff] ${
                item.label === "Delete" ? "text-[#c4607f]" : "text-[#4b4459]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="nt-no-print flex items-center justify-between border-t border-[#e8e0f5] bg-[#faf7fe] px-4 py-1.5 text-[11.5px] text-[#8b8399]">
        <span>
          {api.doc.elements.length} objects · {paperDims(api.doc.paper).label}{" "}
          {paperDims(api.doc.paper).hint}
        </span>
        <span className="hidden md:block">
          Click anywhere on the paper to type · drag stickers from the toolbox · right-click an
          object to change its layer
        </span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
