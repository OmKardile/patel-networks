"use client";

// QuickShopRail — reference top-of-main "SHOP & EXPLORE" strip: a horizontal,
// scroll-snap row of category circles rendered ABOVE the hero. Client component
// so the Surveillance / Networking toggle swaps the chip list in place — the
// categories arrive serialised from the server component as plain
// { id, name, slug, imageUrl, children } objects, so no refetch is needed.
// Both chip sets open with New arrivals and close with Kit Builder (Exclusive)
// + All Products; if BOTH sets hold fewer than 4 chips the strip hides itself.

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryFacet } from "@/server/services/catalog.service";
import { cn } from "@/lib/utils";

type Chip = {
  label: string;
  href: string;
  imageUrl?: string;
  tag?: "New" | "Exclusive";
};

type Range = "surveillance" | "networking";

// The service's child rows expose no imageUrl today, but the DB carries one —
// read it defensively so children join their root's set if the service ever
// widens the type (safe optional-field widening, no runtime assumption).
type ChildFacet = CategoryFacet["children"][number] & { imageUrl?: string | null };

const MAX_RANGE_SLICES = 9; // cap each set at ~9 category slices
const EAGER_CHIPS = 6; // first images on the page — no lazy-load penalty

function rangeCategories(
  categories: CategoryFacet[],
  isSurveillance: boolean,
): { name: string; slug: string; imageUrl: string | null }[] {
  const entries: { name: string; slug: string; imageUrl: string | null }[] = [];
  for (const root of categories) {
    if (root.slug.includes("cctv") !== isSurveillance) continue;
    entries.push({ name: root.name, slug: root.slug, imageUrl: root.imageUrl });
    for (const child of root.children) {
      const imageUrl = (child as ChildFacet).imageUrl ?? null;
      if (imageUrl) entries.push({ name: child.name, slug: child.slug, imageUrl });
    }
  }
  return entries.slice(0, MAX_RANGE_SLICES);
}

export function QuickShopRail({ categories }: { categories: CategoryFacet[] }) {
  const [range, setRange] = useState<Range>("surveillance");

  const sets = useMemo(
    () => ({
      surveillance: rangeCategories(categories, true),
      networking: rangeCategories(categories, false),
    }),
    [categories],
  );

  const buildChips = (
    selected: { name: string; slug: string; imageUrl: string | null }[],
  ): Chip[] => [
    { label: "New arrivals", href: "/new-arrivals", tag: "New" },
    ...selected.map((category) => ({
      label: category.name,
      href: `/products?category=${category.slug}`,
      imageUrl: category.imageUrl ?? undefined,
    })),
    { label: "Kit Builder", href: "/kit-builder", tag: "Exclusive" },
    { label: "All Products", href: "/products" },
  ];

  const surveillanceChips = useMemo(() => buildChips(sets.surveillance), [sets.surveillance]);
  const networkingChips = useMemo(() => buildChips(sets.networking), [sets.networking]);

  if (surveillanceChips.length < 4 && networkingChips.length < 4) return null;

  const chips = range === "surveillance" ? surveillanceChips : networkingChips;

  return (
    <section
      aria-labelledby="quick-shop-heading"
      className="border-b border-black/5 bg-[var(--band-gray)]"
    >
      <div className="container-inner py-5 md:py-7">
        <div className="lg:flex lg:items-start lg:gap-8">
          <div className="w-44 shrink-0">
            {/* label-caps values with a fixed ink colour — the band is
                theme-independent, so the muted token would flip unreadable
                in dark mode */}
            <p
              id="quick-shop-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1c1b1b]/60"
            >
              Shop &amp; explore
            </p>
            <div role="group" aria-label="Choose a range to shop" className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["surveillance", "Surveillance"],
                  ["networking", "Networking"],
                ] as [Range, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={range === key}
                  onClick={() => setRange(key)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold transition-colors",
                    range === key
                      ? "bg-[var(--band-ink-on)] text-white"
                      : "border border-black/15 bg-white text-[#1c1b1b]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 min-w-0 flex-1 lg:mt-0">
            <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 md:gap-5">
              {chips.map((chip, index) => (
                <li key={chip.href + chip.label} className="w-20 shrink-0 snap-start md:w-24">
                  <Link href={chip.href} className="group flex flex-col items-center gap-2">
                    <span className="relative block h-20 w-20 overflow-hidden rounded-full bg-white ring-1 ring-black/10 md:h-24 md:w-24">
                      {chip.imageUrl ? (
                        <Image
                          src={chip.imageUrl}
                          alt={chip.label}
                          fill
                          sizes="96px"
                          loading={index < EAGER_CHIPS ? "eager" : "lazy"}
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="grid h-full w-full place-items-center font-semibold text-black/40"
                        >
                          {chip.label.slice(0, 1)}
                        </span>
                      )}
                      {chip.tag ? (
                        <span
                          className={cn(
                            "absolute left-1/2 top-1 -translate-x-1/2 whitespace-nowrap rounded px-1.5 text-[9px] font-semibold uppercase leading-[14px] text-white",
                            chip.tag === "New" ? "bg-[#1f1f1f]" : "bg-[#b98a2f]",
                          )}
                        >
                          {chip.tag}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-center text-xs font-medium leading-tight text-[#1c1b1b] group-hover:underline">
                      {chip.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
