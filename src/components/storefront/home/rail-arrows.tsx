"use client";

// Scroll-rail shell for the homepage carousels — owns the <ul> ref, the
// can-prev/can-next state and the 44px arrow pair. The `head` slot (a rendered
// SectionHead) sits in the same control row, arrows right-aligned. No new
// client libs — plain scroll APIs, smooth page-scrolls, snap rails.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RailWithArrowsProps {
  /** Accessible name for the scrollable list. */
  label: string;
  /** Rendered section head — placed left of the arrow pair. */
  head: ReactNode;
  children: ReactNode;
  /** Extra classes for the <ul> (per-rail tweaks). */
  railClassName?: string;
}

export function RailWithArrows({ label, head, children, railClassName }: RailWithArrowsProps) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      setCanPrev(rail.scrollLeft > 4);
      setCanNext(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 4);
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByPage = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.max(rail.clientWidth * 0.8, 280), behavior: "smooth" });
  };

  const buttonClass =
    "press flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-whisper transition-all duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        {head}
        <div className="hidden gap-2 sm:flex" role="group" aria-label="Scroll controls">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canPrev}
            aria-label="Scroll back"
            className={buttonClass}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canNext}
            aria-label="Scroll forward"
            className={buttonClass}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
      <ul
        ref={railRef}
        aria-label={label}
        className={cn("no-scrollbar -mx-4 mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6", railClassName)}
      >
        {children}
      </ul>
    </div>
  );
}
