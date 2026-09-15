/* ------------------------------------------------------------------ *
 * Noatic editor document model
 * Coordinates are stored in CSS pixels on the *true size* paper
 * (96dpi), never in screen pixels. Zoom is a pure view transform.
 * ------------------------------------------------------------------ */

export type PaperSizeId = "a4" | "a5" | "letter" | "legal" | "tabloid";

export type PaperPattern = "lined" | "grid" | "dot" | "blank";

export type FontKey = "title" | "sub" | "body" | "equation" | "note";

export type ShapeKind =
  | "rect"
  | "circle"
  | "cloud"
  | "banner"
  | "bubble"
  | "tape";

export interface ElementBase {
  id: string;
  /** left/top in paper px */
  x: number;
  y: number;
  w: number;
  h: number;
  /** degrees */
  rotation: number;
  z: number;
  opacity: number;
  locked?: boolean;
}

export interface TextElement extends ElementBase {
  kind: "text";
  html: string;
  font: FontKey;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  /** optional soft background (used by "highlight block" sections) */
  background?: string;
  padding?: number;
}

export interface ImageElement extends ElementBase {
  kind: "image";
  src: string;
  radius?: number;
}

export interface StickerElement extends ElementBase {
  kind: "sticker";
  sticker: string;
  color: string;
  accent?: string;
  flipX?: boolean;
}

export interface ShapeElement extends ElementBase {
  kind: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  dashed?: boolean;
  wavyBorder?: boolean;
  html: string;
  font: FontKey;
  fontSize: number;
  textColor: string;
}

export interface DrawStroke {
  d: string;
  color: string;
  width: number;
}

export interface DrawElement extends ElementBase {
  kind: "draw";
  strokes: DrawStroke[];
  /** intrinsic drawing box used for the svg viewBox */
  vw: number;
  vh: number;
}

export type NoteElement =
  | TextElement
  | ImageElement
  | StickerElement
  | ShapeElement
  | DrawElement;

export interface PaperSettings {
  size: PaperSizeId;
  pattern: PaperPattern;
  /** color of the lines / dots / grid */
  accent: string;
  /** paper sheet color */
  color: string;
  lineGap: number;
  margin: number;
}

export interface DeskSettings {
  /** base desk colour, shown under the image */
  color: string;
  imageUrl: string | null;
  imageOpacity: number;
  /** subtle vignette + noise toggle */
  texture: boolean;
}

export interface NoteDoc {
  version: 1;
  paper: PaperSettings;
  desk: DeskSettings;
  elements: NoteElement[];
}

export interface NoteSummary {
  id: string;
  title: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  paper: PaperSettings;
  elementCount: number;
  snippet: string;
  stickers: string[];
}

export interface NoteRecord extends NoteSummary {
  doc: NoteDoc;
}
