"use client";

import {
  memo,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as RPointerEvent,
} from "react";
import { fontCss } from "@/lib/editor/paper";
import { StickerSvg } from "@/lib/editor/stickers";
import type { NoteElement, ShapeElement, TextElement } from "@/lib/editor/types";

export interface ElementCallbacks {
  zoom: number;
  selected: boolean;
  editing: boolean;
  onSelect: (id: string) => void;
  onStartEdit: (id: string) => void;
  onChange: (id: string, patch: Partial<NoteElement>) => void;
  onGestureStart: () => void;
  onGestureEnd: () => void;
  onContextMenu: (id: string, x: number, y: number) => void;
  onEmptyBlur: (id: string) => void;
  /** false while the pen / text tools own the canvas */
  interactive: boolean;
}

type HandleId = "nw" | "ne" | "sw" | "se" | "n" | "s" | "w" | "e";

const HANDLES: { id: HandleId; style: CSSProperties; cursor: string }[] = [
  { id: "nw", style: { left: -6, top: -6 }, cursor: "nwse-resize" },
  { id: "ne", style: { right: -6, top: -6 }, cursor: "nesw-resize" },
  { id: "sw", style: { left: -6, bottom: -6 }, cursor: "nesw-resize" },
  { id: "se", style: { right: -6, bottom: -6 }, cursor: "nwse-resize" },
  { id: "n", style: { left: "50%", top: -6, marginLeft: -5.5 }, cursor: "ns-resize" },
  { id: "s", style: { left: "50%", bottom: -6, marginLeft: -5.5 }, cursor: "ns-resize" },
  { id: "w", style: { left: -6, top: "50%", marginTop: -5.5 }, cursor: "ew-resize" },
  { id: "e", style: { right: -6, top: "50%", marginTop: -5.5 }, cursor: "ew-resize" },
];

const SIGNS: Record<HandleId, [number, number]> = {
  nw: [-1, -1],
  ne: [1, -1],
  sw: [-1, 1],
  se: [1, 1],
  n: [0, -1],
  s: [0, 1],
  w: [-1, 0],
  e: [1, 0],
};

function rot(x: number, y: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return { x: x * c - y * s, y: x * s + y * c };
}

/* ------------------------------------------------------------------ */

export function ShapeSvg({ el }: { el: ShapeElement }) {
  const common = {
    fill: el.fill,
    stroke: el.stroke,
    strokeWidth: el.strokeWidth,
    strokeDasharray: el.dashed ? "7 6" : undefined,
    strokeLinejoin: "round" as const,
    filter: el.wavyBorder ? "url(#nt-wobble)" : undefined,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const vb =
    el.shape === "banner" ? "0 0 200 60" : el.shape === "tape" ? "0 0 200 60" : "0 0 200 120";
  return (
    <svg
      viewBox={vb}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ display: "block", position: "absolute", inset: 0 }}
    >
      {el.shape === "rect" && <rect x="2" y="2" width="196" height="116" rx="10" {...common} />}
      {el.shape === "circle" && <ellipse cx="100" cy="60" rx="97" ry="57" {...common} />}
      {el.shape === "cloud" && (
        <path
          d="M46 112C22 112 6 96 6 76s16-35 38-35C48 20 68 6 92 6c25 0 45 15 49 37 19 2 33 16 33 35 0 20-17 34-40 34Z"
          {...common}
        />
      )}
      {el.shape === "banner" && <path d="M0 0H200L182 30 200 60H0L18 30Z" {...common} />}
      {el.shape === "bubble" && (
        <path
          d="M14 4h172a10 10 0 0 1 10 10v70a10 10 0 0 1-10 10H72l-24 22 4-22H14A10 10 0 0 1 4 84V14A10 10 0 0 1 14 4Z"
          {...common}
        />
      )}
      {el.shape === "tape" && <path d="M4 12 196 2l-2 46L2 58Z" {...common} />}
    </svg>
  );
}

/* ------------------------------------------------------------------ */

function ElementViewBase({
  el,
  zoom,
  selected,
  editing,
  onSelect,
  onStartEdit,
  onChange,
  onGestureStart,
  onGestureEnd,
  onContextMenu,
  onEmptyBlur,
  interactive,
}: { el: NoteElement } & ElementCallbacks) {
  const editableRef = useRef<HTMLDivElement | null>(null);
  const latestHtml = useRef<string>("");
  const isTexty = el.kind === "text" || el.kind === "shape";
  const html = el.kind === "text" ? el.html : el.kind === "shape" ? el.html : "";
  if (!editing) latestHtml.current = html;

  useEffect(() => {
    if (editing && editableRef.current) {
      const node = editableRef.current;
      /* Seed the content imperatively ONCE. While editing, React must never
         re-write this node (state re-renders from typing/autosave would
         otherwise wipe the user's caret and text). */
      node.innerHTML = latestHtml.current;
      node.focus();
      const range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  /* ------------------------------ drag ----------------------------- */
  const drag = useRef<{ x: number; y: number; ex: number; ey: number } | null>(null);

  const startDrag = (e: RPointerEvent) => {
    if (el.locked || editing) return;
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(el.id);
    onGestureStart();
    drag.current = { x: e.clientX, y: e.clientY, ex: el.x, ey: el.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const moveDrag = (e: RPointerEvent) => {
    if (!drag.current) return;
    const dx = (e.clientX - drag.current.x) / zoom;
    const dy = (e.clientY - drag.current.y) / zoom;
    const shift = e.shiftKey;
    onChange(el.id, {
      x: Math.round(drag.current.ex + (shift && Math.abs(dy) > Math.abs(dx) ? 0 : dx)),
      y: Math.round(drag.current.ey + (shift && Math.abs(dx) > Math.abs(dy) ? 0 : dy)),
    });
  };

  const endDrag = (e: RPointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
    onGestureEnd();
  };

  /* ----------------------------- resize ---------------------------- */
  const resize = useRef<{
    h: HandleId;
    x: number;
    y: number;
    box: { x: number; y: number; w: number; h: number };
  } | null>(null);

  const startResize = (e: RPointerEvent, h: HandleId) => {
    e.stopPropagation();
    e.preventDefault();
    onGestureStart();
    resize.current = {
      h,
      x: e.clientX,
      y: e.clientY,
      box: { x: el.x, y: el.y, w: el.w, h: el.h },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const moveResize = (e: RPointerEvent) => {
    const r = resize.current;
    if (!r) return;
    const [sx, sy] = SIGNS[r.h];
    const local = rot((e.clientX - r.x) / zoom, (e.clientY - r.y) / zoom, -el.rotation);
    let dw = sx * local.x;
    let dh = sy * local.y;
    if (e.shiftKey && sx !== 0 && sy !== 0) {
      const ratio = r.box.h / r.box.w;
      dh = dw * ratio;
    }
    const newW = Math.max(18, r.box.w + dw);
    const newH = Math.max(14, r.box.h + dh);
    dw = newW - r.box.w;
    dh = newH - r.box.h;
    const shift = rot((sx * dw) / 2, (sy * dh) / 2, el.rotation);
    const cx = r.box.x + r.box.w / 2 + shift.x;
    const cy = r.box.y + r.box.h / 2 + shift.y;
    onChange(el.id, {
      w: Math.round(newW),
      h: Math.round(newH),
      x: Math.round(cx - newW / 2),
      y: Math.round(cy - newH / 2),
    });
  };

  const endResize = (e: RPointerEvent) => {
    if (!resize.current) return;
    resize.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    onGestureEnd();
  };

  /* ----------------------------- rotate ---------------------------- */
  const rotate = useRef<{ cx: number; cy: number } | null>(null);

  const startRotate = (e: RPointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const host = (e.currentTarget as HTMLElement).closest("[data-el]") as HTMLElement | null;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    rotate.current = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
    onGestureStart();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const moveRotate = (e: RPointerEvent) => {
    const r = rotate.current;
    if (!r) return;
    const deg =
      (Math.atan2(e.clientY - r.cy, e.clientX - r.cx) * 180) / Math.PI + 90;
    const snapped = e.shiftKey ? Math.round(deg / 15) * 15 : Math.round(deg);
    onChange(el.id, { rotation: snapped });
  };

  const endRotate = (e: RPointerEvent) => {
    if (!rotate.current) return;
    rotate.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    onGestureEnd();
  };

  /* ---------------------------- rendering -------------------------- */

  const wrapper: CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    width: el.w,
    height: el.h,
    transform: `rotate(${el.rotation}deg)`,
    transformOrigin: "center center",
    zIndex: el.z,
    opacity: el.opacity,
    cursor: el.locked ? "default" : editing ? "text" : "move",
    pointerEvents: interactive || editing ? "auto" : "none",
  };

  const textEl = el.kind === "text" ? (el as TextElement) : null;
  const shapeEl = el.kind === "shape" ? (el as ShapeElement) : null;

  const editableStyle: CSSProperties = textEl
    ? {
        fontFamily: fontCss(textEl.font),
        fontSize: textEl.fontSize,
        lineHeight: textEl.lineHeight,
        color: textEl.color,
        textAlign: textEl.align,
        background: textEl.background ?? "transparent",
        padding: textEl.padding ?? 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        wordBreak: "break-word",
        borderRadius: textEl.background ? 8 : 0,
      }
    : {
        fontFamily: fontCss(shapeEl?.font),
        fontSize: shapeEl?.fontSize,
        color: shapeEl?.textColor,
        textAlign: "center",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 18px",
        lineHeight: 1.3,
      };

  const onEditableInput = () => {
    const node = editableRef.current;
    if (!node) return;
    const next = node.innerHTML;
    const patch: Partial<NoteElement> = { html: next } as Partial<NoteElement>;
    if (textEl) {
      const needed = node.scrollHeight;
      if (needed > el.h + 2) (patch as Partial<TextElement>).h = Math.ceil(needed);
    }
    onChange(el.id, patch);
  };

  const onEditableBlur = () => {
    onEditableInput();
    const node = editableRef.current;
    if (!node || !textEl) return;
    const plain = node.textContent?.replace(/\s|\u00a0/g, "") ?? "";
    if (plain.length === 0 && node.querySelector("img") === null) onEmptyBlur(el.id);
  };

  const isEmpty =
    isTexty && html.replace(/<[^>]*>|&nbsp;|\s/g, "").length === 0;

  return (
    <div
      data-el={el.id}
      style={wrapper}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={(e) => {
        if (isTexty && !el.locked) {
          e.stopPropagation();
          onStartEdit(el.id);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onSelect(el.id);
        onContextMenu(el.id, e.clientX, e.clientY);
      }}
      className={selected && !editing ? "nt-selected" : undefined}
    >
      {shapeEl && <ShapeSvg el={shapeEl} />}

      {el.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={el.src}
          alt=""
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: el.radius ?? 6,
            display: "block",
            pointerEvents: "none",
          }}
        />
      )}

      {el.kind === "sticker" && (
        <div style={{ width: "100%", height: "100%", pointerEvents: "none" }}>
          <StickerSvg
            sticker={el.sticker}
            color={el.color}
            accent={el.accent}
            flipX={el.flipX}
          />
        </div>
      )}

      {el.kind === "draw" && (
        <svg
          viewBox={`0 0 ${el.vw} ${el.vh}`}
          preserveAspectRatio="none"
          width="100%"
          height="100%"
          style={{ display: "block", pointerEvents: "none", overflow: "visible" }}
        >
          {el.strokes.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      )}

      {isTexty &&
        (editing ? (
          /* Editing: React owns NO children / NO innerHTML here, so re-renders
             from typing or autosave never touch what the user wrote. */
          <div
            key="edit"
            ref={editableRef}
            className="nt-text"
            style={{ ...editableStyle, position: "relative" }}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}
            data-placeholder={el.kind === "shape" ? "Type inside…" : "Start typing…"}
            onInput={onEditableInput}
            onBlur={onEditableBlur}
            onPointerDown={(e) => e.stopPropagation()}
          />
        ) : (
          /* Read-only view: safe for React to own the markup. */
          <div
            key="view"
            className="nt-text"
            style={{ ...editableStyle, position: "relative" }}
            data-placeholder={el.kind === "shape" ? "Type inside…" : "Start typing…"}
            data-empty={isEmpty ? "true" : "false"}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}

      {selected && !editing && !el.locked && (
        <>
          {HANDLES.map((h) => (
            <div
              key={h.id}
              className="nt-handle nt-no-print"
              style={{ ...h.style, cursor: h.cursor }}
              onPointerDown={(e) => startResize(e, h.id)}
              onPointerMove={moveResize}
              onPointerUp={endResize}
              onPointerCancel={endResize}
            />
          ))}
          <div
            className="nt-no-print"
            style={{
              position: "absolute",
              left: "50%",
              top: -30,
              marginLeft: -8,
              width: 16,
              height: 16,
              borderRadius: 99,
              background: "#fff",
              border: "1.5px solid var(--noatic-purple)",
              cursor: "grab",
              boxShadow: "0 1px 3px rgba(60,40,100,.25)",
            }}
            onPointerDown={startRotate}
            onPointerMove={moveRotate}
            onPointerUp={endRotate}
            onPointerCancel={endRotate}
          />
        </>
      )}
    </div>
  );
}

/** Memoised so dragging one object doesn't re-render the whole page. */
const ElementView = memo(ElementViewBase);
export default ElementView;
