"use client";

// SearchOverlay — reference search interaction model:
//  desktop  = full-width white panel pinned under the primary nav (the trigger
//             is a disclosure button with aria-expanded/haspopup).
//  mobile   = full-screen sheet rendered OUTSIDE <header> as a sibling by
//             Header() — the nav row's backdrop-blur creates a containing
//             block that traps position:fixed children (Task 50-b gotcha).
// One provider owns open/close so the trigger, panels and focus return stay
// in sync. Predictive hits use GET /api/search/quick with a 200ms debounce.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PriceRow } from "./price-row";
import { useCategoryTree, type MegaCategory } from "./mega-menu";

interface QuickSearchHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string | null;
  priceFromPaise: number;
  image: string | null;
}

// ---------------------------------------------------------------------------
// Shared open/close state (trigger lives in the nav row; panels render in two
// places — the sticky nav wrapper and the Header fragment).
// ---------------------------------------------------------------------------

interface SearchContextValue {
  open: boolean;
  openWith: (trigger: HTMLElement | null) => void;
  close: () => void;
  toggle: (trigger: HTMLElement | null) => void;
  /** Cross-close without focus side effects (e.g. when the mega menu opens). */
  setOpen: (open: boolean) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openWith = useCallback((trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    const trigger = triggerRef.current;
    if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
  }, []);

  const toggle = useCallback(
    (trigger: HTMLElement | null) => {
      if (open) close();
      else openWith(trigger);
    },
    [open, close, openWith],
  );

  const value = useMemo(
    () => ({ open, openWith, close, toggle, setOpen }),
    [open, openWith, close, toggle],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Panel contents.
// ---------------------------------------------------------------------------

// Genuine trade queries; "Kit builder" deep-links to the tool.
const TRENDING: { label: string; query?: string; href?: string }[] = [
  { label: "CCTV camera", query: "CCTV camera" },
  { label: "PoE switch", query: "PoE switch" },
  { label: "DVR", query: "DVR" },
  { label: "Kit builder", href: "/kit-builder" },
];

function ChipSkeletonRow() {
  return (
    <div className="flex flex-wrap gap-2" aria-hidden="true">
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
      <Skeleton className="h-9 w-32 rounded-full" />
    </div>
  );
}

function ChipsSection({
  tree,
  treeLoading,
  onNavigate,
  onQuery,
}: {
  tree: MegaCategory[];
  treeLoading: boolean;
  onNavigate: () => void;
  onQuery: (query: string) => void;
}) {
  return (
    <div className="space-y-5">
      <section>
        <p className="label-caps">Trending searches</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {TRENDING.map((chip) =>
            chip.href ? (
              <Button
                key={chip.label}
                asChild
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
              >
                <Link href={chip.href} onClick={onNavigate}>
                  {chip.label}
                </Link>
              </Button>
            ) : (
              <Button
                key={chip.label}
                variant="outline"
                size="sm"
                className="h-9 rounded-full"
                onClick={() => onQuery(chip.query ?? "")}
              >
                {chip.label}
              </Button>
            ),
          )}
        </div>
      </section>
      {tree.length > 0 || treeLoading ? (
        <section>
          <p className="label-caps">Browse by category</p>
          <div className="mt-2.5">
            {treeLoading ? (
              <ChipSkeletonRow />
            ) : (
              <div className="flex flex-wrap gap-2">
                {tree.map((root) => (
                  <Button
                    key={root.id}
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-full"
                  >
                    <Link href={`/products?category=${root.slug}`} onClick={onNavigate}>
                      {root.name}
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function HitSkeletons() {
  return (
    <ul className="divide-y" aria-hidden="true">
      {[0, 1, 2].map((row) => (
        <li key={row} className="flex items-center gap-3 py-3">
          <Skeleton className="h-[60px] w-12 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-56 max-w-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </li>
      ))}
    </ul>
  );
}

function SearchResults({
  query,
  tree,
  treeLoading,
  onNavigate,
  onQuery,
}: {
  query: string;
  tree: MegaCategory[];
  treeLoading: boolean;
  onNavigate: () => void;
  onQuery: (query: string) => void;
}) {
  const [hits, setHits] = useState<QuickSearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);

  // 200ms debounce per the frozen contract. State writes happen only in async
  // callbacks (timer/promise) — never synchronously inside the effect body.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const term = query.trim();
      if (term.length < 2) {
        setHits(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch(`/api/search/quick?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((json: { ok?: boolean; data?: { hits?: QuickSearchHit[] } }) => {
          setHits(json?.ok && Array.isArray(json.data?.hits) ? json.data.hits : []);
          setLoading(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setHits([]);
            setLoading(false);
          }
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const term = query.trim();

  if (hits !== null) {
    if (loading) {
      return <HitSkeletons />;
    }
    if (hits.length > 0) {
      return (
        <div>
          <p className="label-caps">
            {hits.length} result{hits.length === 1 ? "" : "s"} for &ldquo;{term}&rdquo;
          </p>
          <ul className="mt-2 divide-y">
            {hits.map((hit) => (
              <li key={hit.id}>
                <Link
                  href={`/products/${hit.slug}`}
                  onClick={onNavigate}
                  className="group flex items-center gap-3 py-2.5"
                >
                  {hit.image ? (
                    <Image
                      src={hit.image}
                      alt=""
                      width={48}
                      height={60}
                      className="h-[60px] w-12 shrink-0 rounded-md bg-secondary object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-[60px] w-12 shrink-0 rounded-md bg-secondary"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="label-caps block truncate">{hit.brand}</span>
                    <span className="mt-0.5 block truncate text-sm font-medium group-hover:underline">
                      {hit.name}
                    </span>
                    {hit.modelNumber ? (
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        Model {hit.modelNumber}
                      </span>
                    ) : null}
                  </span>
                  <PriceRow pricePaise={hit.priceFromPaise} size="sm" className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          No matches for &ldquo;{term}&rdquo; — try a trending search or browse a category.
        </p>
        <div className="mt-4">
          <ChipsSection tree={tree} treeLoading={treeLoading} onNavigate={onNavigate} onQuery={onQuery} />
        </div>
      </div>
    );
  }

  return <ChipsSection tree={tree} treeLoading={treeLoading} onNavigate={onNavigate} onQuery={onQuery} />;
}

function SearchInputRow({
  inputRef,
  query,
  onQueryChange,
  onClose,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search cameras, recorders, switches…"
          aria-label="Search products"
          className="h-11 pl-9"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close search"
        onClick={onClose}
        className="shrink-0"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </Button>
    </>
  );
}

export function SearchOverlay({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const { open, close } = useSearch();
  const { tree, treeLoading } = useCategoryTree(open);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = variant === "mobile";

  // Escape closes from anywhere; focus returns to the opening trigger via close().
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Focus into the input on open.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Lock body scroll only behind the full-screen mobile sheet.
  useEffect(() => {
    if (!isMobile || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile, open]);

  if (variant === "desktop") {
    if (!open) return null;
    return (
      <div
        id="search-panel-desktop"
        className="absolute inset-x-0 top-full hidden animate-in fade-in duration-200 lg:block"
      >
        <div className="border-b bg-card shadow-whisper">
          <div className="container-inner thin-scrollbar max-h-[70vh] overflow-y-auto py-5">
            <div className="flex items-center gap-2">
              <SearchInputRow
                inputRef={inputRef}
                query={query}
                onQueryChange={setQuery}
                onClose={close}
              />
            </div>
            <div className="mt-4">
              <SearchResults
                query={query}
                tree={tree}
                treeLoading={treeLoading}
                onNavigate={close}
                onQuery={setQuery}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile variant — also renders the desktop click-away scrim (the panel
  // itself lives inside the sticky nav wrapper, this scrim lives out here).
  return (
    <>
      {open ? (
        <div
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-40 hidden animate-in fade-in bg-foreground/20 duration-200 lg:block"
        />
      ) : null}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search products"
          className="fixed inset-0 z-[60] flex animate-in fade-in flex-col bg-background duration-200 lg:hidden"
        >
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <SearchInputRow
              inputRef={inputRef}
              query={query}
              onQueryChange={setQuery}
              onClose={close}
            />
          </div>
          <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-4">
            <SearchResults
              query={query}
              tree={tree}
              treeLoading={treeLoading}
              onNavigate={close}
              onQuery={setQuery}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
