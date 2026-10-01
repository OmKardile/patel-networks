"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategoryFacet } from "@/server/services/catalog.service";

// CategorySection — reference "Shop by Category": centered heading + centered
// audience TABS over a 2/4-up 4:5 image-tile grid. For Patel's catalogue the
// two genuine groupings are Surveillance (cameras, recorders, displays) and
// Networking & Wiring (cables, connectors, optical). Tiles are root categories
// with real imagery; the centered "View all" pill leads to the full catalogue.

const SURVEILLANCE_SLUGS = new Set(["cctv-surveillance", "displays-screens"]);
const NETWORKING_SLUGS = new Set([
  "cables-wiring",
  "connectors-accessories",
  "media-converters-optical",
]);

function tileCaption(category: CategoryFacet) {
  return category.children.length > 0
    ? `${category.children.length} ${category.children.length === 1 ? "subcategory" : "subcategories"}`
    : `Explore ${category.name}`;
}

export function CategorySection({ categories }: { categories: CategoryFacet[] }) {
  if (!categories.length) return null;
  const headingId = "shop-by-category-heading";

  const surveillance = categories.filter((category) => SURVEILLANCE_SLUGS.has(category.slug));
  const networking = categories.filter((category) => NETWORKING_SLUGS.has(category.slug));
  const rest = categories.filter(
    (category) => !SURVEILLANCE_SLUGS.has(category.slug) && !NETWORKING_SLUGS.has(category.slug),
  );
  if (rest.length) {
    surveillance.push(...rest);
  }

  const groups = [
    { id: "surveillance", label: "Surveillance", items: surveillance },
    { id: "networking", label: "Networking & Wiring", items: networking },
  ].filter((group) => group.items.length > 0);

  if (groups.length < 2) return null;

  return <CategoryTabs headingId={headingId} groups={groups} />;
}

function CategoryTabs({
  headingId,
  groups,
}: {
  headingId: string;
  groups: { id: string; label: string; items: CategoryFacet[] }[];
}) {
  const [active, setActive] = useState(groups[0]?.id ?? "");
  const current = groups.find((group) => group.id === active) ?? groups[0];

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <h2
          id={headingId}
          className="text-center text-xl font-semibold tracking-tight md:text-2xl"
        >
          Shop by category
        </h2>

        <div
          role="tablist"
          aria-label="Category groups"
          className="mt-5 flex flex-wrap justify-center gap-2"
        >
          {groups.map((group) => {
            const selected = group.id === current?.id;
            return (
              <button
                key={group.id}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`category-panel-${group.id}`}
                id={`category-tab-${group.id}`}
                onClick={() => setActive(group.id)}
                className={cn(
                  "inline-flex h-10 items-center rounded-full px-6 text-sm font-semibold transition-colors",
                  selected
                    ? "bg-[var(--band-ink-on)] text-white"
                    : "border border-black/15 bg-white text-[#1c1b1b] hover:border-black/30",
                )}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {groups.map((group) => (
          <div
            key={group.id}
            role="tabpanel"
            id={`category-panel-${group.id}`}
            aria-labelledby={`category-tab-${group.id}`}
            hidden={group.id !== current?.id}
            className="mt-6 md:mt-8"
          >
            {/* Adaptive density: 4+ tiles run the reference 4-up grid; sparse
                tabs (2-3 real roots) get a centered, narrower grid so the row
                never finishes half-empty. */}
            <ul
              className={cn(
                "grid grid-cols-2 gap-3 md:gap-4",
                group.items.length >= 4 && "lg:grid-cols-4",
                group.items.length === 3 &&
                  "mx-auto max-w-3xl lg:max-w-4xl lg:grid-cols-3",
                group.items.length <= 2 && "mx-auto max-w-xl md:max-w-2xl",
              )}
            >
              {group.items.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-[var(--band-ink)]"
                  >
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="(min-width:1024px) 25vw, 50vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute inset-0 grid place-items-center text-5xl font-black text-white/15"
                      >
                        {category.name.slice(0, 1)}
                      </span>
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent md:h-32"
                    />
                    <span className="absolute left-3 right-3 top-3 block">
                      <span className="flex items-center gap-1 text-base font-bold uppercase tracking-wide text-white md:text-xl">
                        {category.name}
                        <ChevronRight aria-hidden className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
                      </span>
                      <span className="mt-0.5 block text-[11px] text-white/85 md:text-xs">
                        {tileCaption(category)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 bg-white px-5 text-sm font-medium text-[#1c1b1b] transition-colors hover:border-black/30"
          >
            View all
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
