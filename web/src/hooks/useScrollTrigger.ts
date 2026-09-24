"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };

/**
 * Custom hook using official @gsap/react useGSAP to safely initialize
 * GSAP ScrollTrigger inside React components.
 * Automatically handles SSR safety, React Strict Mode double invocation,
 * and cleans up ScrollTrigger instances on unmount.
 */
export function useScrollAnimation(
  callback: (context: any) => void,
  dependencies: any[] = []
) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    (context) => {
      if (typeof window === "undefined") return;
      gsap.registerPlugin(ScrollTrigger);
      callback(context);
    },
    { scope: containerRef, dependencies }
  );

  return containerRef;
}
