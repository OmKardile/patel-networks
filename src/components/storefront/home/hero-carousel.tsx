"use client";

// Hero carousel — blueprint §1.2 slot 1. Slides come from the server component
// (db.banner, placement=HOME_HERO) as plain props. Reference interaction: prev/
// next arrows + dot pagination ("Go to item N"), ~6s auto-advance that pauses
// on hover/focus, 300ms crossfade (no bounce, no scale). With zero active
// banners it renders the EXISTING Task-48 ivory hero, markup preserved.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight, PackageCheck, Receipt, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
}

const AUTO_ADVANCE_MS = 6000;

const COMMITMENTS = [
  { icon: BadgeCheck, title: "100% genuine stock", note: "Brand-authorized, serial-tracked" },
  { icon: Truck, title: "Same-day dispatch", note: "Orders confirmed before 4:00 PM IST" },
  { icon: Receipt, title: "GST tax invoices", note: "Input-credit ready, every order" },
  { icon: PackageCheck, title: "7-day DOA cover", note: "Pan-India delivery from Surat" },
];

/** The Task-48 ivory hero — preserved verbatim as the zero-banner fallback. */
function IvoryHeroFallback() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero-ivory">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-20">
        <div>
          <p className="label-caps">Authorized distribution · Surat, Gujarat</p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Surveillance &amp; networking hardware, specified right the first time.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Genuine Hikvision, Dahua, CP Plus and D-Link equipment for homes, installers and system integrators —
            with SKU-level stock you can actually rely on, GST tax invoices and pan-India dispatch.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link href="/products">
                Shop the catalog <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
              <Link href="/kit-builder">Build a CCTV kit</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            10 authorized brands · B2B GSTIN billing · Same-day dispatch before 4 PM IST
          </p>
        </div>

        {/* commitment panel — the store's promises, immediately visible */}
        <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
          {COMMITMENTS.map(({ icon: Icon, title, note }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-whisper">
              <Icon className="h-5 w-5 text-success" aria-hidden />
              <p className="mt-3 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const hasSlides = slides.length > 1;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!hasSlides || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [hasSlides, paused, index, slides.length]);

  if (slides.length === 0) return <IvoryHeroFallback />;
  if (!hasSlides) return <SingleSlide slide={slides[0]} />;

  const goTo = (n: number) => setIndex(((n % slides.length) + slides.length) % slides.length);
  const arrowClass =
    "press flex h-11 w-11 items-center justify-center rounded-full bg-card/90 text-foreground shadow-lift transition-all duration-200 hover:bg-card";

  return (
    <section aria-label="Featured promotions" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured promotions"
          className="relative h-[380px] overflow-hidden rounded-xl border border-border shadow-whisper sm:h-[460px] lg:h-[520px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              aria-hidden={i !== index}
              inert={i !== index ? true : undefined}
              className={cn(
                "absolute inset-0 transition-opacity duration-300 ease-out",
                i === index ? "opacity-100" : "pointer-events-none opacity-0"
              )}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={i === 0}
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
              {/* legibility scrim — bottom-left copy over imagery */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                <div className="max-w-xl text-background">
                  <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="mt-2 text-sm leading-relaxed text-background/85 sm:text-[15px]">{slide.subtitle}</p>
                  )}
                  {slide.linkUrl && (
                    <Button
                      asChild
                      size="lg"
                      className="mt-5 h-11 rounded-full px-6 text-sm font-medium sm:h-12 sm:px-7 sm:text-base"
                    >
                      <Link href={slide.linkUrl}>
                        Shop now <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* arrows — 44px targets, never cover the copy */}
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className={cn(arrowClass, "absolute left-3 top-1/2 -translate-y-1/2 sm:left-4")}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className={cn(arrowClass, "absolute right-3 top-1/2 -translate-y-1/2 sm:right-4")}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* dot pagination — 36px+ hit areas keep the touch target honest */}
        <div className="mt-4 flex items-center justify-center gap-1" aria-label="Choose slide">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-current={i === index ? "true" : undefined}
              aria-label={`Go to item ${i + 1}`}
              onClick={() => goTo(i)}
              className="flex h-9 w-9 items-center justify-center"
            >
              <span
                aria-hidden
                className={cn(
                  "block rounded-full transition-all duration-200",
                  i === index ? "h-2.5 w-6 bg-foreground" : "h-2.5 w-2.5 bg-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Single active banner — same visual frame, no controls. */
function SingleSlide({ slide }: { slide: HeroSlide }) {
  return (
    <section aria-label="Featured promotion" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="relative h-[380px] overflow-hidden rounded-xl border border-border shadow-whisper sm:h-[460px] lg:h-[520px]">
          <Image src={slide.imageUrl} alt={slide.title} fill priority unoptimized sizes="100vw" className="object-cover" />
          <div
            className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <div className="max-w-xl text-background">
              <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-2 text-sm leading-relaxed text-background/85 sm:text-[15px]">{slide.subtitle}</p>
              )}
              {slide.linkUrl && (
                <Button
                  asChild
                  size="lg"
                  className="mt-5 h-11 rounded-full px-6 text-sm font-medium sm:h-12 sm:px-7 sm:text-base"
                >
                  <Link href={slide.linkUrl}>
                    Shop now <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
