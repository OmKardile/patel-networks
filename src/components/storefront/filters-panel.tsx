"use client";

// Catalog facets — category tree, brands, price, resolution, availability, rating.
// Pure URL-driven navigation: every toggle pushes a new /products query string and
// the server re-renders. No client fetching, no local filter state beyond the
// price inputs (which commit on Apply/Enter like a search box).

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
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

/** Merge param overrides into a query string; a null change removes the key. Page resets. */
function buildQuery(active: CatalogActiveParams, changes: Record<string, string | null>): string {
  const sp = new URLSearchParams();
  const keys = new Set([...Object.keys(active), ...Object.keys(changes)]);
  for (const k of keys) {
    if (k === "page") continue;
    const next = k in changes ? changes[k] : (active[k as keyof CatalogActiveParams] ?? null);
    if (next) sp.set(k, next);
  }
  return sp.toString();
}

function useFacetNavigate() {
  const router = useRouter();
  return useCallback(
    (active: CatalogActiveParams, changes: Record<string, string | null>) => {
      const qs = buildQuery(active, changes);
      router.push(qs ? `/products?${qs}` : "/products");
    },
    [router]
  );
}

/** One toggle row rendered as a rounded pill; selection state comes from the URL. */
function FacetPill({
  selected,
  onClick,
  pressed,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  pressed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "inline-flex w-full items-center justify-between gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-colors duration-200",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:border-foreground/40"
      )}
    >
      {children}
    </button>
  );
}

interface FiltersPanelProps {
  tree: CategoryFacet[];
  brands: BrandFacet[];
  active: CatalogActiveParams;
}

export function FiltersPanel({ tree, brands, active }: FiltersPanelProps) {
  const navigate = useFacetNavigate();
  const [minPrice, setMinPrice] = useState(active.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(active.maxPrice ?? "");
  const [synced, setSynced] = useState({ min: active.minPrice, max: active.maxPrice });

  // Adjust local input state when the URL params change (React's render-time state adjustment).
  if (synced.min !== active.minPrice || synced.max !== active.maxPrice) {
    setSynced({ min: active.minPrice, max: active.maxPrice });
    setMinPrice(active.minPrice ?? "");
    setMaxPrice(active.maxPrice ?? "");
  }

  const selectedBrands = new Set((active.brand ?? "").split(",").filter(Boolean));
  const selectedResolutions = new Set((active.resolution ?? "").split(",").filter(Boolean));
  const activeCategory = active.category ?? "";

  function applyPrice() {
    const min = minPrice.trim();
    const max = maxPrice.trim();
    const minNum = min === "" ? null : Number.isFinite(Number(min)) && Number(min) >= 0 ? min : null;
    const maxNum = max === "" ? null : Number.isFinite(Number(max)) && Number(max) >= 0 ? max : null;
    navigate(active, { minPrice: minNum, maxPrice: maxNum });
  }

  function toggleBrand(slug: string) {
    const next = new Set(selectedBrands);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    navigate(active, { brand: next.size ? [...next].join(",") : null });
  }

  function toggleResolution(value: string) {
    const next = new Set(selectedResolutions);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    navigate(active, { resolution: next.size ? [...next].join(",") : null });
  }

  const hasFacets = Boolean(
    active.category || active.brand || active.minPrice || active.maxPrice || active.resolution || active.availability || active.minRating
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="label-caps">Refine</p>
        {hasFacets && (
          <button
            type="button"
            onClick={() =>
              navigate(active, {
                category: null,
                brand: null,
                minPrice: null,
                maxPrice: null,
                resolution: null,
                availability: null,
                minRating: null,
              })
            }
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear all filters"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Clear all
          </button>
        )}
      </div>

      {/* Category — one flat radio group; children indent under their root */}
      <section aria-label="Category filter" className="space-y-2.5">
        <p className="label-caps">Category</p>
        <RadioGroup value={activeCategory} onValueChange={(v) => navigate(active, { category: v || null })} className="space-y-1.5">
          <Label
            htmlFor="cat-all"
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors",
              activeCategory === "" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card font-normal text-foreground hover:border-foreground/40"
            )}
          >
            <RadioGroupItem value="" id="cat-all" className="sr-only" />
            All categories
          </Label>
          {tree.map((root) => (
            <div key={root.id} className="space-y-1.5">
              <Label
                htmlFor={`cat-${root.slug}`}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors",
                  activeCategory === root.slug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card font-medium text-foreground hover:border-foreground/40"
                )}
              >
                <RadioGroupItem value={root.slug} id={`cat-${root.slug}`} className="sr-only" />
                {root.name}
              </Label>
              {root.children.length > 0 && (
                <div className="ml-4 space-y-1.5 border-l border-border pl-3">
                  {root.children.map((child) => (
                    <Label
                      key={child.id}
                      htmlFor={`cat-${child.slug}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                        activeCategory === child.slug
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-transparent bg-card font-normal text-muted-foreground hover:border-border hover:text-foreground"
                      )}
                    >
                      <RadioGroupItem value={child.slug} id={`cat-${child.slug}`} className="sr-only" />
                      {child.name}
                    </Label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </RadioGroup>
      </section>

      {/* Brand — multi-select pills with live product counts */}
      <section aria-label="Brand filter" className="space-y-2.5 border-t border-border pt-5">
        <p className="label-caps">Brand</p>
        <div className="thin-scrollbar max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <FacetPill key={brand.id} selected={selectedBrands.has(brand.slug)} onClick={() => toggleBrand(brand.slug)} pressed={selectedBrands.has(brand.slug)}>
              <span className="truncate">{brand.name}</span>
              <span className={cn("text-[11px] tabular-nums", selectedBrands.has(brand.slug) ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {brand.productCount}
              </span>
            </FacetPill>
          ))}
        </div>
      </section>

      {/* Price range — committed on Apply or Enter */}
      <section aria-label="Price filter" className="space-y-3 border-t border-border pt-5">
        <p className="label-caps">Price (₹)</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            aria-label="Minimum price in rupees"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="h-9 rounded-full bg-card text-[13px]"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            aria-label="Maximum price in rupees"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            className="h-9 rounded-full bg-card text-[13px]"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={applyPrice} className="h-8 px-4 text-xs">
          Apply price
        </Button>
      </section>

      {/* Resolution — chip toggles */}
      <section aria-label="Resolution filter" className="space-y-2.5 border-t border-border pt-5">
        <p className="label-caps">Resolution</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Resolution options">
          {RESOLUTIONS.map((res) => {
            const selected = selectedResolutions.has(res);
            return (
              <button
                key={res}
                type="button"
                onClick={() => toggleResolution(res)}
                aria-pressed={selected}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-200",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-foreground/40"
                )}
              >
                {res}
              </button>
            );
          })}
        </div>
      </section>

      {/* Availability — single switch */}
      <section aria-label="Availability filter" className="flex items-center justify-between border-t border-border pt-5">
        <Label htmlFor="availability-toggle" className="cursor-pointer">
          <span className="label-caps block">Availability</span>
          <span className="text-[13px] text-muted-foreground">In stock only</span>
        </Label>
        <Switch
          id="availability-toggle"
          checked={active.availability === "in-stock"}
          onCheckedChange={(checked) => navigate(active, { availability: checked ? "in-stock" : null })}
        />
      </section>

      {/* Customer rating — minimum star threshold */}
      <section aria-label="Rating filter" className="space-y-2.5 border-t border-border pt-5">
        <p className="label-caps">Customer rating</p>
        <RadioGroup value={active.minRating ?? ""} onValueChange={(v) => navigate(active, { minRating: v || null })} className="space-y-1.5">
          {RATING_OPTIONS.map((opt) => (
            <Label
              key={opt.value || "any"}
              htmlFor={`rating-${opt.value || "any"}`}
              className={cn(
                "flex cursor-pointer items-center rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                (active.minRating ?? "") === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent bg-card font-normal text-foreground hover:border-border"
              )}
            >
              <RadioGroupItem value={opt.value} id={`rating-${opt.value || "any"}`} className="sr-only" />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      </section>
    </div>
  );
}

/** Mobile filter entry — Sheet drawer with the same panel. */
export function MobileFilters({ tree, brands, active, resultCount }: FiltersPanelProps & { resultCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 text-xs" aria-label="Open filters">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[320px] flex-col gap-0 overflow-y-auto p-6 sm:max-w-[320px]">
        <SheetHeader className="p-0 pb-4 text-left">
          <SheetTitle className="font-display text-lg">Filters</SheetTitle>
        </SheetHeader>
        <FiltersPanel tree={tree} brands={brands} active={active} />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Show {resultCount} result{resultCount === 1 ? "" : "s"}
        </button>
      </SheetContent>
    </Sheet>
  );
}

/** One removable active-filter chip (server-rendered href handled by parent). */
export function ActiveFilterChip({ label, removeLabel, href }: { label: string; removeLabel: string; href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-whisper transition-colors hover:border-foreground/40"
      aria-label={removeLabel}
    >
      {label}
      <X className="h-3 w-3 text-muted-foreground" aria-hidden />
    </Link>
  );
}
