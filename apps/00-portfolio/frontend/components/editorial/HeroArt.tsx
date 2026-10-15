"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function HeroArt() {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !innerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Bounded subtle parallax: max 20px
      const offset = Math.max(-20, Math.min(20, -rect.top * 0.05));
      innerRef.current.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto select-none"
      aria-hidden="true"
    >
      {/* 
        Art presentation:
        - Transparent collage floats organically in both light and dark modes.
        - Light mode: subtle mix-blend-multiply preserves paper texture over ivory background.
        - Dark mode: mix-blend-normal renders original paper, charcoal, and terracotta tones cleanly.
      */}
      <div
        ref={innerRef}
        className="relative w-full aspect-[819/1024] transition-transform ease-out duration-100 motion-reduce:transform-none"
      >
        <Image
          src="/images/editorial/hero-collage.webp"
          alt=""
          width={819}
          height={1024}
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px"
          priority
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal drop-shadow-sm dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        />
      </div>
    </div>
  );
}
