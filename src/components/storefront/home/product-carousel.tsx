"use client";

// Product carousel — the shared scroll-snap rail re-housing the homepage
// product sections (Trade Desk Picks / New arrivals / Best sellers). Same
// ProductCard anatomy as the frozen contract; adds arrows + snap scrolling so
// the rails read like the reference carousels.

import { ProductCard } from "@/components/storefront/product-card";
import type { ApiProductCard } from "@/lib/serializers";
import { RailWithArrows } from "./rail-arrows";
import { SectionHead } from "./section-head";

interface ProductCarouselProps {
  eyebrow: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId: string;
  products: ApiProductCard[];
  /** Server-computed wishlist ids for the signed-in customer. */
  wishlistIds?: string[];
  /** Visible card width — swappable per rail without changing card anatomy. */
  itemClassName?: string;
}

export function ProductCarousel({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  headingId,
  products,
  wishlistIds = [],
  itemClassName = "w-[218px] sm:w-[248px]",
}: ProductCarouselProps) {
  if (products.length === 0) return null;
  const wishlisted = new Set(wishlistIds);

  return (
    <RailWithArrows
      label={title}
      head={
        <SectionHead
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          href={href}
          linkLabel={linkLabel}
          headingId={headingId}
        />
      }
    >
      {products.map((product) => (
        <li key={product.id} className={`shrink-0 snap-start ${itemClassName}`}>
          <ProductCard product={product} wishlisted={wishlisted.has(product.id)} />
        </li>
      ))}
    </RailWithArrows>
  );
}
