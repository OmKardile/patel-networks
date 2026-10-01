"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// RailWithArrows — reference carousel behavior: scroll-snap track, 44px side
// arrows that appear only when there is a direction to travel, native touch
// swipe on mobile. `head` is a slot (section header) owned by the caller.

export function RailWithArrows({
  label,
  head,
  children,
  className,
  railClassName,
}: {
  label: string;
  head?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  railClassName?: string;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <section aria-label={label} className={className}>
      {head}
      <div className="relative">
        <ul
          ref={railRef}
          onScroll={update}
          className={cn(
            "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:mx-0 md:px-0",
            railClassName,
          )}
        >
          {children}
        </ul>
        {canPrev ? (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${label} backward`}
            className="absolute -left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border bg-card shadow-whisper transition-colors hover:bg-secondary md:grid"
          >
            <ArrowLeft aria-hidden className="h-5 w-5" />
          </button>
        ) : null}
        {canNext ? (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${label} forward`}
            className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border bg-card shadow-whisper transition-colors hover:bg-secondary md:grid"
          >
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}
