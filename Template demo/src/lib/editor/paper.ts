import type { CSSProperties } from "react";
import type {
  DeskSettings,
  FontKey,
  NoteDoc,
  PaperPattern,
  PaperSettings,
  PaperSizeId,
} from "./types";

/** True physical sizes rendered at 96dpi, exactly like Word. */
export const PAPER_SIZES: Record<
  PaperSizeId,
  { id: PaperSizeId; label: string; hint: string; w: number; h: number }
> = {
  a4: { id: "a4", label: "A4", hint: "210 × 297 mm", w: 794, h: 1123 },
  a5: { id: "a5", label: "A5", hint: "148 × 210 mm", w: 559, h: 794 },
  letter: { id: "letter", label: "Letter", hint: '8.5 × 11"', w: 816, h: 1056 },
  legal: { id: "legal", label: "Legal", hint: '8.5 × 14"', w: 816, h: 1344 },
  tabloid: { id: "tabloid", label: "Tabloid", hint: '11 × 17"', w: 1056, h: 1632 },
};

export const PAPER_SIZE_LIST = Object.values(PAPER_SIZES);

export const PAPER_PATTERNS: { id: PaperPattern; label: string }[] = [
  { id: "lined", label: "Lined" },
  { id: "grid", label: "Grid" },
  { id: "dot", label: "Dot grid" },
  { id: "blank", label: "Blank" },
];

export const FONTS: Record<
  FontKey,
  { key: FontKey; label: string; css: string; sample: string }
> = {
  title: {
    key: "title",
    label: "Playlist Script — titles",
    css: "var(--font-title)",
    sample: "Physics",
  },
  sub: {
    key: "sub",
    label: "Amatic SC — subheadings",
    css: "var(--font-sub)",
    sample: "MODULE FOUR",
  },
  body: {
    key: "body",
    label: "Patrick Hand — body",
    css: "var(--font-body)",
    sample: "Motion graphs help us…",
  },
  equation: {
    key: "equation",
    label: "Kalam — equations",
    css: "var(--font-equation)",
    sample: "p = m × v",
  },
  note: {
    key: "note",
    label: "Caveat — margin notes",
    css: "var(--font-note)",
    sample: "remember!",
  },
};

export const FONT_LIST = Object.values(FONTS);

export function fontCss(key: FontKey | undefined): string {
  return FONTS[key ?? "body"].css;
}

/** Soft study-aesthetic palette pulled from the reference page. */
export const PALETTE = {
  ink: "#2f2a3a",
  lavender: "#b9a3e3",
  lavenderSoft: "#e7defa",
  lilacLine: "#d9cdf3",
  purple: "#8a6fd1",
  pink: "#f6c9dd",
  peach: "#fbd9c3",
  mint: "#c6e7d9",
  babyBlue: "#c5ddf5",
  butter: "#faeec2",
  paper: "#fdfcf9",
  red: "#e2746b",
  teal: "#7fc6c9",
};

export const SWATCHES = [
  PALETTE.ink,
  "#6b6478",
  PALETTE.purple,
  PALETTE.lavender,
  "#d98cb3",
  PALETTE.pink,
  "#e2746b",
  PALETTE.peach,
  "#6cae9a",
  PALETTE.mint,
  "#5b93c9",
  PALETTE.babyBlue,
  "#c9a227",
  PALETTE.butter,
  "#ffffff",
];

export const HIGHLIGHTS = [
  "#e0d3fb",
  "#fbd7e8",
  "#d5f0e4",
  "#ffe9c9",
  "#d3e8ff",
  "#f6f3c6",
];

export const DEFAULT_PAPER: PaperSettings = {
  size: "a4",
  pattern: "grid",
  accent: "#e3ddf2",
  color: PALETTE.paper,
  lineGap: 26,
  margin: 48,
};

export const DEFAULT_DESK: DeskSettings = {
  color: "#efe9f7",
  imageUrl: null,
  imageOpacity: 0.45,
  texture: true,
};

export function paperDims(paper: PaperSettings) {
  return PAPER_SIZES[paper.size] ?? PAPER_SIZES.a4;
}

/** CSS background layers that draw the ruling of the sheet. */
export function paperBackground(paper: PaperSettings): CSSProperties {
  const gap = Math.max(8, paper.lineGap);
  const accent = paper.accent;
  switch (paper.pattern) {
    case "lined":
      return {
        backgroundColor: paper.color,
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${
          gap - 1
        }px, ${accent} ${gap - 1}px, ${accent} ${gap}px)`,
        backgroundPosition: `0 ${paper.margin}px`,
      };
    case "grid":
      return {
        backgroundColor: paper.color,
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0px, transparent ${
          gap - 1
        }px, ${accent} ${gap - 1}px, ${accent} ${gap}px), repeating-linear-gradient(to right, transparent 0px, transparent ${
          gap - 1
        }px, ${accent} ${gap - 1}px, ${accent} ${gap}px)`,
      };
    case "dot":
      return {
        backgroundColor: paper.color,
        backgroundImage: `radial-gradient(${accent} 1.4px, transparent 1.5px)`,
        backgroundSize: `${gap}px ${gap}px`,
      };
    default:
      return { backgroundColor: paper.color };
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const int = Number.parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(int)) return [239, 233, 247];
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

/** Desk surface: colour + optional image dimmed by an opacity veil. */
export function deskBackground(desk: DeskSettings): CSSProperties {
  const [r, g, b] = hexToRgb(desk.color);
  const veil = 1 - Math.min(1, Math.max(0, desk.imageOpacity));
  const layers: string[] = [];
  if (desk.texture) {
    layers.push(
      "radial-gradient(circle at 18% 12%, rgba(255,255,255,.45), transparent 55%)",
      "radial-gradient(circle at 86% 88%, rgba(0,0,0,.13), transparent 60%)",
    );
  }
  if (desk.imageUrl) {
    layers.push(`linear-gradient(rgba(${r},${g},${b},${veil}), rgba(${r},${g},${b},${veil}))`);
    layers.push(`url("${desk.imageUrl}")`);
  }
  return {
    backgroundColor: desk.color,
    backgroundImage: layers.length ? layers.join(", ") : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  };
}

export function emptyDoc(overrides?: Partial<NoteDoc>): NoteDoc {
  return {
    version: 1,
    paper: { ...DEFAULT_PAPER, ...(overrides?.paper ?? {}) },
    desk: { ...DEFAULT_DESK, ...(overrides?.desk ?? {}) },
    elements: overrides?.elements ?? [],
  };
}

export function uid(prefix = "el"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-3)}`;
}
