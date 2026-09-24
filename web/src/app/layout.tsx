import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindMesh AI — Remember Everything. Organize Nothing.",
  description:
    "An on-device first cognitive copilot and ambient second brain. Turn screenshots, voice notes, and bookmarks into an interconnected, living knowledge graph.",
  keywords: [
    "MindMesh",
    "Second Brain",
    "Knowledge Graph",
    "Gemini AI",
    "Obsidian",
    "Notion",
    "On-Device AI",
    "Personal Knowledge Base",
  ],
  icons: {
    icon: "/mindmesh-logo.png",
  },
  openGraph: {
    title: "MindMesh AI — Remember Everything. Organize Nothing.",
    description:
      "Turn scattered screenshots, fleeting voice notes, and social bookmarks into an interconnected, living knowledge graph.",
    images: ["/mindmesh-splash.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#020204] text-white">
        {children}
      </body>
    </html>
  );
}
