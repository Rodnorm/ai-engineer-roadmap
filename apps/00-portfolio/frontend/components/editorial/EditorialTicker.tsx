"use client";

import { useEffect, useRef } from "react";

interface EditorialTickerProps {
  items?: string[];
}

export function EditorialTicker({
  items = ["ACCESSIBILITY", "FRONTEND", "APPLIED AI", "SYSTEMS", "HUMAN-IN-THE-LOOP"],
}: EditorialTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !innerRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        innerRef.current.style.transform = "none";
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress strictly proportional to scroll progress
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      // Bounded displacement up to -120px
      const targetOffset = -(progress * 120);
      innerRef.current.style.transform = `translateX(${targetOffset}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const content = items.join("   /   ") + "   /   ";

  return (
    <div
      ref={containerRef}
      className="w-full border-y border-border py-4 my-8 sm:my-12 overflow-hidden select-none bg-surface/30 backdrop-blur-sm"
      aria-hidden="true"
    >
      <div
        ref={innerRef}
        className="whitespace-nowrap font-serif text-sm sm:text-base md:text-lg tracking-[0.28em] sm:tracking-[0.35em] text-foreground font-bold uppercase transition-transform ease-out duration-75 motion-reduce:transform-none"
      >
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}
