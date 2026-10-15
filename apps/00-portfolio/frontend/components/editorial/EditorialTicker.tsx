"use client";

import { useEffect, useRef, useState } from "react";

interface EditorialTickerProps {
  items?: string[];
}

export function EditorialTicker({
  items = ["ACCESSIBILITY", "FRONTEND", "APPLIED AI", "SYSTEMS", "HUMAN-IN-THE-LOOP"],
}: EditorialTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress strictly proportional to scroll progress
      const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight + rect.height)));
      // Bounded displacement up to -120px
      const targetOffset = -(progress * 120);
      setOffset(targetOffset);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const content = items.join("   /   ") + "   /   ";

  return (
    <div
      ref={containerRef}
      className="w-full border-y border-border py-3.5 my-8 sm:my-12 overflow-hidden select-none bg-surface/30 backdrop-blur-sm"
      aria-hidden="true"
    >
      <div
        className="whitespace-nowrap font-serif text-xs sm:text-sm md:text-base tracking-[0.25em] sm:tracking-[0.32em] text-foreground font-semibold uppercase transition-transform ease-out duration-75 motion-reduce:transform-none"
        style={{ transform: `translateX(${offset}px)` }}
      >
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}
