import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart-view";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { getInstallAccessories, getPriceAndRating } from "@/server/services/catalog.service";
import { mapProductCard } from "@/lib/serializers";

export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review your surveillance & networking hardware before checkout.",
};

// The cart itself is client-side (zustand mirror of the server cart). The
// cross-sell rail below is rendered server-side so it works for guests too.
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const accessories = await getInstallAccessories(4);
  const enrich = accessories.length ? await getPriceAndRating(accessories.map((p) => p.id)) : null;
  const cards = accessories.map((p) => mapProductCard(p, enrich?.minPrice.get(p.id) ?? 0, enrich?.ratings.get(p.id)));

  return (
    <div className="container-inner pb-16 pt-8 lg:pt-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} className="mb-5" />

      <header className="mb-8 lg:mb-10">
        <p className="label-caps mb-2">Step 1 of 3 · Review</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your cart</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Prices are GST-inclusive. Stock is reserved for you the moment the order is placed.
        </p>
      </header>

      <CartView />

      <div className="mt-14 border-t border-border pt-10">
        <ProductCarousel
          eyebrow="Cross-sell"
          title="Complete the install"
          lede="Cables, connectors and power that most CCTV jobs end up needing."
          href="/products?category=connectors-accessories"
          linkLabel="Browse all accessories"
          products={cards}
        />
      </div>
    </div>
  );
}
