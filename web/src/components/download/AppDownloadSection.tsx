"use client";

import React from "react";
import { Download, Smartphone, Shield, HardDrive, Cpu, ExternalLink, ArrowRight } from "lucide-react";
import { useScrollAnimation, gsap } from "@/hooks/useScrollTrigger";

export default function AppDownloadSection() {
  const containerRef = useScrollAnimation(() => {
    gsap.from(".download-card", {
      opacity: 0,
      y: 40,
      scale: 0.97,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".download-card",
        start: "top 85%",
      },
    });

    gsap.from(".download-badge", {
      opacity: 0,
      scale: 0.8,
      duration: 0.7,
      delay: 0.2,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".download-card",
        start: "top 85%",
      },
    });

    gsap.from(".spec-item", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".specs-grid",
        start: "top 90%",
      },
    });
  });

  return (
    <section ref={containerRef} id="download" className="relative w-full py-28 px-6 md:px-12 bg-black text-white border-t border-white/5 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-t from-blue-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Main CTA Card */}
        <div className="download-card relative rounded-3xl border border-white/10 bg-[#090912] p-8 md:p-16 overflow-hidden shadow-2xl">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* App Icon badge */}
            <div className="download-badge relative w-20 h-20 mb-8 rounded-3xl overflow-hidden border border-white/20 shadow-2xl shadow-white/10 bg-black flex items-center justify-center">
              <img
                src="/mindmesh-icon.png"
                alt="MindMesh AI"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/originkit/hero-26/logomark.svg";
                }}
              />
            </div>

            <p className="text-xs font-mono tracking-widest text-zinc-400 uppercase mb-3">
              AVAILABLE NOW FOR ANDROID
            </p>

            <h2 className="text-4xl md:text-6xl font-serif text-white max-w-2xl leading-[1.08] tracking-tight">
              Carry your second brain in your pocket.
            </h2>

            <p className="mt-4 text-white/60 text-sm md:text-base max-w-lg font-sans leading-relaxed">
              Start transforming scattered notes, camera captures, and bookmarks into your living knowledge mesh today.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              {/* Direct APK Download Button */}
              <a
                href="https://github.com/MdTowfikomer/MindMesh-AI/releases/latest/download/app-release.apk"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition-all duration-300 shadow-xl shadow-white/10 hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Download Android APK</span>
              </a>

              {/* GitHub Releases / Repository */}
              <a
                href="https://github.com/MdTowfikomer/MindMesh-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto liquid-glass inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-white font-medium text-sm transition-all duration-300 hover:scale-[1.02] border border-white/15"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>Star on GitHub</span>
              </a>
            </div>

            {/* Spec Badges Row */}
            <div className="specs-grid mt-14 pt-10 border-t border-white/10 w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-start">
              <div className="spec-item flex items-start gap-3">
                <HardDrive className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-white/90 font-semibold">100% On-Device</div>
                  <div className="text-[11px] font-sans text-white/50">Local SQLite storage</div>
                </div>
              </div>

              <div className="spec-item flex items-start gap-3">
                <Cpu className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-white/90 font-semibold">BYOK Intelligence</div>
                  <div className="text-[11px] font-sans text-white/50">Gemini & Local models</div>
                </div>
              </div>

              <div className="spec-item flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-white/90 font-semibold">Zero-Tap Share Sheet</div>
                  <div className="text-[11px] font-sans text-white/50">Ingest from any app</div>
                </div>
              </div>

              <div className="spec-item flex items-start gap-3">
                <Shield className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-white/90 font-semibold">Zero Vendor Lock-in</div>
                  <div className="text-[11px] font-sans text-white/50">Instant Obsidian export</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-white/40">
          <div className="flex items-center gap-3">
            <span className="text-white/80 font-sans font-semibold">MindMesh AI</span>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <span>On-Device First</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/MdTowfikomer/MindMesh-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/MdTowfikomer/MindMesh-AI/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Releases
            </a>
            <a
              href="https://github.com/MdTowfikomer/MindMesh-AI/blob/main/README.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Documentation
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}
