import dynamic from "next/dynamic";
import Hero26 from "@/components/originkit/hero-26";
import AmbientMeshBackground from "@/components/ui/AmbientMeshBackground";

// Lazy-loaded below-the-fold feature sections for optimal initial page bundle and load speed
const VelorahSplitFeature = dynamic(
  () => import("@/components/velorah/VelorahSplitFeature"),
  {
    loading: () => <div className="min-h-[700px] w-full bg-black/30" />,
  }
);

const MymindStream = dynamic(
  () => import("@/components/mymind/MymindStream"),
  {
    loading: () => <div className="min-h-[600px] w-full bg-[#020204]" />,
  }
);

const SubscriptionPricingSection = dynamic(
  () => import("@/components/pricing/SubscriptionPricingSection"),
  {
    loading: () => <div className="min-h-[500px] w-full bg-[#020204]" />,
  }
);

const AppDownloadSection = dynamic(
  () => import("@/components/download/AppDownloadSection"),
  {
    loading: () => <div className="min-h-[500px] w-full bg-black" />,
  }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020204] text-white flex flex-col relative">
      {/* Ambient Neural Dot-Matrix Background Texture & Particle Mesh across the entire site */}
      <AmbientMeshBackground />

      {/* 1. Originkit Hero 26: Animated Dot-Matrix Hero Section */}
      <div className="relative z-10">
        <Hero26 />
      </div>

      {/* 2. Velorah Architecture: Switchable Tabs & Mobile Memory Feed Mockup + Swiss Minimalist Gallery */}
      <VelorahSplitFeature />

      {/* 3. Mymind-Style Visual Memory Stream: Search, Filters & Cards */}
      <MymindStream />

      {/* 4. Transparent Membership & RevenueCat Pricing Grid */}
      <SubscriptionPricingSection />

      {/* 5. App Download & Specs Section + Minimalist Footer */}
      <AppDownloadSection />
    </main>
  );
}
