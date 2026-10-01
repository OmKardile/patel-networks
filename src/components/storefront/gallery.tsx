"use client";

// PDP gallery — one large stage with a thumbnail rail beneath. Arrows and the
// keyboard (←/→, Home/End — handled while the stage holds focus) walk the
// images; hovering the stage eases into a gentle 1.05 zoom. Missing photography
// degrades to a quiet muted placeholder instead of a broken frame.

import { useCallback, useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt: string | null;
}

export function Gallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const active = images[index];
  const count = images.length;

  const step = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setIndex((i) => (i + delta + count) % count);
    },
    [count],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "Home" && count > 0) {
      e.preventDefault();
      setIndex(0);
    } else if (e.key === "End" && count > 0) {
      e.preventDefault();
      setIndex(count - 1);
    }
  }

  return (
    <div>
      {/* Stage — focusable so ←/→/Home/End have a documented focus target */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photographs of ${name}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-whisper"
      >
        {active ? (
          <Image
            key={active.url}
            src={active.url}
            alt={active.alt ?? name}
            fill
            priority
            sizes="(min-width:1024px) 44vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center">
            <div>
              <Camera aria-hidden className="mx-auto h-6 w-6 text-muted-foreground/60" />
              <p className="label-caps mt-3">Product photography</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Photographs for this item are being added. Message the trade desk on WhatsApp for a live photo.
              </p>
            </div>
          </div>
        )}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-whisper backdrop-blur transition-colors hover:bg-card"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 text-foreground shadow-whisper backdrop-blur transition-colors hover:bg-card"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
            <span
              aria-live="polite"
              className="absolute bottom-3 right-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-medium tabular-nums text-foreground shadow-whisper backdrop-blur"
            >
              {index + 1} / {count}
            </span>
          </>
        ) : null}
      </div>

      {/* Thumbnail rail */}
      {count > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              aria-current={i === index}
              aria-label={`View image ${i + 1} of ${count}`}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted transition-all duration-200 hover:scale-[1.03]",
                i === index ? "border-primary opacity-100 ring-1 ring-primary/30" : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
