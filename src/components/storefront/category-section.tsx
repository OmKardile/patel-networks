"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";
import type { CategoryFacet } from "@/server/services/catalog.service";

// CategorySection — reference "Shop by Category": audience TABS over a tile
// grid. For Patel's catalogue the two genuine groupings are Surveillance
// (cameras, recorders, displays) and Networking & Wiring (cables, connectors,
// optical). Tiles are root categories with real imagery; "View all" leads to
// the full catalogue.

const SURVEILLANCE_SLUGS = new Set(["cctv-surveillance", "displays-screens"]);
const NETWORKING_SLUGS = new Set([
  "cables-wiring",
  "connectors-accessories",
  "media-converters-optical",
]);

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
        <SectionHeader
          eyebrow="Find the right gear"
          title="Shop by category"
          href="/products"
          linkLabel="View all"
          headingId={headingId}
        />

        <div
          role="tablist"
          aria-label="Category groups"
          className="mt-6 inline-flex items-center gap-1 rounded-full border bg-card p-1"
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
                  "inline-flex min-h-[40px] items-center rounded-full px-4 text-sm font-medium transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
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
            className="mt-8"
          >
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {group.items.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="group flex h-full flex-col items-center gap-3 text-center"
                  >
                    <span className="relative block aspect-square w-full overflow-hidden rounded-full border bg-secondary">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          fill
                          sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 46vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="grid h-full w-full place-items-center text-2xl font-semibold text-muted-foreground"
                        >
                          {category.name.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium leading-snug group-hover:underline">
                        {category.name}
                      </span>
                      {category.children.length > 0 ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {category.children.length}{" "}
                          {category.children.length === 1 ? "subcategory" : "subcategories"}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
