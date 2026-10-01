import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { getCategoryTree, getBrands, getPriceAndRating, listProducts } from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { mapProductCard } from "@/lib/serializers";
import { productQuerySchema } from "@/lib/validators";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { EmptyState } from "@/components/storefront/empty-state";
import { CatalogPagination } from "@/components/storefront/catalog-pagination";
import { SortControl } from "@/components/storefront/sort-control";
import { FiltersPanel, MobileFilters, type BrandFacet, type CatalogActiveParams } from "@/components/storefront/filter-drawer";

export const metadata: Metadata = {
  title: "All Products — CCTV, Surveillance & Networking",
  description:
    "Browse surveillance cameras, DVRs, NVRs, monitors, cables and connectors. Faceted catalog with price, resolution and availability filters.",
  robots: { index: true, follow: true },
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" && s.trim() !== "" ? s.trim() : undefined;
}

/** Frozen URL facets (q, category, brand, price, resolution, availability, rating, sort, page). */
function toActiveParams(sp: SearchParams): CatalogActiveParams {
  return {
    q: first(sp.q),
    category: first(sp.category),
    brand: first(sp.brand),
    minPrice: first(sp.minPrice),
    maxPrice: first(sp.maxPrice),
    resolution: first(sp.resolution),
    availability: first(sp.availability),
    minRating: first(sp.minRating),
    sort: first(sp.sort),
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const active = toActiveParams(sp);

  const parsed = productQuerySchema.safeParse({
    q: active.q,
    category: active.category,
    brand: active.brand,
    minPrice: active.minPrice,
    maxPrice: active.maxPrice,
    resolution: active.resolution,
    availability: active.availability,
    minRating: active.minRating,
    sort: active.sort,
  });
  const query = parsed.success ? parsed.data : productQuerySchema.parse({});

  const session = await getCustomerSession();
  const [tree, brandRows, result, wishlist] = await Promise.all([
    getCategoryTree(),
    getBrands(),
    listProducts(query),
    getWishlistProductIds(session?.userId ?? null),
  ]);
  const enrich = await getPriceAndRating(result.items.map((p) => p.id));
  const cards = result.items.map((p) => mapProductCard(p, enrich.minPrice.get(p.id) ?? 0, enrich.ratings.get(p.id)));

  const brands: BrandFacet[] = brandRows.map((b) => ({ id: b.id, name: b.name, slug: b.slug, productCount: b._count.products }));

  // Heading + breadcrumb resolve the active category against the tree; a stale
  // slug falls back to the flat "All products" view.
  let heading = "All products";
  let rootCrumb: { label: string; href: string } | null = null;
  if (active.category) {
    for (const root of tree) {
      if (root.slug === active.category) {
        heading = root.name;
        break;
      }
      const child = root.children.find((c) => c.slug === active.category);
      if (child) {
        rootCrumb = { label: root.name, href: `/products?category=${root.slug}` };
        heading = child.name;
        break;
      }
    }
  }

  const crumbs: { label: string; href?: string }[] = [{ label: "Home", href: "/" }];
  if (rootCrumb) crumbs.push(rootCrumb);
  crumbs.push({ label: heading });

  const facetParams: Record<string, string | undefined> = { ...active };

  return (
    <div className="container-inner py-10 md:py-14">
      <Breadcrumb items={crumbs} />

      <header className="mt-5">
        <h1 className="text-3xl font-semibold tracking-tight">{heading}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground" aria-live="polite">
          {result.total} product{result.total === 1 ? "" : "s"}
        </p>
      </header>

      {/* Catalog toolbar — mobile filters + sort (desktop keeps the aside) */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-border py-3">
        <div className="lg:hidden">
          <MobileFilters tree={tree} brands={brands} active={active} resultCount={result.total} />
        </div>
        <div className="ml-auto">
          <SortControl params={facetParams} />
        </div>
      </div>

      <div className="mt-8 flex gap-10">
        {/* Desktop facet rail */}
        <aside className="hidden w-60 shrink-0 lg:block" aria-label="Product filters">
          <div className="sticky top-24">
            <FiltersPanel tree={tree} brands={brands} active={active} />
          </div>
        </aside>

        <section className="min-w-0 flex-1" aria-label="Product results">
          {cards.length > 0 ? (
            <ProductGrid products={cards} wishlistIds={[...wishlist]} />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title="No products match these filters"
              body={
                active.q
                  ? `Nothing in the catalog matches “${active.q}” with the current filters.`
                  : "Try widening the price range or clearing a filter — everything stocked at the Surat hub is listed here."
              }
            >
              <a
                href="/products"
                className="inline-flex min-h-[44px] items-center rounded-full border border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-foreground/40"
              >
                Clear all filters
              </a>
            </EmptyState>
          )}

          <CatalogPagination page={result.page} totalPages={result.totalPages} params={facetParams} />
        </section>
      </div>
    </div>
  );
}
