import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBrandBySlug, getPriceAndRating } from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { mapProductCard } from "@/lib/serializers";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { ProductGrid } from "@/components/storefront/product-grid";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getBrandBySlug(slug);
  if (!result) return { title: "Brand not found", robots: { index: false, follow: false } };
  return {
    title: `${result.brand.name} — Products | Patel Networks`,
    description:
      result.brand.description ??
      `Browse ${result.brand.name} surveillance and networking hardware stocked by Patel Networks.`,
    robots: { index: true, follow: true },
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getBrandBySlug(slug);
  if (!result) notFound();

  const { brand, products } = result;
  const session = await getCustomerSession();
  const [enrich, wishlistIds] = await Promise.all([
    getPriceAndRating(products.map((p) => p.id)),
    getWishlistProductIds(session?.userId ?? null),
  ]);
  const cards = products.map((p) => mapProductCard(p, enrich.minPrice.get(p.id) ?? 0, enrich.ratings.get(p.id)));

  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Brands", href: "/brands" }, { label: brand.name }]}
        className="mb-8"
      />

      <header className="max-w-2xl border-b border-border pb-8">
        <p className="label-caps">Brand</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{brand.name}</h1>
        {brand.description ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{brand.description}</p>
        ) : null}
        <p className="label-caps mt-4 !text-[10px]">
          {brand._count.products} product{brand._count.products === 1 ? "" : "s"} in stock
        </p>
      </header>

      {cards.length > 0 ? (
        <ProductGrid products={cards} wishlistIds={[...wishlistIds]} className="mt-8" />
      ) : (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight">This brand is being restocked.</h2>
          <p className="mt-2 max-w-md text-[15px] text-muted-foreground">
            Our counter team updates stock weekly — call us for availability and sourcing timelines.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse all products
          </Link>
        </div>
      )}
    </div>
  );
}
