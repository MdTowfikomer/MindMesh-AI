"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useScrollAnimation, gsap } from "@/hooks/useScrollTrigger";

interface TabItem {
  id: string;
  tag: string;
  label: string;
  headline: string;
  description: string;
  ctaText: string;
  screenSrc: string;
  screenAlt: string;
}

const TABS: TabItem[] = [
  {
    id: "feed",
    tag: "01 / MEMORY FEED",
    label: "Living Stream",
    headline: "Your entire visual memory in one unified canvas.",
    description:
      "Articles, ASCII art, video timestamps, and voice notes co-exist in an adaptive masonry stream. No folder structures, no tagging overhead—ingest from any app and let MindMesh organize context.",
    ctaText: "Explore Feed Architecture",
    screenSrc: "/screens/01-memory-feed.png",
    screenAlt: "MindMesh AI - Memory Feed",
  },
  {
    id: "voice",
    tag: "02 / AMBIENT SPEECH",
    label: "Voice Capture",
    headline: "Speak freely. Formatted and indexed in milliseconds.",
    description:
      "Powered by Gemini 2.5 Flash and local on-device SQLite, spoken notes are parsed into structured markdown thoughts with automatic intent classification and zero vendor lock-in.",
    ctaText: "See Speech Pipeline",
    screenSrc: "/screens/02-voice-thought.png",
    screenAlt: "MindMesh AI - Voice Thought Transcription",
  },
  {
    id: "serendipity",
    tag: "03 / SYNAPTIC MESH",
    label: "Serendipity Spark",
    headline: "Proactive connections across disparate thoughts.",
    description:
      "MindMesh computes high-dimensional semantic similarity in real time, drawing threads between design pins from Pinterest, technical papers, and quick voice recordings.",
    ctaText: "Navigate Knowledge Mesh",
    screenSrc: "/screens/03-discovery-graph.png",
    screenAlt: "MindMesh AI - Discovery & Knowledge Graph",
  },
  {
    id: "rediscovery",
    tag: "04 / CURATION DECK",
    label: "Rediscovery Deck",
    headline: "Review, curate, or clear your mind vault card by card.",
    description:
      "Swipe through your cognitive deck to resurface forgotten insights, maintain vault hygiene, and keep your second brain razor-sharp without overwhelm.",
    ctaText: "Explore Rediscovery Loop",
    screenSrc: "/screens/04-rediscovery-deck.png",
    screenAlt: "MindMesh AI - Rediscovery Deck",
  },
];

export default function VelorahSplitFeature() {
  const [activeTab, setActiveTab] = useState(0);

  const current = TABS[activeTab];

  const nextTab = () => setActiveTab((prev) => (prev + 1) % TABS.length);
  const prevTab = () => setActiveTab((prev) => (prev - 1 + TABS.length) % TABS.length);

  const containerRef = useScrollAnimation(() => {
    gsap.from(".velorah-header", {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".velorah-header",
        start: "top 85%",
      },
    });

    gsap.from(".velorah-card", {
      opacity: 0,
      y: 45,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".velorah-card",
        start: "top 80%",
      },
    });
  });

  return (
    <section ref={containerRef} id="features" className="relative w-full py-16 md:py-28 px-4 sm:px-6 md:px-12 bg-black text-white border-t border-white/5 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-96 h-96 bg-zinc-700/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-zinc-800/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="velorah-header flex flex-col items-center text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono tracking-widest text-zinc-300 uppercase mb-4 backdrop-blur-md">
            <span>02 / COGNITIVE INTERFACE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif tracking-tight font-normal text-white max-w-3xl leading-[1.1]">
            Built for deep thinkers. <br />
            <span className="italic font-light text-zinc-400">Engineered for absolute focus.</span>
          </h2>
          <p className="mt-3 md:mt-4 text-zinc-400 text-xs sm:text-sm md:text-base max-w-xl font-sans px-4">
            How MindMesh unifies ephemeral moments, visual bookmarks, and cognitive threads into structured personal knowledge.
          </p>
        </div>

        {/* Mobile Horizontal Tab Selector: Sticky & Tap-Friendly Directly Above Phone */}
        <div className="lg:hidden mb-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-xl">
            {TABS.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-2 px-1 text-center rounded-xl text-[11px] font-sans transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white text-black font-semibold shadow-md shadow-white/10"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span className="block font-mono text-[9px] opacity-70 mb-0.5">0{idx + 1}</span>
                  <span className="block truncate font-medium">{tab.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Velorah Split Grid Card */}
        <div className="velorah-card grid gap-6 md:gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#07070a]/90 backdrop-blur-xl lg:grid-cols-12 p-3 sm:p-6 shadow-2xl shadow-black/80">
          
          {/* Left Column: Interactive Tab Information & Desktop Controls (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#0c0c12] p-6 sm:p-8 md:p-10 border border-white/5 relative overflow-hidden order-2 lg:order-1">
            <div className="relative z-10">
              {/* Micro Tag */}
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 text-white bg-white/5 text-xs font-mono">
                  0{activeTab + 1}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                  {current.tag}
                </span>
              </div>

              {/* Dynamic Headline & Description */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-serif text-white tracking-tight leading-snug mb-3 sm:mb-4">
                    {current.headline}
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm md:text-base leading-relaxed font-sans">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop Controls (Hidden on mobile since mobile has dedicated controls attached to preview) */}
            <div className="relative z-10 pt-8 sm:pt-10">
              {/* Desktop Monochromatic Toggle Group */}
              <div className="hidden lg:flex flex-wrap items-center gap-2 mb-6">
                {TABS.map((tab, idx) => {
                  const isActive = activeTab === idx;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium font-sans transition-all duration-200 outline-none cursor-pointer ${
                        isActive
                          ? "bg-white text-black font-semibold shadow-lg shadow-white/10 scale-105"
                          : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                      }`}
                    >
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progress Indicator Line */}
              <div className="mb-6 h-[2px] w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${((activeTab + 1) / TABS.length) * 100}%` }}
                />
              </div>

              {/* Action Button */}
              <a
                href="https://github.com/MdTowfikomer/MindMesh-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass inline-flex items-center justify-between gap-4 w-full sm:w-auto px-6 py-3 rounded-full text-xs md:text-sm font-sans font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:border-white/30"
              >
                <span>{current.ctaText}</span>
                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Authentic Mobile Viewport Mockup with Interactive Swipe & Navigation (7 Cols) */}
          <div className="lg:col-span-7 relative min-h-[560px] sm:min-h-[680px] lg:min-h-[820px] rounded-2xl bg-[#030305] border border-white/5 p-3 sm:p-6 md:p-8 flex flex-col items-center justify-center overflow-hidden order-1 lg:order-2">
            {/* Ambient behind-phone radial glow */}
            <div className="absolute w-72 h-72 rounded-full bg-white/[0.03] blur-[90px] pointer-events-none" />

            {/* Mobile Navigation Header with Prev / Next Arrows & Screen Name */}
            <div className="w-full max-w-[340px] sm:max-w-[355px] flex items-center justify-between mb-3 px-2 z-20">
              <button
                type="button"
                onClick={prevTab}
                aria-label="Previous screen"
                className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <span className="font-mono text-[10px] tracking-wider uppercase text-zinc-400">
                  {current.label}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {TABS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeTab ? "w-5 bg-white" : "w-1.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={nextTab}
                aria-label="Next screen"
                className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/15 flex items-center justify-center text-zinc-300 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Phone Frame Shell - Modern Flagship 9:20 Form Factor Matching Real Device */}
            <div className="relative w-full max-w-[320px] sm:max-w-[355px] aspect-[9/20] rounded-[44px] sm:rounded-[48px] border-[6px] sm:border-[8px] border-[#1c1c24] bg-black shadow-2xl shadow-black ring-1 ring-white/15 overflow-hidden flex flex-col cursor-grab active:cursor-grabbing touch-pan-y">
              
              {/* Dynamic Punch Hole Camera */}
              <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#0a0a0e] ring-1 ring-white/15 z-40 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
              </div>

              {/* Dynamic Screen Stage with Swipe Gesture Support */}
              <div className="relative w-full h-full overflow-hidden bg-black select-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -40 || info.velocity.x < -200) {
                        nextTab();
                      } else if (info.offset.x > 40 || info.velocity.x > 200) {
                        prevTab();
                      }
                    }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="relative w-full h-full"
                  >
                    <img
                      src={current.screenSrc}
                      alt={current.screenAlt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top pointer-events-none"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Helpful mobile touch hint */}
            <p className="mt-3 text-[11px] font-mono text-zinc-500 tracking-wider flex items-center gap-1.5">
              <span>← Swipe screen or tap arrows to flip →</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
