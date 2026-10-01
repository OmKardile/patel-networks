"use client";

// Catalog facets — category tree, brands, price, resolution, availability, rating.
// Plain links + one GET form updating the /products query string; the server
// re-renders. No client fetching, no local filter state beyond the price inputs.
// Any facet change resets ?page= (page is never carried into a facet href).

import { useRef, useState } from "react";
import Link from "next/link";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CategoryFacet } from "@/server/services/catalog.service";

export interface CatalogActiveParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  resolution?: string;
  availability?: string;
  minRating?: string;
  sort?: string;
}

export interface BrandFacet {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

const RESOLUTIONS = ["2MP", "3MP", "4MP", "5MP", "8MP"] as const;

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4★ & up" },
  { value: "3", label: "3★ & up" },
] as const;

/** Query string with `changes` merged in; a null change removes the key. Page resets. */
function facetHref(active: CatalogActiveParams, changes: Record<string, string | null>): string {
  const sp = new URLSearchParams();
  const keys = new Set([...Object.keys(active), ...Object.keys(changes)]);
  for (const k of keys) {
    if (k === "page") continue;
    const next = k in changes ? changes[k] : (active[k as keyof CatalogActiveParams] ?? null);
    if (next) sp.set(k, next);
  }
  const qs = sp.toString();
  return qs ? `/products?${qs}` : "/products";
}

/** Toggle one token inside a comma-separated facet (brand, resolution). */
function csvHref(active: CatalogActiveParams, key: keyof CatalogActiveParams, token: string): string {
  const current = new Set((active[key] ?? "").split(",").map((t) => t.trim()).filter(Boolean));
  if (current.has(token)) current.delete(token);
  else current.add(token);
  return facetHref(active, { [key]: current.size ? [...current].join(",") : null });
}

const PILL =
  "inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-full border px-4 text-[13px] transition-colors duration-200";
const PILL_ON = "border-primary bg-primary text-primary-foreground";
const PILL_OFF = "border-border bg-card text-foreground hover:border-foreground/40";

export function FiltersPanel({ tree, brands, active }: { tree: CategoryFacet[]; brands: BrandFacet[]; active: CatalogActiveParams }) {
  const selectedBrands = new Set((active.brand ?? "").split(",").map((t) => t.trim()).filter(Boolean));
  const selectedResolutions = new Set((active.resolution ?? "").split(",").map((t) => t.trim()).filter(Boolean));
  const inStockOnly = active.availability === "in-stock";
  const hasFacets = Boolean(
    active.category || active.brand || active.minPrice || active.maxPrice || active.resolution || active.availability || active.minRating,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="label-caps">Refine</p>
        {hasFacets ? (
          <Link
            href={facetHref(active, {
              category: null,
              brand: null,
              minPrice: null,
              maxPrice: null,
              resolution: null,
              availability: null,
              minRating: null,
            })}
            className="inline-flex min-h-[44px] items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Clear all
          </Link>
        ) : null}
      </div>

      {/* Category — single slug, radio-style links; children nest under their root */}
      <section aria-label="Category filter" className="space-y-2">
        <p className="label-caps">Category</p>
        <Link href={facetHref(active, { category: null })} aria-current={!active.category ? "true" : undefined} className={cn(PILL, !active.category ? PILL_ON : PILL_OFF)}>
          All categories
        </Link>
        {tree.map((root) => (
          <div key={root.id} className="space-y-2">
            <Link
              href={facetHref(active, { category: root.slug })}
              aria-current={active.category === root.slug ? "true" : undefined}
              className={cn(PILL, active.category === root.slug ? PILL_ON : PILL_OFF)}
            >
              {root.name}
            </Link>
            {root.children.length > 0 ? (
              <div className="ml-4 space-y-1.5 border-l border-border pl-3">
                {root.children.map((child) => (
                  <Link
                    key={child.id}
                    href={facetHref(active, { category: child.slug })}
                    aria-current={active.category === child.slug ? "true" : undefined}
                    className={cn(
                      "inline-flex min-h-[44px] w-full items-center rounded-full border px-3.5 text-[12.5px] transition-colors duration-200",
                      active.category === child.slug ? PILL_ON : "border-transparent bg-card font-normal text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    <span className="truncate">{child.name}</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </section>

      {/* Brand — multi-select pills with live product counts (CSV ?brand=) */}
      <section aria-label="Brand filter" className="space-y-2 border-t border-border pt-5">
        <p className="label-caps">Brand</p>
        <div className="thin-scrollbar max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {brands.map((brand) => {
            const on = selectedBrands.has(brand.slug);
            return (
              <Link
                key={brand.id}
                href={csvHref(active, "brand", brand.slug)}
                aria-pressed={on}
                className={cn(PILL, on ? PILL_ON : PILL_OFF)}
              >
                <span className="truncate">{brand.name}</span>
                <span className={cn("text-[11px] tabular-nums", on ? "text-primary-foreground/70" : "text-muted-foreground")}>{brand.productCount}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Price — rupee inputs committed on Apply / Enter (GET form, page resets) */}
      <section aria-label="Price filter" className="space-y-3 border-t border-border pt-5">
        <p className="label-caps">Price (₹)</p>
        <PriceForm active={active} />
      </section>

      {/* Resolution — chip toggles (CSV ?resolution=) */}
      <section aria-label="Resolution filter" className="space-y-2 border-t border-border pt-5">
        <p className="label-caps">Resolution</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Resolution options">
          {RESOLUTIONS.map((res) => {
            const on = selectedResolutions.has(res);
            return (
              <Link
                key={res}
                href={csvHref(active, "resolution", res)}
                aria-pressed={on}
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-full border px-4 text-xs font-medium transition-colors duration-200",
                  on ? PILL_ON : PILL_OFF,
                )}
              >
                {res}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Availability — in-stock switch as a plain link */}
      <section aria-label="Availability filter" className="border-t border-border pt-5">
        <Link
          href={facetHref(active, { availability: inStockOnly ? null : "in-stock" })}
          role="switch"
          aria-checked={inStockOnly}
          className="flex min-h-[44px] items-center justify-between gap-3"
        >
          <span className="block">
            <span className="label-caps block">Availability</span>
            <span className="text-[13px] text-muted-foreground">In stock only</span>
          </span>
          <span
            aria-hidden
            className={cn(
              "inline-flex h-[24px] w-[44px] shrink-0 items-center rounded-full border border-transparent p-0.5 transition-colors duration-200",
              inStockOnly ? "bg-primary" : "bg-input",
            )}
          >
            <span
              className={cn(
                "block h-5 w-5 rounded-full bg-background shadow-whisper transition-transform duration-200",
                inStockOnly && "translate-x-5",
              )}
            />
          </span>
        </Link>
      </section>

      {/* Customer rating — minimum star threshold */}
      <section aria-label="Rating filter" className="space-y-2 border-t border-border pt-5">
        <p className="label-caps">Customer rating</p>
        {RATING_OPTIONS.map((opt) => {
          const on = (active.minRating ?? "") === opt.value;
          return (
            <Link
              key={opt.value || "any"}
              href={facetHref(active, { minRating: opt.value || null })}
              aria-current={on ? "true" : undefined}
              className={cn(PILL, on ? PILL_ON : "border-transparent bg-card font-normal text-foreground hover:border-border")}
            >
              {opt.label}
            </Link>
          );
        })}
      </section>
    </div>
  );
}

/** Rupee price range as a GET form — hidden inputs carry every other facet. */
function PriceForm({ active }: { active: CatalogActiveParams }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [minPrice, setMinPrice] = useState(active.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(active.maxPrice ?? "");

  return (
    <form
      ref={formRef}
      action="/products"
      method="get"
      onSubmit={() => {
        // Empty inputs stay out of the URL entirely.
        for (const input of formRef.current?.querySelectorAll<HTMLInputElement>("input[data-optional]") ?? []) {
          if (input.value.trim() === "") input.disabled = true;
        }
      }}
      className="space-y-2.5"
    >
      {!active.q ? null : <input type="hidden" name="q" value={active.q} />}
      {!active.category ? null : <input type="hidden" name="category" value={active.category} />}
      {!active.brand ? null : <input type="hidden" name="brand" value={active.brand} />}
      {!active.resolution ? null : <input type="hidden" name="resolution" value={active.resolution} />}
      {active.availability !== "in-stock" ? null : <input type="hidden" name="availability" value="in-stock" />}
      {!active.minRating ? null : <input type="hidden" name="minRating" value={active.minRating} />}
      {!active.sort || active.sort === "popular" ? null : <input type="hidden" name="sort" value={active.sort} />}

      <div className="flex items-center gap-2">
        <Input
          type="number"
          name="minPrice"
          data-optional
          inputMode="numeric"
          min={0}
          placeholder="Min"
          aria-label="Minimum price in rupees"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="h-11 rounded-full bg-card text-[13px]"
        />
        <span className="text-xs text-muted-foreground" aria-hidden>
          –
        </span>
        <Input
          type="number"
          name="maxPrice"
          data-optional
          inputMode="numeric"
          min={0}
          placeholder="Max"
          aria-label="Maximum price in rupees"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="h-11 rounded-full bg-card text-[13px]"
        />
      </div>
      <Button type="submit" variant="outline" size="sm" className="min-h-[44px] px-5 text-xs">
        Apply price
      </Button>
    </form>
  );
}

/** Mobile filter entry — left Sheet with the same panel. */
export function MobileFilters({
  tree,
  brands,
  active,
  resultCount,
}: {
  tree: CategoryFacet[];
  brands: BrandFacet[];
  active: CatalogActiveParams;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="min-h-[44px] gap-2 text-xs" aria-label="Open filters">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] gap-0 overflow-y-auto p-6 sm:max-w-[320px]">
        <SheetHeader className="p-0 pb-4 text-left">
          <SheetTitle className="text-lg font-semibold tracking-tight">Filters</SheetTitle>
        </SheetHeader>
        <FiltersPanel tree={tree} brands={brands} active={active} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-8 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Show {resultCount} result{resultCount === 1 ? "" : "s"}
        </button>
      </SheetContent>
    </Sheet>
  );
}
