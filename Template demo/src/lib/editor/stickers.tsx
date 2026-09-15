import type { ReactNode } from "react";
import { PALETTE } from "./paper";

export type StickerCategory = "doodle" | "nature" | "study" | "arrow" | "physics";

export interface StickerDef {
  id: string;
  label: string;
  category: StickerCategory;
  vb: [number, number];
  size: [number, number];
  color: string;
  accent?: string;
  render: (color: string, accent: string) => ReactNode;
}

const leaf = (cx: number, cy: number, dir: number, color: string) => (
  <path
    key={`${cx}-${cy}-${dir}`}
    d={`M${cx} ${cy} C${cx - dir * 5} ${cy - 14} ${cx - dir * 20} ${cy - 18} ${
      cx - dir * 26
    } ${cy - 7} C${cx - dir * 21} ${cy + 7} ${cx - dir * 7} ${cy + 5} ${cx} ${cy} Z`}
    fill={color}
  />
);

const def = (d: StickerDef): StickerDef => d;

export const STICKERS: Record<string, StickerDef> = {
  star: def({
    id: "star",
    label: "Star",
    category: "doodle",
    vb: [100, 100],
    size: [56, 56],
    color: PALETTE.lavender,
    render: (c) => (
      <path
        d="M50 6 61 38 95 38 67 58 78 92 50 71 22 92 33 58 5 38 39 38Z"
        fill={c}
      />
    ),
  }),
  "star-outline": def({
    id: "star-outline",
    label: "Star outline",
    category: "doodle",
    vb: [100, 100],
    size: [56, 56],
    color: PALETTE.purple,
    render: (c) => (
      <path
        d="M50 6 61 38 95 38 67 58 78 92 50 71 22 92 33 58 5 38 39 38Z"
        fill="none"
        stroke={c}
        strokeWidth={4}
        strokeLinejoin="round"
      />
    ),
  }),
  moon: def({
    id: "moon",
    label: "Moon",
    category: "doodle",
    vb: [100, 100],
    size: [56, 56],
    color: PALETTE.lavender,
    render: (c) => (
      <path d="M58 4A46 46 0 1 0 96 62 36 36 0 1 1 58 4Z" fill={c} />
    ),
  }),
  heart: def({
    id: "heart",
    label: "Heart",
    category: "doodle",
    vb: [100, 100],
    size: [52, 52],
    color: PALETTE.pink,
    render: (c) => (
      <path
        d="M50 88C18 66 6 48 6 32 6 18 17 8 30 8c8 0 15 4 20 11 5-7 12-11 20-11 13 0 24 10 24 24 0 16-12 34-44 56Z"
        fill={c}
      />
    ),
  }),
  sparkle: def({
    id: "sparkle",
    label: "Sparkle",
    category: "doodle",
    vb: [100, 100],
    size: [44, 44],
    color: PALETTE.butter,
    accent: PALETTE.lavender,
    render: (c, a) => (
      <>
        <path
          d="M50 4c4 24 18 38 42 42-24 4-38 18-42 42-4-24-18-38-42-42 24-4 38-18 42-42Z"
          fill={c}
        />
        <path
          d="M84 62c1.6 9 6.6 14 15 16-8.4 1.6-13.4 6.6-15 15-1.6-8.4-6.6-13.4-15-15 8.4-2 13.4-7 15-16Z"
          fill={a}
        />
      </>
    ),
  }),
  bow: def({
    id: "bow",
    label: "Bow",
    category: "doodle",
    vb: [100, 100],
    size: [66, 60],
    color: PALETTE.pink,
    accent: "#d98cb3",
    render: (c, a) => (
      <>
        <path d="M46 50C28 28 6 26 6 44s24 18 40 6Z" fill={c} stroke={a} strokeWidth={2} />
        <path d="M54 50c18-22 40-24 40-6s-24 18-40 6Z" fill={c} stroke={a} strokeWidth={2} />
        <path d="M44 56c-6 14-10 24-14 36" stroke={a} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M56 56c6 14 10 24 14 36" stroke={a} strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx="50" cy="50" r="8" fill={a} />
      </>
    ),
  }),
  sprig: def({
    id: "sprig",
    label: "Leaf sprig",
    category: "nature",
    vb: [70, 130],
    size: [46, 86],
    color: "#b9a3e3",
    accent: "#8a6fd1",
    render: (c, a) => (
      <>
        <path
          d="M35 128C35 96 35 52 35 8"
          stroke={a}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {leaf(35, 34, 1, c)}
        {leaf(35, 34, -1, c)}
        {leaf(35, 62, 1, c)}
        {leaf(35, 62, -1, c)}
        {leaf(35, 90, 1, c)}
        {leaf(35, 90, -1, c)}
        <path d="M35 14c-6-6-4-12 0-14 4 2 6 8 0 14Z" fill={a} />
        <path d="M23 112l12-8M47 112l-12-8" stroke={a} strokeWidth={2.4} strokeLinecap="round" />
      </>
    ),
  }),
  leaf: def({
    id: "leaf",
    label: "Leaf",
    category: "nature",
    vb: [100, 100],
    size: [48, 48],
    color: "#c6e7d9",
    accent: "#6cae9a",
    render: (c, a) => (
      <>
        <path d="M50 6C20 26 16 66 50 94 84 66 80 26 50 6Z" fill={c} />
        <path d="M50 92V12M50 40 28 28M50 40l22-12M50 62 30 50M50 62l20-12" stroke={a} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </>
    ),
  }),
  flower: def({
    id: "flower",
    label: "Flower",
    category: "nature",
    vb: [100, 100],
    size: [50, 50],
    color: "#f6c9dd",
    accent: "#faeec2",
    render: (c, a) => (
      <>
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="50"
            cy="24"
            rx="15"
            ry="22"
            fill={c}
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="13" fill={a} />
      </>
    ),
  }),
  cloud: def({
    id: "cloud",
    label: "Cloud",
    category: "nature",
    vb: [120, 80],
    size: [84, 56],
    color: "#ffffff",
    accent: "#c5ddf5",
    render: (c, a) => (
      <path
        d="M30 70C15 70 5 60 5 48s10-21 23-21C31 14 43 5 57 5c15 0 27 10 30 24 12 1 20 9 20 20 0 12-10 21-24 21Z"
        fill={c}
        stroke={a}
        strokeWidth={3}
        strokeLinejoin="round"
      />
    ),
  }),
  butterfly: def({
    id: "butterfly",
    label: "Butterfly",
    category: "nature",
    vb: [110, 90],
    size: [58, 48],
    color: "#e0d3fb",
    accent: "#8a6fd1",
    render: (c, a) => (
      <>
        <path d="M53 45C40 20 18 8 10 18c-8 10 8 26 43 27Z" fill={c} stroke={a} strokeWidth={2} />
        <path d="M57 45c13-25 35-37 43-27 8 10-8 26-43 27Z" fill={c} stroke={a} strokeWidth={2} />
        <path d="M53 46C42 66 26 80 18 72c-7-8 5-21 35-26Z" fill={c} stroke={a} strokeWidth={2} />
        <path d="M57 46c11 20 27 34 35 26 7-8-5-21-35-26Z" fill={c} stroke={a} strokeWidth={2} />
        <path d="M55 26v42M55 26l-7-12M55 26l7-12" stroke={a} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      </>
    ),
  }),
  book: def({
    id: "book",
    label: "Book",
    category: "study",
    vb: [120, 90],
    size: [72, 54],
    color: "#ffffff",
    accent: "#b9a3e3",
    render: (c, a) => (
      <>
        <path d="M60 22C46 10 24 10 8 16v58c16-6 38-6 52 6Z" fill={c} stroke={a} strokeWidth={3} strokeLinejoin="round" />
        <path d="M60 22c14-12 36-12 52-6v58c-16-6-38-6-52 6Z" fill={c} stroke={a} strokeWidth={3} strokeLinejoin="round" />
        <path d="M18 30c10-2 22-2 30 2M18 44c10-2 22-2 30 2M72 32c10-4 22-4 30-2M72 46c10-4 22-4 30-2" stroke={a} strokeWidth={2} fill="none" strokeLinecap="round" />
      </>
    ),
  }),
  coffee: def({
    id: "coffee",
    label: "Coffee",
    category: "study",
    vb: [100, 100],
    size: [56, 56],
    color: "#ffffff",
    accent: "#b08968",
    render: (c, a) => (
      <>
        <path d="M20 12c6 6 0 10 6 16M40 10c6 6 0 10 6 16M60 12c6 6 0 10 6 16" stroke={a} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M14 36h58v26a22 22 0 0 1-22 22H36a22 22 0 0 1-22-22Z" fill={c} stroke={a} strokeWidth={3} strokeLinejoin="round" />
        <path d="M72 44h8a12 12 0 0 1 0 24h-8" fill="none" stroke={a} strokeWidth={3} />
        <path d="M14 46h58" stroke={a} strokeWidth={2.4} />
      </>
    ),
  }),
  washi: def({
    id: "washi",
    label: "Washi tape",
    category: "study",
    vb: [160, 46],
    size: [130, 38],
    color: "#e0d3fb",
    accent: "#b9a3e3",
    render: (c, a) => (
      <>
        <path d="M4 6 14 12 4 18 14 24 4 30 14 36 4 42h152l-10-6 10-6-10-6 10-6-10-6 10-6Z" fill={c} opacity={0.85} />
        <path d="M20 14h120M20 26h90" stroke={a} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
      </>
    ),
  }),
  "arrow-curve": def({
    id: "arrow-curve",
    label: "Curved arrow",
    category: "arrow",
    vb: [120, 90],
    size: [84, 62],
    color: PALETTE.purple,
    render: (c) => (
      <>
        <path d="M8 78C14 30 52 8 104 22" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" />
        <path d="M104 22 86 16M104 22 92 36" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" />
      </>
    ),
  }),
  "arrow-straight": def({
    id: "arrow-straight",
    label: "Arrow",
    category: "arrow",
    vb: [120, 40],
    size: [92, 30],
    color: PALETTE.purple,
    render: (c) => (
      <>
        <path d="M6 21c30-4 62-3 106-1" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" />
        <path d="M112 20 96 12M112 20 96 30" fill="none" stroke={c} strokeWidth={3.4} strokeLinecap="round" />
      </>
    ),
  }),
  "arrow-down": def({
    id: "arrow-down",
    label: "Force arrow",
    category: "arrow",
    vb: [40, 110],
    size: [30, 82],
    color: "#c9b6ee",
    render: (c) => (
      <>
        <rect x="12" y="6" width="16" height="66" rx="3" fill={c} />
        <path d="M2 68h36L20 104Z" fill={c} />
      </>
    ),
  }),
  apple: def({
    id: "apple",
    label: "Apple",
    category: "physics",
    vb: [100, 110],
    size: [60, 66],
    color: "#d9e8bf",
    accent: "#e2746b",
    render: (c, a) => (
      <>
        <path
          d="M50 28c-8-8-22-10-32-2C6 36 6 58 14 76c6 14 16 24 24 22 5-1 8-3 12-3s7 2 12 3c8 2 18-8 24-22 8-18 8-40-4-50-10-8-24-6-32 2Z"
          fill={c}
        />
        <path d="M50 30c10 0 18 10 20 22" stroke={a} strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.7} />
        <path d="M50 28c0-10 2-18 4-22" stroke="#7a5c3c" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M54 12c10-8 20-8 22-2 2 6-8 14-22 6Z" fill="#9dc08b" />
      </>
    ),
  }),
  "walk-earth": def({
    id: "walk-earth",
    label: "Walking on earth",
    category: "physics",
    vb: [140, 160],
    size: [110, 126],
    color: "#c5ddf5",
    accent: "#9dc08b",
    render: (c, a) => (
      <>
        <circle cx="70" cy="118" r="42" fill={c} stroke="#8fb6dd" strokeWidth={2} />
        <path d="M36 96c14 6 26 2 34 8s2 14 10 18 18-2 26-10M40 140c10-8 22-6 30-14" fill="none" stroke={a} strokeWidth={7} strokeLinecap="round" />
        <circle cx="70" cy="26" r="11" fill="#2f2a3a" />
        <path d="M70 37c-9 2-14 9-14 18l3 18h22l3-18c0-9-5-16-14-18Z" fill="#8a6fd1" />
        <path d="M61 73 52 96M79 73l10 22M56 96l-6 10M89 95l7 9" stroke="#2f2a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M56 48 44 62M84 48l12 14" stroke="#2f2a3a" strokeWidth={4} fill="none" strokeLinecap="round" />
      </>
    ),
  }),
  sun: def({
    id: "sun",
    label: "Sun",
    category: "nature",
    vb: [100, 100],
    size: [54, 54],
    color: "#faeec2",
    accent: "#e8c86a",
    render: (c, a) => (
      <>
        <circle cx="50" cy="50" r="24" fill={c} stroke={a} strokeWidth={2.6} />
        {Array.from({ length: 8 }).map((_, i) => (
          <path
            key={i}
            d="M50 16V4"
            stroke={a}
            strokeWidth={3.4}
            strokeLinecap="round"
            transform={`rotate(${i * 45} 50 50)`}
          />
        ))}
      </>
    ),
  }),
  "car-crash": def({
    id: "car-crash",
    label: "Car crash",
    category: "physics",
    vb: [200, 130],
    size: [148, 96],
    color: "#d7d4de",
    accent: "#8e8a99",
    render: (c, a) => (
      <>
        <path d="M14 96V40c0-6 5-10 11-10h58c8 0 12 4 14 10l10 26v30Z" fill={c} stroke={a} strokeWidth={3} strokeLinejoin="round" />
        <path d="M24 44h44v22H24Z" fill="#eef4fb" stroke={a} strokeWidth={2.4} />
        <path d="M76 44h10l8 20H76Z" fill="#eef4fb" stroke={a} strokeWidth={2.4} />
        <path d="M107 96 118 66l12 22 12-24 10 24 12-20 10 28Z" fill="#bdb8c7" stroke={a} strokeWidth={3} strokeLinejoin="round" />
        <path d="M118 66 128 42M142 64l8-22M162 70l12-16" stroke={a} strokeWidth={2.4} strokeLinecap="round" />
        <circle cx="46" cy="100" r="14" fill="#4d4a56" />
        <circle cx="46" cy="100" r="5" fill={c} />
        <path d="M14 96h150" stroke={a} strokeWidth={3} strokeLinecap="round" />
        <path d="M188 16l-24 30 14 2-12 22" fill="none" stroke="#f3a3a3" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  }),
  "graph-dt": def({
    id: "graph-dt",
    label: "Distance–time graph",
    category: "physics",
    vb: [230, 160],
    size: [196, 136],
    color: "#2f2a3a",
    accent: "#e2746b",
    render: (c, a) => (
      <>
        <path d="M36 12v116h182" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${36 + i * 36} 128v5`} stroke={c} strokeWidth={1.4} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <text
            key={i}
            x={36 + i * 36}
            y={143}
            fontSize={9}
            textAnchor="middle"
            fill={c}
            fontFamily="var(--font-body)"
          >
            {i}
          </text>
        ))}
        <text x={12} y={72} fontSize={10} fill={c} fontFamily="var(--font-body)">
          (m)
        </text>
        <text x={196} y={154} fontSize={10} fill={c} fontFamily="var(--font-body)">
          (s)
        </text>
        <path
          d="M36 128C70 128 92 62 128 36c20-14 54-14 90-12"
          fill="none"
          stroke={a}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <path d="M36 128 108 86v0h110" fill="none" stroke="#7fc6c9" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        <text x={150} y={24} fontSize={9} fill={c} fontFamily="var(--font-body)">
          stationary
        </text>
        <text x={92} y={56} fontSize={9} fill={c} fontFamily="var(--font-body)">
          deceleration
        </text>
        <text x={152} y={80} fontSize={9} fill={c} fontFamily="var(--font-body)">
          steady
        </text>
        <text x={152} y={90} fontSize={9} fill={c} fontFamily="var(--font-body)">
          speed
        </text>
        <text x={44} y={118} fontSize={9} fill={c} fontFamily="var(--font-body)">
          acceleration
        </text>
      </>
    ),
  }),
  "graph-vt": def({
    id: "graph-vt",
    label: "Velocity–time graph",
    category: "physics",
    vb: [230, 160],
    size: [196, 136],
    color: "#2f2a3a",
    accent: "#e2746b",
    render: (c, a) => (
      <>
        <path d="M36 12v116h182" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${36 + i * 36} 128v5`} stroke={c} strokeWidth={1.4} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <text
            key={i}
            x={36 + i * 36}
            y={143}
            fontSize={9}
            textAnchor="middle"
            fill={c}
            fontFamily="var(--font-body)"
          >
            {i}
          </text>
        ))}
        <text x={8} y={72} fontSize={10} fill={c} fontFamily="var(--font-body)">
          (m/s)
        </text>
        <text x={196} y={154} fontSize={10} fill={c} fontFamily="var(--font-body)">
          (s)
        </text>
        <path d="M36 122 96 40h56l58 84" fill="none" stroke={a} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 122 84 74M152 62l44 60" fill="none" stroke="#7fc6c9" strokeWidth={2.4} strokeLinecap="round" />
        <text x={104} y={32} fontSize={9} fill={c} fontFamily="var(--font-body)">
          constant
        </text>
        <text x={104} y={42} fontSize={9} fill={c} fontFamily="var(--font-body)">
          velocity
        </text>
        <text x={40} y={86} fontSize={9} fill={c} fontFamily="var(--font-body)">
          constant
        </text>
        <text x={40} y={96} fontSize={9} fill={c} fontFamily="var(--font-body)">
          acceleration
        </text>
        <text x={146} y={104} fontSize={9} fill={c} fontFamily="var(--font-body)">
          constant
        </text>
        <text x={146} y={114} fontSize={9} fill={c} fontFamily="var(--font-body)">
          deceleration
        </text>
      </>
    ),
  }),
};

export const STICKER_LIST = Object.values(STICKERS);

export const STICKER_CATEGORY_LABELS: Record<StickerCategory, string> = {
  doodle: "Doodles",
  nature: "Nature",
  study: "Study",
  arrow: "Arrows",
  physics: "Science",
};

export function StickerSvg({
  sticker,
  color,
  accent,
  flipX,
}: {
  sticker: string;
  color?: string;
  accent?: string;
  flipX?: boolean;
}) {
  const s = STICKERS[sticker] ?? STICKERS.star;
  return (
    <svg
      viewBox={`0 0 ${s.vb[0]} ${s.vb[1]}`}
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{
        display: "block",
        transform: flipX ? "scaleX(-1)" : undefined,
        overflow: "visible",
      }}
    >
      {s.render(color ?? s.color, accent ?? s.accent ?? s.color)}
    </svg>
  );
}
