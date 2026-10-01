"use client";

// MegaMenu — reference full-width panel under the primary nav, opened on
// hover-intent from Navigation. The hovered root's children render as link
// columns, with the "Featured:" shortcuts rail and a "View all" pill on the
// right/foot. Also owns the lazy /api/categories loader shared by the nav row
// and the search overlay (one cached request per page load).

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface MegaCategoryChild {
  id: string;
  name: string;
  slug: string;
}

export interface MegaCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  children: MegaCategoryChild[];
}

// Module-level cache: /api/categories is fetched once per page load and shared
// by Navigation (labels + mega) and the search overlay (category chips).
let treePromise: Promise<MegaCategory[]> | null = null;

export function fetchCategoryTree(): Promise<MegaCategory[]> {
  if (!treePromise) {
    treePromise = fetch("/api/categories", { cache: "no-store" })
      .then((res) => res.json())
      .then((json: { ok?: boolean; data?: { tree?: MegaCategory[] } }) =>
        json?.ok && Array.isArray(json.data?.tree) ? json.data.tree : [],
      )
      .catch(() => [] as MegaCategory[]);
  }
  return treePromise;
}

/** Lazy tree hook — `enabled` gates the fetch (e.g. only while a panel is open). */
export function useCategoryTree(enabled: boolean): {
  tree: MegaCategory[];
  treeLoading: boolean;
} {
  const [tree, setTree] = useState<MegaCategory[]>([]);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void fetchCategoryTree().then((next) => {
      if (!active) return;
      setTree(next);
      setSettled(true);
    });
    return () => {
      active = false;
    };
  }, [enabled]);

  return { tree, treeLoading: enabled && !settled };
}

// Genuine shortcuts — real routes the storefront ships.
const FEATURED_LINKS = [
  { label: "New arrivals", href: "/products?sort=newest" },
  { label: "Best sellers", href: "/products?sort=popular" },
  { label: "Build a full kit", href: "/kit-builder" },
  { label: "Shop by brand", href: "/brands" },
];

export function MegaMenu({
  root,
  onClose,
  onMouseEnter,
  onFocus,
  onBlur,
}: {
  root: MegaCategory;
  onClose: () => void;
  onMouseEnter?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      id="mega-panel"
      className="absolute inset-x-0 top-full hidden animate-in fade-in duration-200 lg:block"
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <div className="border-b bg-card shadow-whisper">
        <div className="container-inner grid gap-8 py-6 lg:grid-cols-[1fr_220px]">
          <div>
            <p className="label-caps">Shop {root.name}</p>
            {root.children.length > 0 ? (
              <ul className="mt-3 grid grid-cols-2 gap-x-6 md:grid-cols-3">
                {root.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/products?category=${child.slug}`}
                      onClick={onClose}
                      className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Every {root.name.toLowerCase()} product in one list, filterable by brand and spec.
              </p>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="h-9 rounded-full">
                <Link href={`/products?category=${root.slug}`} onClick={onClose}>
                  View all {root.name}
                </Link>
              </Button>
            </div>
          </div>
          <div className="border-t pt-5 lg:border-l lg:pl-8 lg:pt-0 lg:border-t-0">
            <p className="label-caps">Featured:</p>
            <ul className="mt-3">
              {FEATURED_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="inline-flex min-h-11 items-center text-sm font-medium transition-colors hover:text-muted-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
