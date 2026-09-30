"use client";

// Storefront header — rebuilt on the verified neemans.com header stack
// (blueprint §1.1): rotating announcement strip with prev/next arrows →
// desktop utility row → primary nav with mega menu → search overlay →
// account/wishlist/cart. Genuine client content only; every existing wiring
// contract (cart drawer store, mega menu, /api/categories + /api/search/quick
// shapes, mobile sheet) is preserved byte-for-byte at the behavior level.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Menu,
  MessageCircle,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCartCount, useCartStore } from "@/store/cart-store";
import { FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface QuickHit {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string | null;
  priceFromPaise: number;
  image: string | null;
}

interface MegaChild {
  id: string;
  name: string;
  slug: string;
}

interface MegaCategory {
  id: string;
  name: string;
  slug: string;
  children: MegaChild[];
}

const NAV: { href: string; label: string; slug?: string }[] = [
  { href: "/products?category=cctv-surveillance", label: "CCTV & Surveillance", slug: "cctv-surveillance" },
  { href: "/products?category=displays-screens", label: "Screens", slug: "displays-screens" },
  { href: "/products?category=cables-wiring", label: "Cable", slug: "cables-wiring" },
  { href: "/products?category=connectors-accessories", label: "Connector", slug: "connectors-accessories" },
  { href: "/products?category=media-converters-optical", label: "Converter", slug: "media-converters-optical" },
  { href: "/kit-builder", label: "Kit Builder" },
  { href: "/brands", label: "Brands" },
];

const MEGA_SHORTCUTS = [
  { href: "/products?sort=newest", label: "New arrivals", note: "Fresh stock, just landed" },
  { href: "/products", label: "Most popular", note: "What installers reorder" },
  { href: "/kit-builder", label: "Build a full kit", note: "Cameras + recorder + cable, one spec" },
  { href: "/brands", label: "Shop by brand", note: "Authorized, serial-tracked stock" },
];

// Announcement rotation — three genuine service promises, sourced from the
// same constants the cart/free-shipping math and the contact page use.
const ANNOUNCEMENTS: string[] = [
  `Free shipping across India on orders over ₹${FREE_SHIPPING_THRESHOLD_PAISE / 100}`,
  "GST tax invoice on every order — input-credit ready",
  `Same-day dispatch from ${STORE.city}, ${STORE.originState} · orders before ${STORE.dispatchCutoff}`,
];

// Utility row — real storefront routes only (verified under src/app/(store)).
const UTILITY_LINKS: { href: string; label: string }[] = [
  { href: "/track", label: "Track Order" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "Help" },
  { href: "/contact", label: "Bulk Inquiry" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/contact", label: "Contact" },
];

function formatPrice(paise: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);
}

// ---------------------------------------------------------------------------
// AnnouncementStrip — rotating messages with prev/next arrows (reference
// pattern). Auto-advances every 5s, pauses on hover, announces politely.
// ---------------------------------------------------------------------------

function AnnouncementStrip() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const total = ANNOUNCEMENTS.length;

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setIndex((i) => (i + 1) % total);
    }, 5000);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div
      role="region"
      aria-label="Store announcements"
      className="bg-sand text-sand-foreground"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="relative mx-auto flex h-9 max-w-7xl items-center justify-center px-12 sm:px-14">
        <p aria-live="polite" className="truncate text-center text-[11.5px] font-medium tracking-wide">
          {ANNOUNCEMENTS[index]}
        </p>
        <div className="absolute left-1 top-1/2 flex -translate-y-1/2 items-center sm:left-3">
          <button
            type="button"
            aria-label="Previous announcement"
            onClick={() => setIndex((i) => (i - 1 + total) % total)}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-sand-foreground/10"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center sm:right-3">
          <button
            type="button"
            aria-label="Next announcement"
            onClick={() => setIndex((i) => (i + 1) % total)}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 hover:bg-sand-foreground/10"
          >
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UtilityBar — small caps row between the announcement and the primary nav.
// Desktop only (hidden on mobile, where the sheet menu carries these links).
// ---------------------------------------------------------------------------

function UtilityBar() {
  return (
    <div className="hidden border-b border-border/70 md:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <nav aria-label="Utility" className="flex min-w-0 items-center gap-5 overflow-x-auto no-scrollbar">
          {UTILITY_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="label-caps !text-[10px] whitespace-nowrap transition-colors duration-200 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <a
          href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Hi Patel Networks — I have a question about an order.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="label-caps !text-[10px] inline-flex shrink-0 items-center gap-1.5 transition-colors duration-200 hover:text-foreground"
        >
          <MessageCircle className="h-3 w-3" aria-hidden />
          Support on WhatsApp
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SearchPanelBody — pure presentation for the search overlay (trending chips,
// category chips, predictive hits). All state lives in Header so the desktop
// panel and the mobile full-screen sheet share one source of truth.
// ---------------------------------------------------------------------------

interface SearchPanelBodyProps {
  variant: "desktop" | "mobile";
  query: string;
  hits: QuickHit[];
  loading: boolean;
  tree: MegaCategory[] | null;
  onQueryChange: (next: string) => void;
  onTermSelect: (term: string) => void;
  onNavigate: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

function SearchPanelBody({
  variant,
  query,
  hits,
  loading,
  tree,
  onQueryChange,
  onTermSelect,
  onNavigate,
  onSubmit,
  onClose,
}: SearchPanelBodyProps) {
  const term = query.trim();
  const hasQuery = term.length >= 2;
  const showEmptyState = hits.length === 0;

  // Trending = genuine catalog terms: real category names from the live tree
  // plus the three fixed storefront terms. "Kit builder" is a page, not a
  // search, so it deep-links to the tool.
  const trending: { label: string; term?: string; href?: string }[] = [
    { label: "CCTV camera", term: "CCTV camera" },
    { label: "PoE switch", term: "PoE switch" },
    { label: "Kit builder", href: "/kit-builder" },
    ...(tree ?? []).slice(0, 4).map((c) => ({ label: c.name, term: c.name })),
  ];

  return (
    <div className={cn(variant === "mobile" && "flex min-h-full flex-col")}>
      {/* input row */}
      <div
        className={cn(
          "flex items-center gap-2",
          variant === "mobile"
            ? "sticky top-0 z-10 border-b border-border bg-background px-4 py-3"
            : "pb-4"
        )}
      >
        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (term) onSubmit();
          }}
        >
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search cameras, DVRs, cables, SKU…"
            aria-label="Search products"
            autoComplete="off"
            autoFocus
            className="h-10 rounded-full border-border bg-card pl-10 pr-10 text-sm"
          />
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </form>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close search"
          onClick={onClose}
          className="shrink-0"
        >
          <X className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      {/* sections */}
      <div className={cn(variant === "mobile" ? "px-4 pb-8 pt-5" : "pt-1")}>
        {loading && hits.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground" role="status">
            Searching…
          </p>
        )}

        {hits.length > 0 && (
          <div>
            <ul className="divide-y divide-border/70">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    href={`/products/${hit.slug}`}
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-1 py-2.5 transition-colors hover:bg-muted"
                  >
                    {hit.image ? (
                      <img src={hit.image} alt="" className="h-10 w-10 rounded-md object-cover" loading="lazy" />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{hit.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {hit.brand}
                        {hit.modelNumber ? ` · ${hit.modelNumber}` : ""}
                      </div>
                    </div>
                    <div className="font-display text-sm">{formatPrice(hit.priceFromPaise)}</div>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onSubmit}
              className="mt-2 w-full rounded-lg bg-muted/60 px-3 py-2.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              View all results →
            </button>
          </div>
        )}

        {!loading && hasQuery && showEmptyState && (
          <p className="py-2 text-sm text-muted-foreground">
            No products matched &ldquo;{term}&rdquo; — try one of these instead:
          </p>
        )}

        {showEmptyState && (
          <>
            {/* trending searches */}
            <section aria-label="Trending searches">
              <p className="label-caps">Trending searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {trending.map((t) =>
                  t.href ? (
                    <Button
                      key={t.label}
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-border bg-card"
                    >
                      <Link href={t.href} onClick={onNavigate}>
                        {t.label}
                      </Link>
                    </Button>
                  ) : (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => t.term && onTermSelect(t.term)}
                      className="inline-flex h-8 items-center rounded-full border border-border bg-card px-3.5 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-muted"
                    >
                      {t.label}
                    </button>
                  )
                )}
              </div>
            </section>

            {/* browse by category — the live category tree */}
            <section aria-label="Browse by category" className="mt-6">
              <p className="label-caps">Browse by category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tree
                  ? tree.map((c) => (
                      <Button
                        key={c.id}
                        asChild
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full"
                      >
                        <Link href={`/products?category=${c.slug}`} onClick={onNavigate}>
                          {c.name}
                        </Link>
                      </Button>
                    ))
                  : [0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-muted" aria-hidden />
                    ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

export function Header() {
  const count = useCartCount();
  const pathname = usePathname();
  const router = useRouter();
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [tree, setTree] = useState<MegaCategory[] | null>(null);
  const requested = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // search overlay state (shared by the desktop panel and the mobile sheet)
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<QuickHit[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTriggerRef = useRef<HTMLElement | null>(null);

  // Category tree loads lazily on first hover of a category item or first
  // search open, then caches for the session.
  function ensureTree() {
    if (requested.current) return;
    requested.current = true;
    void fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((json: { ok: boolean; data?: { tree: MegaCategory[] } }) => {
        if (json.ok && json.data) setTree(json.data.tree);
      })
      .catch(() => {
        requested.current = false;
      });
  }

  // pending debounce must not fire after unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function fetchQuick(term: string) {
    setLoading(true);
    void fetch(`/api/search/quick?q=${encodeURIComponent(term)}`)
      .then((r) => r.json())
      .then((json: { ok: boolean; data?: { hits: QuickHit[] } }) => {
        setHits(json.ok && json.data ? json.data.hits : []);
      })
      .finally(() => setLoading(false));
  }

  function onQueryChange(next: string) {
    setQuery(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const t = next.trim();
    if (t.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchQuick(t), 200);
  }

  function onTermSelect(term: string) {
    setQuery(term);
    fetchQuick(term);
  }

  function submitSearch() {
    const t = query.trim();
    if (!t) return;
    dismissSearch();
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  function openSearch(trigger?: HTMLElement | null) {
    searchTriggerRef.current = trigger ?? null;
    cancelClose();
    setActiveMega(null);
    setSearchOpen(true);
    ensureTree();
  }

  // UI closes (X, Escape, backdrop) return focus to the trigger
  function closeSearch() {
    setSearchOpen(false);
    searchTriggerRef.current?.focus();
  }

  // navigation closes — no focus juggling mid-route-change
  function dismissSearch() {
    setSearchOpen(false);
  }

  function closeAllPanels() {
    setActiveMega(null);
    dismissSearch();
  }

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setActiveMega(null), 160);
  }

  function openMega(slug: string | undefined) {
    if (!slug) {
      cancelClose();
      setActiveMega(null);
      return;
    }
    ensureTree();
    cancelClose();
    setActiveMega(slug);
    dismissSearch();
  }

  const activeRoot = tree?.find((c) => c.slug === activeMega) ?? null;
  const activeNav = NAV.find((n) => n.slug === activeMega) ?? null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <AnnouncementStrip />
        <UtilityBar />

        <div
          className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 max-[374px]:gap-2 sm:px-6 lg:h-[72px]"
          onMouseLeave={scheduleClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveMega(null);
          }}
        >
          {/* wordmark */}
          <Link href="/" onClick={closeAllPanels} className="group flex shrink-0 flex-col leading-none">
            <span className="font-display text-[22px] font-semibold tracking-tight text-foreground max-[374px]:text-[19px] lg:text-2xl">
              Patel Networks
            </span>
            <span className="label-caps !text-[9px] !tracking-[0.32em] text-muted-foreground group-hover:text-primary max-[374px]:hidden">
              SURVEILLANCE · NETWORKING
            </span>
          </Link>

          {/* desktop nav — category items open the mega panel */}
          <nav aria-label="Primary" className="ml-4 hidden flex-1 items-center gap-5 xl:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => openMega(item.slug)}
                onFocus={() => openMega(item.slug)}
                onClick={closeAllPanels}
                aria-expanded={item.slug ? activeMega === item.slug : undefined}
                aria-haspopup={item.slug ? "true" : undefined}
                className={cn(
                  "link-underline whitespace-nowrap text-[13px] font-medium text-foreground/75 transition-colors hover:text-foreground",
                  pathname === item.href.split("?")[0] && "font-semibold text-foreground",
                  activeMega && item.slug === activeMega && "font-semibold text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* search trigger — opens the full-width overlay panel (desktop) */}
          <button
            type="button"
            onClick={(e) => (searchOpen ? closeSearch() : openSearch(e.currentTarget))}
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            aria-controls="header-search-panel"
            aria-label="Search products"
            className="ml-auto hidden h-10 items-center gap-2 rounded-full border border-border bg-card pl-4 pr-5 text-sm text-muted-foreground transition-colors duration-200 hover:border-foreground/25 hover:text-foreground lg:flex xl:w-72"
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden xl:inline">Search cameras, DVRs, cables…</span>
            <span className="xl:hidden">Search</span>
          </button>

          {/* actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search products"
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
              aria-controls="header-search-panel-mobile"
              onClick={(e) => openSearch(e.currentTarget)}
              className="hidden min-[420px]:inline-flex lg:hidden"
            >
              <Search className="h-5 w-5" aria-hidden />
            </Button>
            <ThemeToggle className="hidden sm:inline-flex" />
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="Wishlist">
              <Link href="/account/wishlist" onClick={dismissSearch}>
                <Heart className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Account">
              <Link href="/account" onClick={dismissSearch}>
                <User className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Cart (${count} ${count === 1 ? "item" : "items"})`}
              onClick={() => {
                dismissSearch();
                openDrawer();
              }}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Button>

            {/* mobile drawer */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                <SheetDescription className="sr-only">Site navigation, search and account links</SheetDescription>
                <SheetTitle className="border-b border-border px-5 py-4 font-display text-lg">
                  Patel Networks
                </SheetTitle>
                <div className="px-5 py-4">
                  <Button
                    variant="outline"
                    className="h-10 w-full justify-start rounded-full pl-4 text-sm font-normal text-muted-foreground"
                    onClick={() => {
                      setMobileOpen(false);
                      openSearch();
                    }}
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    Search cameras, DVRs, cables…
                  </Button>
                </div>
                <nav aria-label="Mobile" className="flex flex-col pb-6">
                  {NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm font-medium hover:bg-muted"
                    >
                      {item.label}
                      <ChevronDown className="h-4 w-4 -rotate-90 text-muted-foreground" aria-hidden />
                    </Link>
                  ))}
                  <div className="mt-4 flex flex-col gap-1 px-5">
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground hover:text-foreground">
                      My Account
                    </Link>
                    <Link href="/track" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground hover:text-foreground">
                      Track Order
                    </Link>
                    <Link href="/contact" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-muted-foreground hover:text-foreground">
                      B2B / Wholesale Desk
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 px-5 pt-4">
                    <span className="text-sm text-muted-foreground">Appearance</span>
                    <ThemeToggle />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* mega panel — full-bleed under the bar; lazy category tree, cached */}
          {activeMega && (
            <div
              className="absolute left-1/2 top-full z-40 hidden w-screen -translate-x-1/2 xl:block"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              role="region"
              aria-label={activeNav ? `${activeNav.label} menu` : "Category menu"}
            >
              <div className="border-b border-border bg-card shadow-lift">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_250px]">
                  <div>
                    <p className="label-caps">{activeNav?.label ?? "Shop"} · by type</p>
                    {activeRoot && activeRoot.children.length > 0 ? (
                      <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                        {activeRoot.children.map((child) => (
                          <Link
                            key={child.id}
                            href={`/products?category=${child.slug}`}
                            onClick={closeAllPanels}
                            className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        ))}
                        <Link
                          href={`/products?category=${activeRoot.slug}`}
                          onClick={closeAllPanels}
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          View all {activeRoot.name} →
                        </Link>
                      </div>
                    ) : activeRoot ? (
                      <div className="mt-3">
                        <Link
                          href={`/products?category=${activeRoot.slug}`}
                          onClick={closeAllPanels}
                          className="inline-block rounded-lg px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          Browse all {activeRoot.name} →
                        </Link>
                      </div>
                    ) : (
                      <div className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="m-1 h-8 animate-pulse rounded-lg bg-muted" aria-hidden />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                    <p className="label-caps">Shortcuts</p>
                    <ul className="mt-3 space-y-1">
                      {MEGA_SHORTCUTS.map((q) => (
                        <li key={q.href}>
                          <Link href={q.href} onClick={closeAllPanels} className="group block rounded-lg px-3 py-1.5 transition-colors hover:bg-muted">
                            <span className="text-sm font-medium">{q.label}</span>
                            <span className="block text-xs text-muted-foreground">{q.note}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* search overlay — desktop: full-width panel under the nav row */}
          {searchOpen && (
            <div
              id="header-search-panel"
              role="dialog"
              aria-label="Product search"
              onKeyDown={(e) => {
                if (e.key === "Escape") closeSearch();
              }}
              className="absolute left-1/2 top-full z-50 hidden w-screen -translate-x-1/2 lg:block"
            >
              <div className="border-b border-border bg-card shadow-lift">
                <div className="mx-auto max-h-[70vh] max-w-7xl overflow-y-auto px-4 py-5 sm:px-6">
                  <SearchPanelBody
                    variant="desktop"
                    query={query}
                    hits={hits}
                    loading={loading}
                    tree={tree}
                    onQueryChange={onQueryChange}
                    onTermSelect={onTermSelect}
                    onNavigate={dismissSearch}
                    onSubmit={submitSearch}
                    onClose={closeSearch}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* secondary category rail (below xl where the desktop nav hides) */}
        <nav aria-label="Categories" className="border-t border-border/70 xl:hidden">
          <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-[13px] sm:px-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAllPanels}
                className="whitespace-nowrap font-medium text-foreground/75 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* search overlay chrome that must live OUTSIDE <header>: the header's
          backdrop-blur creates a containing block that would trap position:
          fixed descendants, so the mobile sheet and the desktop click-away
          scrim are rendered as siblings of the header itself. */}
      {searchOpen && (
        <>
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="fixed inset-0 z-30 hidden cursor-default bg-foreground/15 lg:block"
          />
          <div
            id="header-search-panel-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Product search"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearch();
            }}
            className="fixed inset-0 z-50 flex flex-col bg-background lg:hidden"
          >
            <div className="flex-1 overflow-y-auto">
              <SearchPanelBody
                variant="mobile"
                query={query}
                hits={hits}
                loading={loading}
                tree={tree}
                onQueryChange={onQueryChange}
                onTermSelect={onTermSelect}
                onNavigate={dismissSearch}
                onSubmit={submitSearch}
                onClose={closeSearch}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
