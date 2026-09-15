"use client";

import { fontCss, paperBackground, paperDims } from "@/lib/editor/paper";
import { StickerSvg } from "@/lib/editor/stickers";
import { ShapeSvg } from "@/components/editor/ElementView";
import type { NoteDoc } from "@/lib/editor/types";

export default function MiniPage({ doc, width }: { doc: NoteDoc; width: number }) {
  const dims = paperDims(doc.paper);
  const s = width / dims.w;
  const elements = [...doc.elements].sort((a, b) => a.z - b.z);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width, height: dims.h * s, ...paperBackground(doc.paper) }}
    >
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

      <div
        style={{
          position: "absolute",
          width: dims.w,
          height: dims.h,
          transform: `scale(${s})`,
          transformOrigin: "top left",
        }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.opacity,
            }}
          >
            {el.kind === "sticker" && (
              <StickerSvg
                sticker={el.sticker}
                color={el.color}
                accent={el.accent}
                flipX={el.flipX}
              />
            )}
            {el.kind === "shape" && (
              <>
                <ShapeSvg el={el} />
                <div
                  className="nt-text"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "10px 18px",
                    fontFamily: fontCss(el.font),
                    fontSize: el.fontSize,
                    color: el.textColor,
                  }}
                  dangerouslySetInnerHTML={{ __html: el.html }}
                />
              </>
            )}
            {el.kind === "text" && (
              <div
                className="nt-text"
                style={{
                  fontFamily: fontCss(el.font),
                  fontSize: el.fontSize,
                  lineHeight: el.lineHeight,
                  color: el.color,
                  textAlign: el.align,
                  background: el.background,
                  width: "100%",
                  height: "100%",
                }}
                dangerouslySetInnerHTML={{ __html: el.html }}
              />
            )}
            {el.kind === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={el.src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            {el.kind === "draw" && (
              <svg
                viewBox={`0 0 ${el.vw} ${el.vh}`}
                preserveAspectRatio="none"
                width="100%"
                height="100%"
              >
                {el.strokes.map((st, i) => (
                  <path
                    key={i}
                    d={st.d}
                    fill="none"
                    stroke={st.color}
                    strokeWidth={st.width}
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
