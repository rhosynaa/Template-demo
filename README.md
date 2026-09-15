"I am building a note-taking app called Noatic using Next.js 16, React 19, TypeScript, and Tailwind CSS 4. I have already built the foundation, the text engine, and the initial Physics template.
Current State of the App:
The UI has a Toolbox on the left, a top Ribbon for formatting, and a central Paper Canvas.
The paper supports A4, A5, Letter, Legal, and Tabloid sizes.
The fonts (Playlist Script, Amatic SC, Patrick Hand, Kalam) are imported in  globals.css .
The templates are defined in  src/lib/editor/templates.ts .
The UI components are in  src/components/editor/  (EditorShell, PaperCanvas, ElementView, Toolbox, etc.).
The Problem:
My previous AI chat was lost, and I need to implement the next features without breaking the existing architecture.
Please implement the following two updates:
1. Fix the A5 Scaling Bug:
Currently, elements in templates use absolute X/Y coordinates. When the user switches the paper size to A5, the text and elements overflow off the edge.
Please update the  PaperCanvas.tsx  or  ElementView.tsx  rendering logic so that when the paper size changes, the entire canvas content scales proportionally (using CSS  transform: scale() ) to fit within the new paper boundaries.
2. Replace Static Graph Stickers with a 'Smart Graph' Widget:
In  src/lib/editor/templates.ts , the Physics template currently uses static stickers for the graphs ( sticker: "graph-dt"  and  sticker: "graph-vt" ). Remove these.
Instead, create a new interactive  SmartGraph  component:
In  types.ts : Add a new element type:  { type: 'smart-graph', graphType: 'line', x, y, w, h, lines: { points: {x,y}[], color, width }[], xAxisLabel: string, yAxisLabel: string } .
In  templates.ts : Replace the graph stickers in the Physics template with this new  smart-graph  element type. Set the default line  width  to  1.5  so they look like fine-point pen strokes.
Create  src/components/editor/SmartGraph.tsx : When rendered, it should draw a clean X and Y axis with thin lines. It must be selectable. When selected, show a small toolbar allowing the user to:
1.
Edit the X and Y axis labels (click to type).
2.
Add a new line to the graph (up to 4 lines total).
3.
Drag the control points of the lines to change their shape/curve.
In  Toolbox.tsx : Add a 'Smart Graph' button to the toolbox so the user can drag a blank, pre-loaded X/Y axis graph onto any blank page.
Please read the existing files first to understand the current structure, then implement these changes carefully."
