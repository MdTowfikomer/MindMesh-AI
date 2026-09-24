"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, Image as ImageIcon, BookOpen, Quote, Sparkles, ExternalLink, Hash, Check } from "lucide-react";

interface Memory {
  id: string;
  type: "voice" | "visual" | "article" | "quote" | "code";
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  timestamp: string;
  tags: string[];
  meta?: {
    duration?: string;
    domain?: string;
    readingTime?: string;
    ocrText?: string;
    colors?: string[];
    connections?: number;
  };
}

const SEED_MEMORIES: Memory[] = [
  {
    id: "mem-pin-brutalism",
    type: "visual",
    title: "Brutalist Concrete Geometry & Spatial Shadows",
    content: "High-contrast study of spatial massing, cast shadows, and tactile concrete surfaces. Pinned from architectural photography archive.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    timestamp: "Sep 21, 11:20 AM",
    tags: ["Architecture", "Brutalism", "Spatial"],
    meta: {
      ocrText: "AXONOMETRIC PERSPECTIVE",
      colors: ["#18181b", "#52525b", "#d4d4d8"],
      connections: 5,
    },
  },
  {
    id: "mem-pin-typography",
    type: "visual",
    title: "Swiss Typographic Style & Columnar Grids",
    content: "Editorial layout exploring negative space, asymmetric typography, and high-legibility hierarchy. Automatic OCR extraction enabled.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    timestamp: "Sep 20, 04:15 PM",
    tags: ["Typography", "SwissStyle", "Editorial"],
    meta: {
      ocrText: "NEUE GRAPHIK • SYSTEMATIK",
      colors: ["#09090b", "#71717a", "#e4e4e7"],
      connections: 4,
    },
  },
  {
    id: "mem-pin-minimal-art",
    type: "visual",
    title: "Monochrome Grain & Ambient Interference",
    content: "Visual resonance study of refracted light on dark photographic paper. Auto-connected to spatial memory graph.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    timestamp: "Sep 19, 06:40 PM",
    tags: ["VisualArt", "Monochrome", "Aesthetics"],
    meta: {
      ocrText: "WAVELENGTH • CONTRAST 94%",
      colors: ["#000000", "#3f3f46", "#a1a1aa"],
      connections: 6,
    },
  },
  {
    id: "mem-seed-bookmark",
    type: "article",
    title: "Dieter Rams: Ten Principles for Good Design",
    subtitle: "vitsoe.com / Design Manifesto",
    content: "Good design is innovative. Good design makes a product useful. Good design is aesthetic. Good design is as little design as possible.",
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
    timestamp: "Sep 19, 02:30 PM",
    tags: ["Design", "DieterRams", "Minimalism"],
    meta: { domain: "vitsoe.com", readingTime: "6 min read", connections: 7 },
  },
  {
    id: "mem-seed-voice",
    type: "voice",
    title: "Morning Note: Spatial Recall Over Hierarchical Folders",
    content: "The human brain doesn't file thoughts into nested folders like /Work/2026/Q1. It triggers memories by sensory cues, visual anchors, and unexpected serendipity.",
    timestamp: "Sep 18, 08:15 AM",
    tags: ["Neuroscience", "SecondBrain", "Thoughts"],
    meta: { duration: "0:28", connections: 4 },
  },
  {
    id: "mem-5",
    type: "code",
    title: "Deterministic Markdown Schema",
    content: `---
title: "Spatial Recall & Cognitive Anchors"
date: 2026-09-24
synaptic_links:
  - "[[Dieter Rams - Principles of Design]]"
  - "[[Swiss Typographic Grids]]"
---`,
    timestamp: "Sep 18, 2026",
    tags: ["Obsidian", "Markdown", "Schema"],
    meta: { connections: 3 },
  },
  {
    id: "mem-seed-tweet",
    type: "quote",
    title: "James Clear: Identity & Compounding Action",
    content: "Every action you take is a vote for the type of person you wish to become. As the votes build up, so does the evidence of your new identity.",
    subtitle: "James Clear — Atomic Habits",
    timestamp: "Sep 20, 09:00 AM",
    tags: ["Habits", "Self-Improvement", "Mindset"],
    meta: { connections: 5 },
  },
  {
    id: "mem-6",
    type: "quote",
    title: "On Cognitive Architecture",
    content: "You don't need another folder. You need a system that remembers why you cared in the first place.",
    subtitle: "MindMesh Manifesto",
    timestamp: "Sep 15, 2026",
    tags: ["Focus", "Manifesto"],
    meta: { connections: 8 },
  },
];

const FILTERS = [
  { label: "All Memories", value: "all" },
  { label: "Voice Notes", value: "voice", icon: <Mic className="w-3.5 h-3.5" /> },
  { label: "Visuals & OCR", value: "visual", icon: <ImageIcon className="w-3.5 h-3.5" /> },
  { label: "Web Articles", value: "article", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { label: "Quotes", value: "quote", icon: <Quote className="w-3.5 h-3.5" /> },
];

export default function MymindStream() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredMemories = SEED_MEMORIES.filter((m) => {
    const matchesFilter = activeFilter === "all" || m.type === activeFilter;
    const matchesSearch =
      searchQuery.trim() === "" ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleCopyLink = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="memory-stream" className="relative w-full py-24 px-6 md:px-12 bg-[#020204] text-white">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mymind-header flex flex-col items-center text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs font-mono tracking-widest text-zinc-400 uppercase mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>03 / THE AMBIENT STREAM</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif tracking-tight font-normal text-white max-w-3xl leading-[1.08]">
            Remember everything. <br />
            <span className="italic font-light text-white/70">Without ever organizing.</span>
          </h2>
          <p className="mt-4 text-white/50 text-sm md:text-base max-w-xl font-sans">
            No endless folders. No tedious manual tagging. MindMesh automatically understands what you save and surfaces it exactly when you need it.
          </p>
        </motion.div>

        {/* Ambient Search Bar & Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mymind-controls flex flex-col md:flex-row items-center justify-between gap-4 mb-12 p-3 rounded-2xl bg-[#090910] border border-white/10 backdrop-blur-xl"
        >
          {/* Interactive Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search your mind... (e.g. 'RAG', 'speech')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl ps-10 pe-4 py-2 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40 font-sans transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {FILTERS.map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-semibold shadow-md shadow-white/10"
                      : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/5"
                  }`}
                >
                  {f.icon}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Mymind-style Masonry Cards Grid with Guaranteed Fluid Animations */}
        <div className="mymind-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMemories.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.05, 0.3), ease: "easeOut" }}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#090912] border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-white/5 overflow-hidden"
              >
                {/* Top Bar of Card */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-white/50 px-2 py-0.5 rounded-md bg-white/5">
                      {item.type === "voice" && <Mic className="w-3 h-3 text-zinc-300" />}
                      {item.type === "visual" && <ImageIcon className="w-3 h-3 text-zinc-300" />}
                      {item.type === "article" && <BookOpen className="w-3 h-3 text-zinc-300" />}
                      {item.type === "quote" && <Quote className="w-3 h-3 text-zinc-300" />}
                      {item.type}
                    </span>
                    <span className="text-[11px] font-mono text-white/30">{item.timestamp}</span>
                  </div>

                  {/* Card Content based on type */}
                  {item.type === "quote" && (
                    <div className="space-y-3">
                      <p className="text-lg md:text-xl font-serif italic text-white/90 leading-snug">
                        "{item.content}"
                      </p>
                      {item.subtitle && (
                        <p className="text-xs font-mono text-white/50">— {item.subtitle}</p>
                      )}
                    </div>
                  )}

                  {item.type === "voice" && (
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold font-sans text-white/90">{item.title}</h4>
                      {/* Audio waveform mockup */}
                      <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div className="flex items-center gap-1 flex-1 h-6">
                          {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 85].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className="w-1 bg-white/70 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-white/40">{item.meta?.duration}</span>
                      </div>
                      <p className="text-xs font-mono text-white/60 leading-relaxed">{item.content}</p>
                    </div>
                  )}

                  {item.type === "visual" && (
                    <div className="space-y-3">
                      {item.imageUrl && (
                        <div className="h-52 rounded-xl overflow-hidden relative border border-white/10 bg-black group/pin">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover grayscale contrast-125 opacity-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          {item.meta?.colors && (
                            <div className="absolute bottom-2 left-2 flex gap-1 p-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10">
                              {item.meta.colors.map((c, i) => (
                                <div
                                  key={i}
                                  style={{ backgroundColor: c }}
                                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                                />
                              ))}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
                            {item.meta?.ocrText || "OCR Scanned"}
                          </div>
                        </div>
                      )}
                      <h4 className="text-base font-semibold font-sans text-white/95 leading-snug">{item.title}</h4>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">{item.content}</p>
                    </div>
                  )}

                  {item.type === "article" && (
                    <div className="space-y-3">
                      {item.imageUrl && (
                        <div className="h-44 rounded-xl overflow-hidden relative border border-white/10 bg-black group/pin">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover grayscale contrast-125 opacity-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
                            {item.subtitle}
                          </div>
                        </div>
                      )}
                      <h4 className="text-base font-semibold font-sans text-white/95 leading-snug">{item.title}</h4>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed">{item.content}</p>
                      <div className="text-[11px] font-mono text-zinc-500">{item.meta?.readingTime}</div>
                    </div>
                  )}

                  {item.type === "code" && (
                    <div className="space-y-3">
                      <h4 className="text-base font-semibold font-sans text-white/90">{item.title}</h4>
                      <pre className="p-3 rounded-xl bg-black/80 border border-white/5 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                        <code>{item.content}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Bottom Bar: Tags & Serendipity badge */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-white/40 hover:text-white/80 transition-colors"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {item.meta?.connections && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-300 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{item.meta.connections} links</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mymind Philosophy Banner */}
        <div className="mt-20 p-8 md:p-12 rounded-3xl bg-zinc-950/40 border border-white/10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <Sparkles className="w-6 h-6 text-zinc-200" />
          </div>
          <h3 className="text-2xl md:text-4xl font-serif text-white max-w-2xl leading-snug">
            "Your mind is for having ideas, not holding them."
          </h3>
          <p className="mt-4 text-white/50 text-xs md:text-sm max-w-lg font-mono">
            MindMesh is completely private. All memories stay in on-device SQLite. Zero advertising, zero public LLM training, 100% yours.
          </p>
        </div>
      </div>
    </section>
  );
}
