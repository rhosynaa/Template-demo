import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noatic — aesthetic note studio",
  description:
    "A visual, template-driven note editor: real-size paper on a desk, handwriting fonts, stickers, shapes and freehand drawing.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Caveat:wght@400..700&family=Caveat+Brush&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Yellowtail&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#f3eff8] text-[#2f2a3a] antialiased">
        {children}
      </body>
    </html>
  );
}
