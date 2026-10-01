import type { Metadata } from "next";
import Link from "next/link";
import { listProducts, getPriceAndRating } from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { mapProductCard } from "@/lib/serializers";
import { ProductGrid } from "@/components/storefront/product-grid";
import { EmptyState } from "@/components/storefront/empty-state";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "Search",
  description: "Search surveillance cameras, recorders, cables and networking hardware.",
  robots: { index: false, follow: true },
};

type SearchParams = Record<string, string | string[] | undefined>;

const CATEGORY_CHIPS = [
  { href: "/products?category=cctv-surveillance", label: "CCTV & Surveillance" },
  { href: "/products?category=displays-screens", label: "Screens" },
  { href: "/products?category=cables-wiring", label: "Cable" },
  { href: "/products?category=connectors-accessories", label: "Connectors" },
  { href: "/products?category=media-converters-optical", label: "Converters" },
] as const;

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const rawQ = sp.q;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ)?.trim() ?? "";

  const session = await getCustomerSession();
  const [result, wishlistIds] = await Promise.all([
    q
      ? listProducts({ q, sort: "popular", page: 1, perPage: 24 })
      : Promise.resolve({ items: [], total: 0, page: 1, perPage: 24, totalPages: 1 }),
    getWishlistProductIds(session?.userId ?? null),
  ]);
  const enrich = await getPriceAndRating(result.items.map((p) => p.id));
  const cards = result.items.map((p) => mapProductCard(p, enrich.minPrice.get(p.id) ?? 0, enrich.ratings.get(p.id)));

  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} className="mb-8" />

      <header className="max-w-2xl">
        <p className="label-caps">Search</p>
        {q ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Results for &ldquo;{q}&rdquo;
            </h1>
            <p className="label-caps mt-3" aria-live="polite">
              {result.total} product{result.total === 1 ? "" : "s"} found
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              What are you installing?
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              Use the search bar above — try a model number or a category like &ldquo;dome camera&rdquo;.
            </p>
          </>
        )}
      </header>

      {cards.length > 0 ? (
        <ProductGrid products={cards} wishlistIds={[...wishlistIds]} className="mt-10" />
      ) : (
        <EmptyState
          icon={SearchX}
          title={q ? "Nothing matched that search." : "The shelf is waiting."}
          body={
            q
              ? "Check the spelling or try a shorter term — the catalog covers cameras, recorders, storage, monitors, cables and connectors."
              : "Browse the full catalog to see everything stocked at our Surat hub."
          }
          className="mt-10 rounded-lg border border-border bg-card"
        >
          {CATEGORY_CHIPS.map((chip) => (
            <Link
              key={chip.href}
              href={chip.href}
              className="rounded-full border border-border bg-background px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {chip.label}
            </Link>
          ))}
        </EmptyState>
      )}
    </div>
  );
}
