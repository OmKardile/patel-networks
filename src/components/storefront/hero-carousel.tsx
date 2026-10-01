"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ReceiptText, ShieldCheck, Truck } from "lucide-react";
import { STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// HeroCarousel — reference full-bleed campaign carousel: DB-driven slides,
// side arrows + "Go to item N" dots, ~6s auto-advance (pauses on hover/focus
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
      className="relative w-full"
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
      <div className="relative h-[320px] w-full overflow-hidden bg-secondary sm:h-[420px] lg:h-[520px]">
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
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent"
            />

            {/* Slide copy — bottom-left ink panel on the scrim only */}
            <div className="absolute inset-x-4 bottom-16 sm:inset-x-6 sm:bottom-16 lg:inset-x-10">
              <div className="max-w-xl rounded-lg bg-card/85 p-5 text-card-foreground shadow-whisper sm:p-6">
                <h2 className="text-lg font-semibold leading-snug sm:text-xl">{slide.title}</h2>
                {slide.subtitle ? (
                  <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{slide.subtitle}</p>
                ) : null}
                <Link
                  href={slide.linkUrl || "/products"}
                  tabIndex={i === active ? undefined : -1}
                  className={cn(buttonVariants({ size: "lg" }), "mt-4")}
                >
                  Shop now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <>
          {/* Arrows */}
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-card-foreground shadow-whisper transition-colors hover:bg-card sm:left-3"
          >
            <ArrowLeft aria-hidden className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className="absolute right-1 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-card-foreground shadow-whisper transition-colors hover:bg-card sm:right-3"
          >
            <ArrowRight aria-hidden className="h-5 w-5" />
          </button>

          {/* "Go to item N" dots */}
          <div className="absolute inset-x-0 bottom-1 z-10 flex justify-center">
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
                    "h-2.5 w-2.5 rounded-full transition-colors duration-200",
                    i === active ? "bg-white" : "bg-white/50 hover:bg-white/80",
                  )}
                />
              </button>
            ))}
          </div>
        </>
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
        <Link href="/products" className={buttonVariants({ size: "lg" })}>
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
