"use client";

import {
  useCallback,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
} from "react";
import { paperBackground, paperDims, uid } from "@/lib/editor/paper";
import { STICKERS } from "@/lib/editor/stickers";
import { shape as makeShape, sticker as makeSticker, text as makeText } from "@/lib/editor/templates";
import type { NoteElement, ShapeKind } from "@/lib/editor/types";
import ElementView from "./ElementView";
import type { EditorApi } from "./useEditor";

export type Tool = "select" | "text" | "pen" | "eraser";

interface Props {
  api: EditorApi;
  zoom: number;
  tool: Tool;
  setTool: (t: Tool) => void;
  penColor: string;
  penWidth: number;
  onContextMenu: (id: string, x: number, y: number) => void;
  paperRef: React.RefObject<HTMLDivElement | null>;
}

interface Pt {
  x: number;
  y: number;
}

function toPath(points: Pt[]): string {
  if (points.length < 2) {
    const p = points[0];
    return p ? `M ${p.x} ${p.y} L ${p.x + 0.6} ${p.y}` : "";
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
  return d;
}

export default function PaperCanvas({
  api,
  zoom,
  tool,
  setTool,
  penColor,
  penWidth,
  onContextMenu,
  paperRef,
}: Props) {
  const { doc } = api;
  const dims = paperDims(doc.paper);
  const [stroke, setStroke] = useState<Pt[]>([]);
  const drawing = useRef(false);

  const setSelectedId = api.setSelectedId;
  const setEditingId = api.setEditingId;
  const removeElement = api.removeElement;

  const selectElement = useCallback(
    (id: string) => {
      setSelectedId(id);
      setEditingId((current: string | null) => (current && current !== id ? null : current));
    },
    [setSelectedId, setEditingId],
  );
  const startEdit = useCallback((id: string) => setEditingId(id), [setEditingId]);
  const removeEmpty = useCallback((id: string) => removeElement(id), [removeElement]);

  const pointFromEvent = (clientX: number, clientY: number): Pt => {
    const rect = paperRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom };
  };

  const finishStroke = (points: Pt[]) => {
    if (points.length < 2) return;
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const pad = penWidth + 4;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(...xs) - minX + pad;
    const h = Math.max(...ys) - minY + pad;
    const local = points.map((p) => ({ x: p.x - minX, y: p.y - minY }));
    api.addElement(
      {
        id: uid("dw"),
        kind: "draw",
        x: Math.round(minX),
        y: Math.round(minY),
        w: Math.round(w),
        h: Math.round(h),
        vw: Math.round(w),
        vh: Math.round(h),
        rotation: 0,
        z: 0,
        opacity: 1,
        strokes: [{ d: toPath(local), color: penColor, width: penWidth }],
      },
      { select: false },
    );
  };

  /** pending "click did nothing" candidate for instant typing */
  const tapDown = useRef<{ x: number; y: number } | null>(null);

  const spawnTextAt = (p: Pt) => {
    const el = makeText({
      x: Math.round(p.x - 8),
      y: Math.round(p.y - 14),
      w: 280,
      h: 40,
      html: "",
      fontSize: 18,
    });
    api.addElement(el, { edit: true });
  };

  const onSheetPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    if (tool === "pen") {
      e.preventDefault();
      drawing.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setStroke([pointFromEvent(e.clientX, e.clientY)]);
      return;
    }
    if (tool === "text") {
      const p = pointFromEvent(e.clientX, e.clientY);
      const el = makeText({
        x: Math.round(p.x),
        y: Math.round(p.y),
        w: 260,
        h: 40,
        html: "",
        fontSize: 18,
      });
      api.addElement(el, { edit: true });
      setTool("select");
      return;
    }
    api.setSelectedId(null);
    api.setEditingId(null);
    /* remember the tap — "click anywhere on empty paper starts typing" */
    tapDown.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onSheetPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drawing.current) return;
    setStroke((s) => [...s, pointFromEvent(e.clientX, e.clientY)]);
  };

  const onSheetPointerUp = (e: RPointerEvent<HTMLDivElement>) => {
    if (drawing.current) {
      drawing.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
      finishStroke(stroke);
      setStroke([]);
      return;
    }
    if (tapDown.current && tool === "select") {
      const moved = Math.hypot(e.clientX - tapDown.current.x, e.clientY - tapDown.current.y);
      tapDown.current = null;
      if (moved < 6) {
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          /* noop */
        }
        spawnTextAt(pointFromEvent(e.clientX, e.clientY));
      }
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/x-noatic");
    if (!raw) return;
    const p = pointFromEvent(e.clientX, e.clientY);
    try {
      const data = JSON.parse(raw) as { type: string; id?: string };
      if (data.type === "sticker" && data.id) {
        const def = STICKERS[data.id];
        const w = def?.size[0] ?? 60;
        const h = def?.size[1] ?? 60;
        api.addElement(
          makeSticker({
            x: Math.round(p.x - w / 2),
            y: Math.round(p.y - h / 2),
            w,
            h,
            sticker: data.id,
            color: def?.color,
            accent: def?.accent,
          }),
        );
      } else if (data.type === "shape" && data.id) {
        const kind = data.id as ShapeKind;
        const w = kind === "banner" || kind === "tape" ? 220 : 200;
        const h = kind === "banner" || kind === "tape" ? 66 : 130;
        api.addElement(
          makeShape({
            x: Math.round(p.x - w / 2),
            y: Math.round(p.y - h / 2),
            w,
            h,
            shape: kind,
            html: kind === "tape" ? "" : "Type here",
          }),
        );
      }
    } catch {
      /* ignore malformed payloads */
    }
  };

  const elements = [...doc.elements].sort((a, b) => a.z - b.z);

  return (
    <div
      ref={paperRef}
      className="nt-shadow-paper relative select-none"
      style={{
        width: dims.w,
        height: dims.h,
        ...paperBackground(doc.paper),
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
        cursor: tool === "pen" ? "crosshair" : "text",
      }}
      onPointerDown={onSheetPointerDown}
      onPointerMove={onSheetPointerMove}
      onPointerUp={onSheetPointerUp}
      onPointerCancel={onSheetPointerUp}
      onDoubleClick={(e) => {
        if (tool !== "select") return;
        if ((e.target as HTMLElement).closest("[data-el]")) return;
        const p = pointFromEvent(e.clientX, e.clientY);
        api.addElement(
          makeText({
            x: Math.round(p.x),
            y: Math.round(p.y - 12),
            w: 280,
            h: 40,
            html: "",
            fontSize: 18,
          }),
          { edit: true },
        );
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* hand-drawn wobble filter, shared by shapes */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="nt-wobble">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.028"
              numOctaves={2}
              seed={7}
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
          </filter>
        </defs>
      </svg>

      {elements.map((el: NoteElement) => (
        <ElementView
          key={el.id}
          el={el}
          zoom={zoom}
          interactive={tool === "select"}
          selected={api.selectedId === el.id}
          editing={api.editingId === el.id}
          onSelect={selectElement}
          onStartEdit={startEdit}
          onChange={api.updateElement}
          onGestureStart={api.beginGesture}
          onGestureEnd={api.endGesture}
          onContextMenu={onContextMenu}
          onEmptyBlur={removeEmpty}
        />
      ))}

      {stroke.length > 1 && (
        <svg
          width={dims.w}
          height={dims.h}
          style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 9999 }}
        >
          <path
            d={toPath(stroke)}
            fill="none"
            stroke={penColor}
            strokeWidth={penWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
