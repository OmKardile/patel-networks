"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ReceiptText, ShieldCheck, Truck } from "lucide-react";
import { STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";

// HeroCarousel — reference rounded campaign carousel: DB-driven slides with
// free uppercase copy over a left-to-right scrim (no white card), arrows +
// dots grouped at the BOTTOM CENTER, ~6s auto-advance (pauses on hover/focus
// and under prefers-reduced-motion), 300ms opacity crossfade. Zero banners →
// genuine ivory hero fallback built from constants (NO fake countdown).

export type HeroSlide = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
};

const AUTO_ADVANCE_MS = 6000;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const reducedRef = useRef(false);

  // Track prefers-reduced-motion without re-rendering (read at tick time).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reducedRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current && !reducedRef.current) {
        setActive((current) => (current + 1) % count);
      }
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return <HeroFallback />;

  return (
    <section
      aria-label="Featured promotions"
      className="relative w-full px-3 pt-2 md:px-4"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocus={() => {
        pausedRef.current = true;
      }}
      onBlur={() => {
        pausedRef.current = false;
      }}
    >
      <div className="relative h-[300px] w-full overflow-hidden rounded-2xl bg-secondary sm:h-[420px] lg:h-[540px]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            aria-hidden={i !== active}
            className={cn(
              "absolute inset-0 transition-opacity duration-300 ease-out",
              i === active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />

            {/* Scrims — left-to-right reading gradient + bottom anchor */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent"
            />

            {/* Slide copy — free uppercase text, left-center on the scrim */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <div className="max-w-xl px-6 pb-12 md:px-12 md:pb-6">
                <h2 className="text-2xl font-extrabold uppercase leading-tight text-white [text-shadow:0_2px_12px_rgb(0_0_0/0.45)] md:text-4xl lg:text-5xl">
                  {slide.title}
                </h2>
                {slide.subtitle ? (
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/85 md:text-sm">
                    {slide.subtitle}
                  </p>
                ) : null}
                <Link
                  href={slide.linkUrl || "/products"}
                  tabIndex={i === active ? undefined : -1}
                  className="mt-6 inline-flex h-11 items-center rounded-md bg-[#f3e9d2] px-6 text-sm font-bold uppercase tracking-wide text-[#1c1b1b] transition-colors hover:bg-[#efe1bf]"
                >
                  Shop now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-3">
          {/* Previous slide */}
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-[#1c1b1b] shadow transition-colors hover:bg-white/90 after:absolute after:-inset-0.5 after:rounded-full after:content-['']"
          >
            <ChevronLeft aria-hidden className="h-5 w-5" />
          </button>

          {/* "Go to item N" dot indicator (44px padded hit areas) */}
          <div className="flex items-center">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to item ${i + 1}`}
                aria-current={i === active ? "true" : undefined}
                className="grid min-h-[44px] min-w-[44px] place-items-center"
              >
                <span
                  aria-hidden
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === active ? "h-1.5 w-6 bg-white" : "h-1.5 w-1.5 bg-white/60",
                  )}
                />
              </button>
            ))}
          </div>

          {/* Next slide */}
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-[#1c1b1b] shadow transition-colors hover:bg-white/90 after:absolute after:-inset-0.5 after:rounded-full after:content-['']"
          >
            <ChevronRight aria-hidden className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </section>
  );
}

// Zero-banner fallback — constants only, no fabricated campaign.
function HeroFallback() {
  return (
    <section aria-labelledby="hero-fallback-heading" className="bg-hero-ivory">
      <div className="container-inner flex flex-col items-start gap-6 py-16 md:py-24">
        <p className="label-caps">{STORE.tagline}</p>
        <h1
          id="hero-fallback-heading"
          className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl"
        >
          Surveillance &amp; networking hardware, specified right the first time.
        </h1>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-md bg-[#1c1b1b] px-6 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-black"
        >
          Shop all products
        </Link>
        <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <li className="inline-flex items-center gap-2">
            <ReceiptText aria-hidden className="h-4 w-4" />
            GST invoice on every order
          </li>
          <li className="inline-flex items-center gap-2">
            <ShieldCheck aria-hidden className="h-4 w-4" />
            Brand warranty on hardware
          </li>
          <li className="inline-flex items-center gap-2">
            <Truck aria-hidden className="h-4 w-4" />
            Same-day dispatch from {STORE.city} before {STORE.dispatchCutoff}
          </li>
        </ul>
      </div>
    </section>
  );
}
