"use client";

// Navigation — primary nav row (h-16, sticky, hides on scroll down and
// returns on scroll up unless a panel is open): wordmark, category items driven
// by the lazy /api/categories tree with the mega menu on 160ms hover-intent,
// Kit Builder + Brands, and the actions cluster (search disclosure, account
// drawer, wishlist, theme, cart). Mobile: hamburger sheet + search icon into
// the full-screen search sheet. The mega/search panels render as absolute
// children of this sticky wrapper so they track the bar at any scroll offset.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useCartCount, useCartStore } from "@/store/cart-store";
import { MegaMenu, useCategoryTree, type MegaCategory } from "./mega-menu";
import { MobileMenu } from "./mobile-menu";
import { AccountDrawer } from "./account-drawer";
import { SearchOverlay, useSearch } from "./search-overlay";

const MEGA_OPEN_DELAY_MS = 160;
const MEGA_CLOSE_DELAY_MS = 160;

// Reference nav voice: uppercase, small, semibold, tracked out. Tight px at xl
// so five long category names + actions still fit the 1280 container.
// BREAKPOINT CONTRACT: the desktop row (long category names + 160px search
// pill + labeled account) only fits ≥1280 — at 1024 (lg) it overflowed the
// viewport by 171px and dragged EVERY route into horizontal scroll. Desktop
// chrome therefore switches on at xl; below xl the hamburger chrome owns the
// bar (search overlay + menu sheet + account drawer are all width-agnostic).
const DESKTOP_ITEM =
  "inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[13px] font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground/[0.06] xl:px-3";

export function Navigation() {
  const { tree, treeLoading } = useCategoryTree(true);
  const { open: searchOpen, setOpen: setSearchOpen, toggle: toggleSearch } = useSearch();
  const [megaRoot, setMegaRoot] = useState<MegaCategory | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const cartCount = useCartCount();
  const openDrawer = useCartStore((s) => s.openDrawer);

  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Brief B: the sticky bar hides on scroll down and returns on scroll up.
  // Suppressed whenever a panel (mega/search/mobile menu/account) is open so
  // an interactive surface is never translated away under the user.
  const [navHidden, setNavHidden] = useState(false);
  const lastYRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const openMegaNow = useCallback(
    (root: MegaCategory) => {
      clearTimers();
      setMegaRoot(root);
      setSearchOpen(false); // cross-close with the search overlay
    },
    [clearTimers, setSearchOpen],
  );

  const scheduleMegaOpen = useCallback(
    (root: MegaCategory) => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      if (openTimer.current) clearTimeout(openTimer.current);
      openTimer.current = setTimeout(() => openMegaNow(root), MEGA_OPEN_DELAY_MS);
    },
    [openMegaNow],
  );

  const scheduleMegaClose = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaRoot(null), MEGA_CLOSE_DELAY_MS);
  }, []);

  const closeMega = useCallback(() => {
    clearTimers();
    setMegaRoot(null);
  }, [clearTimers]);

  const megaOpen = megaRoot !== null;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const last = lastYRef.current;
      lastYRef.current = y;
      if (megaOpen || searchOpen || mobileMenuOpen || accountOpen) return;
      if (y > 96 && y > last + 4) setNavHidden(true);
      else if (y < last - 4 || y <= 96) setNavHidden(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [megaOpen, searchOpen, mobileMenuOpen, accountOpen]);

  return (
    <div
      className={cn(
        "sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-transform duration-300 ease-out",
        navHidden && "-translate-y-full",
      )}
      onMouseEnter={clearTimers}
      onMouseLeave={scheduleMegaClose}
    >
      <nav aria-label="Primary" className="container-inner flex h-16 items-center gap-1">
        {/* Mobile: hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Patel Networks — home"
          className="mr-2 whitespace-nowrap text-base font-bold uppercase tracking-[0.08em] lg:text-lg"
        >
          Patel Networks
        </Link>

        {/* Desktop items — reference density: New · up to 4 root groups · Offers.
            Kit Builder + Brands stay in the mega featured links + footer (the
            reference bar carries only four short items; 5 roots overflow 1280). */}
        <div className="hidden items-center xl:flex">
          <Link href="/new-arrivals" className={DESKTOP_ITEM}>
            New
          </Link>
          {treeLoading
            ? [0, 1, 2, 3].map((row) => (
                <Skeleton key={row} className="mr-1 h-8 w-24 rounded-full" aria-hidden="true" />
              ))
            : tree.slice(0, 3).map((root) => {
                const expanded = megaOpen && megaRoot?.id === root.id;
                return (
                  <button
                    key={root.id}
                    type="button"
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    aria-controls={expanded ? "mega-panel" : undefined}
                    className={cn(DESKTOP_ITEM, expanded && "bg-foreground/[0.06]")}
                    onMouseEnter={() => scheduleMegaOpen(root)}
                    onBlur={scheduleMegaClose}
                    onClick={() => (expanded ? closeMega() : openMegaNow(root))}
                  >
                    {root.name}
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
          <Link href="/offers" className={cn(DESKTOP_ITEM, "text-[var(--accent-red)]")}>
            Offers
          </Link>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Mobile search — hidden below 420px so 375px never overflows (the
              menu sheet's "Search products" button owns search there) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden min-[420px]:inline-flex xl:hidden"
            aria-label="Search products"
            onClick={(event) => {
              closeMega();
              toggleSearch(event.currentTarget);
            }}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Desktop search — reference pill disclosure */}
          <button
            type="button"
            className="mr-1 hidden h-10 w-40 shrink-0 items-center gap-2 rounded-full border border-black/15 bg-white px-4 text-sm text-black/50 transition-colors hover:border-black/30 hover:text-black/70 xl:inline-flex"
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            aria-controls={searchOpen ? "search-panel-desktop" : undefined}
            onClick={(event) => {
              closeMega();
              toggleSearch(event.currentTarget);
            }}
          >
            Search
            <Search className="ml-auto h-4 w-4" aria-hidden="true" />
          </button>

          {/* Account drawer — reference shows icon over a tiny label on xl,
              icon-only below xl */}
          <button
            type="button"
            className="hidden min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[10px] font-medium uppercase tracking-wide text-foreground transition-colors hover:bg-foreground/[0.06] xl:inline-flex"
            onClick={() => {
              closeMega();
              setAccountOpen(true);
            }}
          >
            <User className="h-5 w-5" aria-hidden="true" />
            Account
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label="Account"
            onClick={() => {
              closeMega();
              setAccountOpen(true);
            }}
          >
            <User className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Wishlist */}
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/[0.06] sm:flex"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Theme toggle: room exists below xl once the long desktop items are
              xl-only — surface it from sm up so tablet/laptop users get it. */}
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Cart drawer */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            onClick={() => {
              closeMega();
              openDrawer();
            }}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--accent-red)] px-1 text-[10px] font-semibold leading-none text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Button>
        </div>
      </nav>

      {megaRoot ? (
        <MegaMenu
          root={megaRoot}
          onClose={closeMega}
          onMouseEnter={clearTimers}
          onFocus={clearTimers}
          onBlur={scheduleMegaClose}
        />
      ) : null}

      <SearchOverlay variant="desktop" />

      <MobileMenu
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        tree={tree}
        treeLoading={treeLoading}
      />
      <AccountDrawer open={accountOpen} onOpenChange={setAccountOpen} />
    </div>
  );
}
