import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-serif" });
const spaceMono = Space_Mono({ variable: "--font-mono-display", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "YapSesh v1.0 — your digital thinking garden",
  description: "Talk about anything. AI maps your conversation into a visual flowchart of topics in real time.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
