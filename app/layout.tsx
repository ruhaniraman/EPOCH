import type { Metadata, Viewport } from "next";
import { Bebas_Neue, JetBrains_Mono, Space_Mono } from "next/font/google";
import { BlockCursor } from "@/components/landing/BlockCursor";
import "./globals.css";

// next/font downloads these at build time and self-hosts them: no request to
// Google from the visitor's phone, and no layout jump when fonts load.
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const space = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space", display: "swap" });

export const metadata: Metadata = {
  title: "EPOCH 1.0 — Datathon",
  description:
    "EPOCH 1.0 Datathon by The ACE Society, Dept. of CSE (Data Science), DSCE. 24 Nov 2026. Clean it. Train it. Pitch it.",
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bebas.variable} ${jetbrains.variable} ${space.variable}`}>
      <body>
        {children}
        <BlockCursor />
      </body>
    </html>
  );
}
