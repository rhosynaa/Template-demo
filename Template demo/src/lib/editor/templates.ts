import { DEFAULT_DESK, PALETTE, uid } from "./paper";
import type {
  DrawElement,
  NoteDoc,
  NoteElement,
  ShapeElement,
  StickerElement,
  TextElement,
} from "./types";

/* ------------------------------------------------------------------ *
 * Element factories
 * ------------------------------------------------------------------ */

let zc = 1;
const nextZ = () => zc++;

export function text(p: Partial<TextElement> & Pick<TextElement, "x" | "y" | "w">): TextElement {
  return {
    id: uid("tx"),
    kind: "text",
    x: p.x,
    y: p.y,
    w: p.w,
    h: p.h ?? 60,
    rotation: p.rotation ?? 0,
    z: p.z ?? nextZ(),
    opacity: p.opacity ?? 1,
    html: p.html ?? "Type here…",
    font: p.font ?? "body",
    fontSize: p.fontSize ?? 17,
    color: p.color ?? PALETTE.ink,
    align: p.align ?? "left",
    lineHeight: p.lineHeight ?? 1.35,
    background: p.background,
    padding: p.padding ?? 0,
  };
}

export function sticker(
  p: Partial<StickerElement> & Pick<StickerElement, "x" | "y" | "sticker">,
): StickerElement {
  return {
    id: uid("st"),
    kind: "sticker",
    x: p.x,
    y: p.y,
    w: p.w ?? 60,
    h: p.h ?? 60,
    rotation: p.rotation ?? 0,
    z: p.z ?? nextZ(),
    opacity: p.opacity ?? 1,
    sticker: p.sticker,
    color: p.color ?? PALETTE.lavender,
    accent: p.accent,
    flipX: p.flipX,
  };
}

export function shape(
  p: Partial<ShapeElement> & Pick<ShapeElement, "x" | "y" | "w" | "h" | "shape">,
): ShapeElement {
  return {
    id: uid("sh"),
    kind: "shape",
    x: p.x,
    y: p.y,
    w: p.w,
    h: p.h,
    rotation: p.rotation ?? 0,
    z: p.z ?? nextZ(),
    opacity: p.opacity ?? 1,
    shape: p.shape,
    fill: p.fill ?? "rgba(255,255,255,0.65)",
    stroke: p.stroke ?? PALETTE.lavender,
    strokeWidth: p.strokeWidth ?? 2,
    dashed: p.dashed,
    wavyBorder: p.wavyBorder,
    html: p.html ?? "",
    font: p.font ?? "body",
    fontSize: p.fontSize ?? 16,
    textColor: p.textColor ?? PALETTE.ink,
  };
}

export function draw(p: Partial<DrawElement> & Pick<DrawElement, "x" | "y" | "w" | "h" | "strokes">): DrawElement {
  return {
    id: uid("dw"),
    kind: "draw",
    x: p.x,
    y: p.y,
    w: p.w,
    h: p.h,
    rotation: p.rotation ?? 0,
    z: p.z ?? nextZ(),
    opacity: p.opacity ?? 1,
    strokes: p.strokes,
    vw: p.vw ?? p.w,
    vh: p.vh ?? p.h,
  };
}

/* helpers for inline decorations used inside contentEditable html */
export const wavy = (s: string) => `<span class="nt-wavy">${s}</span>`;
export const mark = (s: string, c = "#e0d3fb") =>
  `<span class="nt-marker" style="--mk:${c}">${s}</span>`;
const p = (s: string) => `<p>${s}</p>`;
const spaced = (s: string) => `<span style="letter-spacing:.18em">${s}</span>`;

/* ------------------------------------------------------------------ *
 * Template registry
 * ------------------------------------------------------------------ */

export interface TemplateDef {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  preview?: string;
  swatch: [string, string];
  build: () => NoteDoc;
}

function blankDoc(): NoteDoc {
  zc = 1;
  return {
    version: 1,
    paper: {
      size: "a4",
      pattern: "grid",
      accent: "#eae4f7",
      color: PALETTE.paper,
      lineGap: 26,
      margin: 48,
    },
    desk: { ...DEFAULT_DESK },
    elements: [
      text({
        x: 90,
        y: 120,
        w: 614,
        h: 110,
        html: "Your title",
        font: "title",
        fontSize: 78,
        align: "center",
      }),
      text({
        x: 90,
        y: 240,
        w: 614,
        h: 44,
        html: spaced("SUBHEADING"),
        font: "sub",
        fontSize: 32,
        align: "center",
        color: PALETTE.purple,
      }),
      text({
        x: 90,
        y: 300,
        w: 614,
        h: 200,
        html: p("Click anywhere on the paper and start writing…"),
        font: "body",
        fontSize: 18,
      }),
    ],
  };
}

/* --------------------------- PHYSICS ------------------------------ */

function physicsDoc(): NoteDoc {
  zc = 1;
  const body = { font: "body" as const, fontSize: 14, lineHeight: 1.32 };
  const heading = (x: number, y: number, w: number, label: string) =>
    text({
      x,
      y,
      w,
      h: 28,
      html: wavy(spaced(label)),
      font: "sub",
      fontSize: 24,
      align: "center",
      color: PALETTE.purple,
    });

  const elements: NoteElement[] = [
    /* ---------- header ---------- */
    text({
      x: 470,
      y: 22,
      w: 292,
      h: 30,
      html: "@ aquaticflames",
      font: "note",
      fontSize: 21,
      align: "right",
      color: "#6f6880",
    }),
    sticker({ x: 70, y: 56, sticker: "sprig", w: 44, h: 70, rotation: -6 }),
    sticker({ x: 460, y: 60, sticker: "sprig", w: 44, h: 70, rotation: 6, flipX: true }),
    text({
      x: 86,
      y: 34,
      w: 410,
      h: 116,
      html: "Physics",
      font: "title",
      fontSize: 96,
      align: "center",
    }),
    text({
      x: 244,
      y: 166,
      w: 200,
      h: 36,
      html: spaced("MODULE FOUR"),
      font: "sub",
      fontSize: 30,
      align: "center",
    }),

    /* ---------- left column ---------- */
    heading(90, 194, 160, "GRAPHS"),
    text({
      ...body,
      x: 36,
      y: 226,
      w: 384,
      h: 80,
      html: p(
        "Motion graphs help us to determine the movement pattern of an object over a length of time or distance. Distance-Time graphs and Velocity-Time graphs are the two types likely to come up at GCSE standard, and so their characteristics must be known.",
      ),
    }),
    text({
      ...body,
      x: 36,
      y: 316,
      w: 176,
      h: 156,
      html: p(
        "Distance-Time graphs show just how far away an object is from its original starting point at any given moment in time. A horizontal line shows no movement, a straight line represents a steady speed, and a curve is acceleration or deceleration",
      ),
    }),
    sticker({ x: 222, y: 318, sticker: "graph-dt", w: 192, h: 132, color: PALETTE.ink }),
    text({
      ...body,
      x: 36,
      y: 486,
      w: 176,
      h: 174,
      html: p(
        "Velocity-Time graphs show how fast an object is going, and in which direction too. A horizontal line shows a constant velocity, a straight line going up is a constant acceleration (down is constant deceleration), and the area underneath the graph is the total distance.",
      ),
    }),
    sticker({ x: 222, y: 490, sticker: "graph-vt", w: 192, h: 132, color: PALETTE.ink }),

    heading(90, 670, 160, "FORCES"),
    text({
      ...body,
      x: 36,
      y: 702,
      w: 384,
      h: 42,
      html: p(
        "Forces occur when two objects act upon one another, and these ‘forces’ always appear in pairs.",
      ),
    }),
    sticker({ x: 40, y: 752, sticker: "apple", w: 52, h: 58 }),
    sticker({ x: 54, y: 814, sticker: "arrow-down", w: 22, h: 46, color: "#cdbcf0" }),
    text({
      x: 22,
      y: 818,
      w: 28,
      h: 36,
      html: "force<br/>from earth<br/>on apple",
      font: "note",
      fontSize: 8,
      align: "right",
      color: "#a49cb4",
      lineHeight: 1.05,
    }),
    sticker({
      x: 54,
      y: 868,
      sticker: "arrow-down",
      w: 22,
      h: 40,
      color: "#cdbcf0",
      rotation: 180,
    }),
    text({
      x: 22,
      y: 872,
      w: 28,
      h: 36,
      html: "force<br/>from apple<br/>on earth",
      font: "note",
      fontSize: 8,
      align: "right",
      color: "#a49cb4",
      lineHeight: 1.05,
    }),
    text({
      ...body,
      x: 112,
      y: 750,
      w: 272,
      h: 156,
      html: p(
        "The classic example of this is the falling apple due to gravity. In this instance, the apple falls from its branch to the ground because of the force acting upon it from the Earth itself. The apple also applies a force onto the earth – called a reaction force – but this is hardly noticable, and drag also prevents the apple from falling as fast as it could.",
      ),
    }),
    text({
      ...body,
      x: 36,
      y: 920,
      w: 196,
      h: 138,
      html: p(
        "Another example is the action of walking across the earth; when you walk, your feet push back against the earth, and because we are so small compared to the planet, it results in the earth pushing us forward instead.",
      ),
    }),
    sticker({ x: 240, y: 900, sticker: "walk-earth", w: 130, h: 148 }),
    sticker({ x: 336, y: 896, sticker: "sun", w: 38, h: 38 }),

    /* ---------- right column ---------- */
    heading(486, 148, 240, "MOTION & ENERGY"),
    text({
      ...body,
      x: 446,
      y: 186,
      w: 320,
      h: 62,
      align: "center",
      html: p(
        "Any type of energy is generally measured in joules (J), like GPE and Kinetic Energy. Some useful equations are:",
      ),
    }),
    text({
      x: 446,
      y: 252,
      w: 320,
      h: 104,
      font: "equation",
      fontSize: 12.5,
      lineHeight: 2,
      html:
        p(mark("Work Done (J) &nbsp;=&nbsp; Force (N) × Distance (m)")) +
        p(mark("Weight (N) &nbsp;=&nbsp; Mass (kg) × Gravity Strength (N/kg)")) +
        p(mark("GPE (J) &nbsp;=&nbsp; Weight (N) × Height Change (m)")) +
        p(mark("KE (J) &nbsp;=&nbsp; ½ × Mass (kg) × [Velocity]² (m/s)")),
    }),
    text({
      ...body,
      x: 446,
      y: 364,
      w: 320,
      h: 80,
      html: p(
        "Energy is never created or destroyed – it is just conserved. An example is if a box on a high shelf falls off it, its GPE is converted to kinetic energy – it doesn’t just disappear!",
      ),
    }),

    heading(466, 452, 280, "STUDY – CAR CRASHES"),
    text({
      ...body,
      x: 446,
      y: 488,
      w: 320,
      h: 98,
      html: p(
        "In a moving car, all the passengers will have momentum. If the car suddenly crashes, they will all suddenly lose the momentum, but doing so quickly is very dangerous, and so cars all have safety mechanisms to slow down this loss of momentum.",
      ),
    }),
    text({
      ...body,
      x: 446,
      y: 592,
      w: 320,
      h: 62,
      html: p(
        "Seatbelts do this because they stretch with the car’s movements, stopping the human from moving so suddenly forward and sustaining injuries.",
      ),
    }),
    text({
      ...body,
      x: 446,
      y: 660,
      w: 320,
      h: 42,
      html: p(
        "Air bags also do this; they slow down the change in momentum, and thus reduce the overall force.",
      ),
    }),
    text({
      ...body,
      x: 446,
      y: 708,
      w: 200,
      h: 118,
      html: p(
        "Cars are also all engineered with an area at the front of the vehicle called the crumple zone. It is designed to absorb a lot of the force of impact to minimalise the damage to the main area of the car with people in it.",
      ),
    }),
    sticker({ x: 644, y: 702, sticker: "car-crash", w: 126, h: 84 }),

    /* ---------- important equations box ---------- */
    shape({
      x: 442,
      y: 838,
      w: 322,
      h: 176,
      shape: "rect",
      fill: "rgba(255,255,255,0.55)",
      stroke: PALETTE.lavender,
      strokeWidth: 2,
      dashed: true,
      wavyBorder: true,
    }),
    text({
      x: 474,
      y: 840,
      w: 160,
      h: 30,
      html: "important",
      font: "title",
      fontSize: 24,
      color: PALETTE.purple,
    }),
    text({
      x: 474,
      y: 874,
      w: 220,
      h: 30,
      html: `<span style="color:${PALETTE.lavender}">→</span> ${spaced("EQUATIONS")}`,
      font: "sub",
      fontSize: 24,
    }),
    text({
      x: 452,
      y: 906,
      w: 302,
      h: 98,
      align: "center",
      font: "equation",
      fontSize: 12,
      lineHeight: 1.9,
      html:
        p(mark("momentum &nbsp;=&nbsp; mass × velocity")) +
        p("OR:&nbsp; P (kg m/s) &nbsp;=&nbsp; M (kg) × V (m/s)") +
        p(mark("momentum change &nbsp;=&nbsp; resultant force × timespan")) +
        p("OR:&nbsp; ΔP (kg m/s) &nbsp;=&nbsp; RF (N) × T (s)"),
    }),
  ];

  return {
    version: 1,
    paper: {
      size: "a4",
      pattern: "grid",
      accent: "#f0ecf9",
      color: "#fdfcfa",
      lineGap: 26,
      margin: 40,
    },
    desk: { ...DEFAULT_DESK, color: "#eae4f4" },
    elements,
  };
}

/* --------------------------- LINED STUDY -------------------------- */

function figuresDoc(): NoteDoc {
  zc = 1;
  const elements: NoteElement[] = [
    text({
      x: 120,
      y: 56,
      w: 554,
      h: 110,
      html: "Figures of Speech",
      font: "title",
      fontSize: 72,
      align: "center",
    }),
    sticker({ x: 74, y: 70, sticker: "sprig", w: 44, h: 82, rotation: -10 }),
    sticker({ x: 676, y: 70, sticker: "butterfly", w: 56, h: 46, rotation: 8 }),
    text({
      x: 120,
      y: 168,
      w: 554,
      h: 40,
      html: spaced("ENGLISH · UNIT ONE"),
      font: "sub",
      fontSize: 28,
      align: "center",
      color: PALETTE.purple,
    }),
    text({
      x: 70,
      y: 232,
      w: 400,
      h: 36,
      html: wavy("1. Simile"),
      font: "sub",
      fontSize: 30,
      color: PALETTE.purple,
    }),
    text({
      x: 70,
      y: 272,
      w: 640,
      h: 60,
      font: "body",
      fontSize: 18,
      html: p(
        "A comparison between two unlike things using “like” or “as” to create a vivid picture.",
      ),
    }),
    shape({
      x: 70,
      y: 338,
      w: 640,
      h: 96,
      shape: "rect",
      fill: "#f7f2ff",
      stroke: PALETTE.lavender,
      dashed: true,
      html: `<b>Examples</b><br/>Her smile was ${mark("as bright as the morning sun")}.<br/>He runs like the wind.`,
      font: "body",
      fontSize: 17,
    }),
    text({
      x: 70,
      y: 464,
      w: 400,
      h: 36,
      html: wavy("2. Metaphor"),
      font: "sub",
      fontSize: 30,
      color: PALETTE.purple,
    }),
    text({
      x: 70,
      y: 504,
      w: 640,
      h: 60,
      font: "body",
      fontSize: 18,
      html: p("A direct comparison that says one thing *is* another, without like or as."),
    }),
    shape({
      x: 70,
      y: 570,
      w: 640,
      h: 96,
      shape: "rect",
      fill: "#fdf1f7",
      stroke: "#eab8d2",
      dashed: true,
      html: `<b>Examples</b><br/>Time is a thief.<br/>The classroom was ${mark("a zoo", "#fbd7e8")}.`,
      font: "body",
      fontSize: 17,
    }),
    shape({
      x: 430,
      y: 706,
      w: 280,
      h: 150,
      shape: "cloud",
      fill: "#ffffff",
      stroke: "#c5ddf5",
      html: "<b>Remember!</b><br/>Personification gives human traits to non-human things.",
      font: "body",
      fontSize: 17,
    }),
    sticker({ x: 90, y: 720, sticker: "book", w: 120, h: 76 }),
    sticker({ x: 240, y: 740, sticker: "coffee", w: 54, h: 54 }),
    sticker({ x: 150, y: 840, sticker: "sparkle", w: 40, h: 40 }),
  ];
  return {
    version: 1,
    paper: {
      size: "a4",
      pattern: "lined",
      accent: "#e6e0f0",
      color: "#fffdf8",
      lineGap: 28,
      margin: 44,
    },
    desk: { ...DEFAULT_DESK, color: "#f1e9f0" },
    elements,
  };
}

/* --------------------------- DOT PLANNER -------------------------- */

function plannerDoc(): NoteDoc {
  zc = 1;
  const elements: NoteElement[] = [
    sticker({ x: 60, y: 44, sticker: "washi", w: 200, h: 40, rotation: -4 }),
    text({
      x: 90,
      y: 96,
      w: 614,
      h: 100,
      html: "Weekly Plan",
      font: "title",
      fontSize: 70,
      align: "center",
    }),
    text({
      x: 90,
      y: 196,
      w: 614,
      h: 40,
      html: spaced("WEEK OF ______"),
      font: "sub",
      fontSize: 30,
      align: "center",
      color: PALETTE.purple,
    }),
    shape({
      x: 60,
      y: 258,
      w: 200,
      h: 64,
      shape: "banner",
      fill: "#e0d3fb",
      stroke: "#b9a3e3",
      html: "Classwork",
      font: "sub",
      fontSize: 30,
    }),
    shape({
      x: 300,
      y: 258,
      w: 200,
      h: 64,
      shape: "banner",
      fill: "#d5f0e4",
      stroke: "#9ecfba",
      html: "Homework",
      font: "sub",
      fontSize: 30,
    }),
    shape({
      x: 540,
      y: 258,
      w: 194,
      h: 64,
      shape: "banner",
      fill: "#ffe9c9",
      stroke: "#eac79a",
      html: "Revision",
      font: "sub",
      fontSize: 30,
    }),
    text({
      x: 60,
      y: 348,
      w: 674,
      h: 300,
      font: "body",
      fontSize: 18,
      lineHeight: 1.9,
      html:
        p("☐ ________________________") +
        p("☐ ________________________") +
        p("☐ ________________________") +
        p("☐ ________________________"),
    }),
    shape({
      x: 420,
      y: 700,
      w: 300,
      h: 160,
      shape: "bubble",
      fill: "#ffffff",
      stroke: "#f0c3d8",
      html: "<b>Notes to self…</b>",
      font: "body",
      fontSize: 18,
    }),
    sticker({ x: 90, y: 720, sticker: "flower", w: 60, h: 60 }),
    sticker({ x: 170, y: 760, sticker: "heart", w: 44, h: 44 }),
    sticker({ x: 240, y: 712, sticker: "moon", w: 48, h: 48 }),
    sticker({ x: 120, y: 840, sticker: "star", w: 40, h: 40 }),
  ];
  return {
    version: 1,
    paper: {
      size: "a4",
      pattern: "dot",
      accent: "#ded7ec",
      color: "#fffefb",
      lineGap: 24,
      margin: 40,
    },
    desk: { ...DEFAULT_DESK, color: "#eef0f6" },
    elements,
  };
}

export const TEMPLATES: TemplateDef[] = [
  {
    id: "blank",
    name: "Blank page",
    blurb: "A clean sheet with a title block — start from nothing.",
    tags: ["Grid paper", "A4"],
    swatch: ["#f6f2ff", "#ffffff"],
    build: blankDoc,
  },
  {
    id: "physics",
    name: "Physics · Module Four",
    blurb:
      "Two-column GCSE physics spread: motion graphs, forces, car crashes and an important-equations box.",
    tags: ["Grid paper", "Two column", "Lavender"],
    preview: "/templates/physics-reference.jpg",
    swatch: ["#e7defa", "#fdfcfa"],
    build: physicsDoc,
  },
  {
    id: "figures",
    name: "Figures of Speech",
    blurb: "Lined study page with numbered sections and example boxes.",
    tags: ["Lined paper", "Examples"],
    swatch: ["#fdf1f7", "#fffdf8"],
    build: figuresDoc,
  },
  {
    id: "planner",
    name: "Weekly Planner",
    blurb: "Dot-grid planner with banners, checklists and a speech bubble.",
    tags: ["Dot grid", "Banners"],
    swatch: ["#d5f0e4", "#fffefb"],
    build: plannerDoc,
  },
];

export function getTemplate(id: string): TemplateDef {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

export function buildTemplateDoc(id: string): NoteDoc {
  return getTemplate(id).build();
}
