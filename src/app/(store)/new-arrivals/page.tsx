import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { mapProductCard } from "@/lib/serializers";
import {
  getNewArrivals,
  getPriceAndRating,
} from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { ProductGrid } from "@/components/storefront/product-grid";
import { buttonVariants } from "@/components/ui/button";

// /new-arrivals — brief deliverable "New Launches". Same card system as the
// catalogue (mapProductCard + getPriceAndRating), newest-first from createdAt.
// The full faceted catalogue remains at /products?sort=newest.

export const metadata: Metadata = {
  title: `New Arrivals | ${STORE.name}`,
  description: `The latest CCTV cameras, recorders and networking hardware to land at ${STORE.name} — genuine stock, dispatched from ${STORE.city}.`,
  alternates: { canonical: "/new-arrivals" },
};

export const dynamic = "force-dynamic";

const TAKE = 24;

export default async function NewArrivalsPage() {
  const session = await getCustomerSession().catch(() => null);

  const [products, wishlist] = await Promise.all([
    getNewArrivals(TAKE).catch(() => []),
    getWishlistProductIds(session?.userId ?? null)
      .then((ids) => [...ids])
      .catch(() => [] as string[]),
  ]);
  const enrich = await getPriceAndRating(products.map((p) => p.id)).catch(() => ({
    minPrice: new Map<string, number>(),
    ratings: new Map<string, { avg: number; count: number }>(),
  }));
  const cards = products.map((product) =>
    mapProductCard(product, enrich.minPrice.get(product.id) ?? 0, enrich.ratings.get(product.id)),
  );

  return (
    <div className="container-inner py-8 md:py-12">
      <header className="max-w-2xl">
        <p className="label-caps">Just landed</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">New arrivals</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          {cards.length > 0
            ? `The ${cards.length} newest products on the ${STORE.name} shelves — new stock is added as it clears quality check.`
            : "New stock is added as it clears quality check."}
        </p>
      </header>

      {cards.length > 0 ? (
        <ProductGrid products={cards} wishlistIds={wishlist} className="mt-8" />
      ) : (
        <p className="mt-8 rounded-lg border bg-card p-6 text-sm text-muted-foreground">
          The shelves just cleared — fresh stock is being catalogued right now. In the meantime,{" "}
          <Link href="/products" className="link-underline font-medium text-foreground">
            browse the full catalogue
          </Link>
          .
        </p>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 border-t pt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Looking for something specific? The full catalogue carries every filter.
        </p>
        <Link href="/products?sort=newest" className={buttonVariants({ variant: "secondary", size: "lg" }) + " min-h-[44px]"}>
          View the full catalogue
        </Link>
      </div>
    </div>
  );
}
