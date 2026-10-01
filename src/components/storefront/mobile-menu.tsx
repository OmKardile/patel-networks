"use client";

// MobileMenu — hamburger sheet (left). "Search products" hands off to the
// full-screen search sheet (owned by Header, rendered outside <header>),
// then closes this sheet. Category tree is passed down from Navigation —
// no second fetch.

import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSearch } from "./search-overlay";
import type { MegaCategory } from "./mega-menu";

const SHOP_LINKS = [
  { label: "Kit Builder", href: "/kit-builder" },
  { label: "Brands", href: "/brands" },
];

const SUPPORT_LINKS = [
  { label: "Track Order", href: "/track" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
];

const ACCOUNT_LINKS = [
  { label: "My account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Wishlist", href: "/account/wishlist" },
];

export function MobileMenu({
  open,
  onOpenChange,
  tree,
  treeLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tree: MegaCategory[];
  treeLoading: boolean;
}) {
  const { openWith } = useSearch();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full flex-col gap-0 p-0 data-[state=open]:duration-300 sm:max-w-sm"
      >
        <SheetHeader className="border-b p-4 pb-3">
          <SheetTitle className="text-base font-semibold">Patel Networks</SheetTitle>
          <SheetDescription className="text-xs">
            Categories, store links and your account.
          </SheetDescription>
        </SheetHeader>
        <div className="thin-scrollbar flex-1 overflow-y-auto px-4 pb-6 pt-4">
          <Button
            variant="outline"
            className="h-11 w-full justify-start"
            onClick={() => {
              onOpenChange(false);
              openWith(null);
            }}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Search products
          </Button>

          {treeLoading ? (
            <div className="mt-5 space-y-2" aria-hidden="true">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-52" />
              <Skeleton className="h-10 w-36" />
            </div>
          ) : (
            tree.map((root) => (
              <section key={root.id} className="mt-5">
                <Link
                  href={`/products?category=${root.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex min-h-11 items-center text-sm font-semibold"
                >
                  {root.name}
                </Link>
                {root.children.length > 0 ? (
                  <ul className="mt-0.5 border-l pl-3">
                    {root.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/products?category=${child.slug}`}
                          onClick={() => onOpenChange(false)}
                          className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))
          )}

          <nav aria-label="Shop" className="mt-5 border-t pt-3">
            <ul>
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className="flex min-h-11 items-center text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support" className="mt-4 border-t pt-3">
            <ul>
              {SUPPORT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account" className="mt-4 border-t pt-3">
            <ul>
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => onOpenChange(false)}
                    className="flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 flex min-h-11 items-center justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
