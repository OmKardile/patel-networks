"use client";

// Navigation — primary nav row (h-16, sticky): wordmark, category items driven
// by the lazy /api/categories tree with the mega menu on 160ms hover-intent,
// Kit Builder + Brands, and the actions cluster (search disclosure, account
// drawer, wishlist, theme, cart). Mobile: hamburger sheet + search icon into
// the full-screen search sheet. The mega/search panels render as absolute
// children of this sticky wrapper so they track the bar at any scroll offset.

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
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

  return (
    <div
      className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur"
      onMouseEnter={clearTimers}
      onMouseLeave={scheduleMegaClose}
    >
      <nav aria-label="Primary" className="container-inner flex h-16 items-center gap-1">
        {/* Mobile: hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Patel Networks — home"
          className="mr-2 whitespace-nowrap text-base font-semibold tracking-tight lg:text-lg"
        >
          Patel Networks
        </Link>

        {/* Desktop items */}
        <div className="hidden items-center lg:flex">
          {treeLoading
            ? [0, 1, 2, 3, 4].map((row) => (
                <Skeleton key={row} className="mr-1 h-8 w-24 rounded-full" aria-hidden="true" />
              ))
            : tree.map((root) => {
                const expanded = megaOpen && megaRoot?.id === root.id;
                return (
                  <button
                    key={root.id}
                    type="button"
                    aria-expanded={expanded}
                    aria-haspopup="true"
                    aria-controls={expanded ? "mega-panel" : undefined}
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.06]",
                      expanded && "bg-foreground/[0.06]",
                    )}
                    onMouseEnter={() => scheduleMegaOpen(root)}
                    onBlur={scheduleMegaClose}
                    onClick={() => (expanded ? closeMega() : openMegaNow(root))}
                  >
                    {root.name}
                  </button>
                );
              })}
          <Link
            href="/kit-builder"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.06]"
          >
            Kit Builder
          </Link>
          <Link
            href="/brands"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/[0.06]"
          >
            Brands
          </Link>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-0.5">
          {/* Mobile search — hidden below 420px so 375px never overflows (the
              menu sheet's "Search products" button owns search there) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden min-[420px]:inline-flex lg:hidden"
            aria-label="Search products"
            onClick={(event) => {
              closeMega();
              toggleSearch(event.currentTarget);
            }}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Desktop search disclosure */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:inline-flex"
            aria-label="Search products"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            aria-controls={searchOpen ? "search-panel-desktop" : undefined}
            onClick={(event) => {
              closeMega();
              toggleSearch(event.currentTarget);
            }}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Account drawer */}
          <Button
            variant="ghost"
            size="icon"
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
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
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
