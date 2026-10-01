"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ApiProductCard } from "@/lib/serializers";
import { SectionHeader } from "./section-header";
import { RailWithArrows } from "./rail";
import { ProductCard, type ProductCardBadge } from "./product-card";
import { cn } from "@/lib/utils";

// ProductCarousel — two presentations:
// - tone "plain" (default): the original container + SectionHeader + rail,
//   unchanged for non-home callers (PDP related, cart, etc.).
// - tone "sage" | "cream": the reference merch band — rounded color band,
//   header row with circular scroll arrows, fixed-width snap cards, centered
//   View-all pill. Same props either way.

const ITEM_WIDTHS =
  "w-[46%] min-[420px]:w-[42%] sm:w-[34%] md:w-[30%] lg:w-[23.5%] shrink-0 snap-start";

const BAND_ITEM_WIDTHS = "w-[240px] shrink-0 snap-start sm:w-[260px] lg:w-[280px]";

const BAND_BG = {
  sage: "bg-[var(--band-sage)]",
  cream: "bg-[var(--band-cream)]",
} as const;

export function ProductCarousel({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  headingId,
  products,
  wishlistIds,
  className,
  tone = "plain",
  badge = null,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId?: string;
  products: ApiProductCard[];
  wishlistIds?: string[];
  className?: string;
  /** Band look for the homepage rails; "plain" keeps the original layout. */
  tone?: keyof typeof BAND_BG | "plain";
  /** Reference merch pill passed through to every card. */
  badge?: ProductCardBadge | null;
}) {
  if (products.length === 0) return null;
  if (tone !== "plain") {
    return (
      <ProductBand
        eyebrow={eyebrow}
        title={title}
        lede={lede}
        href={href}
        linkLabel={linkLabel}
        headingId={headingId}
        products={products}
        wishlistIds={wishlistIds}
        className={className}
        tone={tone}
        badge={badge}
      />
    );
  }
  const wished = new Set(wishlistIds ?? []);
  return (
    <RailWithArrows
      label={title}
      className={cn("container-inner", className)}
      head={
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          href={href}
          linkLabel={linkLabel}
          headingId={headingId}
        />
      }
      railClassName="mt-6"
    >
      {products.map((p, i) => (
        <li key={p.id} className={ITEM_WIDTHS}>
          <ProductCard
            product={p}
            wishlisted={wished.has(p.id)}
            imagePriority={i === 0}
            badge={badge}
          />
        </li>
      ))}
    </RailWithArrows>
  );
}

// Reference band: rounded color surface, header row with circular scroll
// controls, fixed-width snap rail, centered View-all pill.

function ProductBand({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  headingId,
  products,
  wishlistIds,
  className,
  tone,
  badge,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId?: string;
  products: ApiProductCard[];
  wishlistIds?: string[];
  className?: string;
  tone: keyof typeof BAND_BG;
  badge?: ProductCardBadge | null;
}) {
  const railRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const wished = new Set(wishlistIds ?? []);

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

  const scroll = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className={cn("px-3 md:px-4", className)}>
      <section
        aria-labelledby={headingId}
        aria-label={headingId ? undefined : title}
        className={cn("rounded-2xl", BAND_BG[tone])}
      >
        <div className="container-inner py-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="max-w-2xl">
              {eyebrow ? <p className="label-caps">{eyebrow}</p> : null}
              <h2
                id={headingId}
                className="mt-1 text-xl font-semibold tracking-tight md:text-2xl"
              >
                {title}
              </h2>
              {lede ? <p className="mt-1.5 text-sm text-black/60">{lede}</p> : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scroll(-1)}
                disabled={!canPrev}
                aria-label={`Scroll ${title} backward`}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-[#1c1b1b] transition-opacity disabled:opacity-40"
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                disabled={!canNext}
                aria-label={`Scroll ${title} forward`}
                className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-[#1c1b1b] transition-opacity disabled:opacity-40"
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </div>

          <ul
            ref={railRef}
            onScroll={update}
            className="no-scrollbar mt-6 flex snap-x gap-3 overflow-x-auto scroll-smooth md:gap-4"
          >
            {products.map((p, i) => (
              <li key={p.id} className={BAND_ITEM_WIDTHS}>
                <ProductCard
                  product={p}
                  wishlisted={wished.has(p.id)}
                  imagePriority={i === 0}
                  badge={badge}
                />
              </li>
            ))}
          </ul>

          {href && linkLabel ? (
            <div className="mt-6 flex justify-center">
              <Link
                href={href}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 bg-white px-5 text-sm font-medium text-[#1c1b1b] transition-colors hover:bg-black/5"
              >
                {linkLabel}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
