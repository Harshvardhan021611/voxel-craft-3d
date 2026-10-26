import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-display" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Voxel Craft 3D — The Next Generation Sandbox",
  description: "An infinite procedural voxel sandbox combining classic simplicity with AAA graphics. Cross-platform multiplayer, AI worlds, and 5000+ blocks.",
  keywords: "voxel, sandbox, 3D game, multiplayer, procedural world, minecraft alternative, block craft",
  openGraph: {
    title: "Voxel Craft 3D",
    description: "Build beyond the horizon.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050714",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-void text-slate-50 antialiased selection:bg-cyan/25 overflow-x-hidden">
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
