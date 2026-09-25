"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, Zap, ArrowRight, ExternalLink } from "lucide-react";
import { useScrollAnimation, gsap } from "@/hooks/useScrollTrigger";

export default function SubscriptionPricingSection() {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");

  const containerRef = useScrollAnimation(() => {
    gsap.from(".pricing-header", {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".pricing-section",
        start: "top 85%",
      },
    });

    gsap.from(".pricing-card", {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".pricing-grid",
        start: "top 85%",
      },
    });
  });

  return (
    <section
      ref={containerRef}
      id="pricing"
      className="pricing-section relative w-full py-28 px-6 md:px-12 bg-[#020204] text-white border-t border-white/5 overflow-hidden"
    >
      {/* Background subtle atmospheric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-transparent blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="pricing-header flex flex-col items-center text-center mb-16">
          <p className="text-xs font-mono tracking-widest text-zinc-400 uppercase mb-3">
            MEMBERSHIP & REVENUECAT INTEGRATION
          </p>

          <h2 className="text-3xl md:text-5xl font-serif text-white max-w-2xl leading-[1.12] tracking-tight">
            Built for focus. Engineered for ownership.
          </h2>

          <p className="mt-4 text-white/60 text-sm md:text-base max-w-xl font-sans leading-relaxed">
            Start free with full on-device SQLite autonomy. Upgrade to MindMesh Pro for ambient synaptic convergence, automated build plans, and multi-device vault sync.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition-all ${
                billingCycle === "annual"
                  ? "bg-white text-black font-semibold shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              ANNUAL (SAVE 58%)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-xs font-mono tracking-wider transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-black font-semibold shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              MONTHLY
            </button>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="pricing-grid grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Free Community Tier */}
          <div className="pricing-card flex flex-col justify-between rounded-3xl border border-white/10 bg-[#090912] p-8 md:p-10 relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
                  COMMUNITY
                </span>
                <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                  LOCAL AUTONOMY
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-serif text-white">$0</span>
                  <span className="text-xs font-mono text-zinc-400">/ forever</span>
                </div>
                <p className="mt-2 text-xs text-white/50 font-sans">
                  Free and open for researchers, students, and independent thinkers.
                </p>
              </div>

              <div className="w-full h-px bg-white/5 my-6" />

              <div className="space-y-3.5">
                {[
                  "On-device SQLite vault with full offline access",
                  "3 weekly Serendipity Engine convergence scans",
                  "Full-screen camera & Whisper voice memo capture",
                  "Standard Markdown (.md) note export",
                  "BYOK architecture for Gemini & Groq APIs",
                  "Zero data collection or model retraining",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5 border border-white/10">
                      <Check className="w-2.5 h-2.5 text-white/70" />
                    </div>
                    <span className="text-xs md:text-sm text-white/75 font-sans leading-snug">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <a
                href="https://github.com/MdTowfikomer/MindMesh-AI/releases/latest/download/app-release.apk"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/15 bg-white/5 text-white text-xs font-mono tracking-wider hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <span>DOWNLOAD FREE APK</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Pro Tier (RevenueCat) */}
          <div className="pricing-card flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#14121a] to-[#0a0910] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-amber-500/5">
            {/* Top highlight glow */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-widest text-amber-400 uppercase font-semibold">
                  MINDMESH PRO
                </span>
                <span className="text-[11px] font-mono tracking-wider px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
                  7-DAY FREE TRIAL
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl md:text-5xl font-serif text-white">
                    {billingCycle === "annual" ? "$4.16" : "$9.99"}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/ month</span>
                </div>
                <p className="mt-2 text-xs text-white/60 font-sans">
                  {billingCycle === "annual"
                    ? "Billed annually at $49.99/year. Cancel anytime."
                    : "Billed monthly at $9.99/month. Cancel anytime."}
                </p>
              </div>

              <div className="w-full h-px bg-white/10 my-6" />

              <div className="space-y-3.5">
                {[
                  "Everything in Community, plus:",
                  "Unlimited continuous Serendipity Engine discoveries",
                  "Automated PRD & RevenueCat paywall build plans",
                  "Multi-device Obsidian & Notion vault sync",
                  "Background NPU clustering & semantic deduplication",
                  "Restorable entitlements across all devices",
                  "Priority multi-modal synthesis pipeline",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/40">
                      <Check className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                    <span
                      className={`text-xs md:text-sm font-sans leading-snug ${
                        idx === 0 ? "text-amber-300/90 font-medium" : "text-white/85"
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <a
                href="https://github.com/MdTowfikomer/MindMesh-AI/releases/latest/download/app-release.apk"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-black text-xs font-mono font-semibold tracking-wider hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                <span>START 7-DAY FREE TRIAL</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* RevenueCat Trust Footer */}
        <div className="mt-14 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>POWERED & SECURED BY REVENUECAT SDK</span>
          </div>

          <div className="flex items-center gap-6 text-[11px] text-zinc-400">
            <span>NO HARD PAYWALL LOCKOUT</span>
            <span>RESTORE ANYTIME</span>
            <span>CANCEL ANYTIME</span>
          </div>
        </div>
      </div>
    </section>
  );
}
