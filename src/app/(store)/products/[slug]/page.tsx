import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, PackageCheck, Receipt, ShieldCheck, Star, Truck, type LucideIcon } from "lucide-react";
import {
  getRelatedProducts,
  getPriceAndRating,
  getRatingDistribution,
  getProductBySlug,
} from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { mapProductCard } from "@/lib/serializers";
import { formatINR, paiseToRupees } from "@/lib/money";
import { COD_MAX_ORDER_VALUE_PAISE, FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import { Gallery } from "@/components/storefront/gallery";
import { VariantSelector } from "@/components/storefront/variant-selector";
import { PdpStickyBar } from "@/components/storefront/pdp-sticky-bar";
import { PincodeChecker } from "@/components/storefront/pincode-checker";
import { ReviewForm } from "@/components/storefront/review-form";
import { PriceRow } from "@/components/storefront/price-row";
import { Rating } from "@/components/storefront/rating";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** The PDP slice of the catalog row (service type is erased behind the include cast). */
interface PdpProduct {
  id: string;
  slug: string;
  name: string;
  shortDesc: string | null;
  modelNumber: string | null;
  isCodAllowed: boolean;
  warrantyMonths: number;
  specifications: string | null;
  documents: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  images: { url: string; altText: string | null }[];
  variants: { attributes: string; sku: { code: string } }[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    isVerified: boolean;
    createdAt: Date;
    user: { fullName: string } | null;
  }[];
}

function castProduct(raw: Awaited<ReturnType<typeof getProductBySlug>>): PdpProduct | null {
  return (raw as unknown as PdpProduct | null) ?? null;
}

/** specifications JSON → ordered {label, value} rows; tolerates object or {key,value}[] shapes. */
function specRows(raw: string | null): { label: string; value: string }[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.flatMap((row) => {
        if (row && typeof row === "object" && "key" in row && "value" in row) {
          const rec = row as Record<string, unknown>;
          return [{ label: String(rec.key), value: String(rec.value) }];
        }
        return [];
      });
    }
    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed as Record<string, unknown>).map(([label, value]) => ({ label, value: String(value) }));
    }
    return [];
  } catch {
    return [];
  }
}

/** documents JSON [{title,url}] → link rows; drops malformed entries. */
function documentLinks(raw: string | null): { title: string; url: string }[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (item && typeof item === "object" && typeof (item as Record<string, unknown>).url === "string") {
        const rec = item as Record<string, unknown>;
        const url = rec.url as string;
        const title = typeof rec.title === "string" && rec.title ? rec.title : url.split("/").pop() || "Document";
        return [{ title, url }];
      }
      return [];
    });
  } catch {
    return [];
  }
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = castProduct(await getProductBySlug(slug));
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };

  const title = product.metaTitle ?? `${product.name} | ${product.brand.name}`;
  const description = product.metaDescription ?? product.shortDesc ?? product.name;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    robots: { index: true, follow: true },
    openGraph: { title, description, type: "website" },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  const product = castProduct(raw);
  if (!product) notFound();

  const session = await getCustomerSession();
  const [enrich, related, wishlist, distribution] = await Promise.all([
    getPriceAndRating([product.id]),
    getRelatedProducts(product.id, product.category.id, 4),
    getWishlistProductIds(session?.userId ?? null),
    getRatingDistribution(product.id),
  ]);
  const rating = enrich.ratings.get(product.id) ?? null;

  const card = mapProductCard(
    raw as unknown as Parameters<typeof mapProductCard>[0],
    enrich.minPrice.get(product.id) ?? 0,
    rating ?? undefined,
  );
  const relatedCards = related.map((p) => mapProductCard(p, enrich.minPrice.get(p.id) ?? 0, enrich.ratings.get(p.id)));

  const specs = specRows(product.specifications);
  const docs = documentLinks(product.documents);
  const categoryHref = `/products?category=${product.category.slug}`;
  const inStock = card.inStock;

  // Specifications fallback — real variant attribute axes when no spec sheet exists.
  const specFallback = specs.length === 0
    ? card.attributes.map((key) => ({
        label: key,
        value: [...new Set(card.variants.map((v) => v.attributes[key]).filter(Boolean))].join(" / "),
      }))
    : specs;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc ?? product.metaDescription ?? product.name,
    sku: card.variants[0]?.skuCode,
    brand: { "@type": "Brand", name: product.brand.name },
    ...(card.images[0]?.url ? { image: [card.images[0].url] } : {}),
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.avg.toFixed(1),
            reviewCount: rating.count,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `/products/${product.slug}`,
      priceCurrency: "INR",
      price: paiseToRupees(card.priceFromPaise).toFixed(2),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  // Buy-box trust row — every claim is a catalog field or a frozen constant.
  const trustRow: { icon: LucideIcon; label: string }[] = [
    { icon: Banknote, label: product.isCodAllowed ? "Cash on delivery available" : "Prepaid only" },
    ...(product.warrantyMonths > 0 ? [{ icon: ShieldCheck, label: `${product.warrantyMonths}-month brand warranty` }] : []),
    { icon: Receipt, label: "GST invoice on every order" },
    { icon: Truck, label: `Dispatched from ${STORE.city} before ${STORE.dispatchCutoff}` },
  ];

  return (
    <div className="container-inner pb-28 pt-6 md:pb-14 md:pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.category.name, href: categoryHref },
          { label: product.name },
        ]}
      />

      {/* Above fold — gallery stage left (sticky), buy box right */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="self-start lg:sticky lg:top-24">
          <Gallery images={card.images} name={product.name} />
        </div>

        <div className="space-y-7">
          <div>
            <Link href={`/products?brand=${product.brand.slug}`} className="label-caps link-underline inline-block">
              {product.brand.name}
            </Link>
            <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
            {product.modelNumber ? (
              <p className="mt-2 text-[13px] text-muted-foreground">
                Model <span className="font-mono text-[12px] text-foreground">{product.modelNumber}</span>
              </p>
            ) : null}
            <a href="#reviews" className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              <Rating avg={rating ? rating.avg : null} count={rating?.count} />
              {!rating || rating.count === 0 ? <span>No reviews yet</span> : null}
            </a>
            {product.shortDesc ? <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{product.shortDesc}</p> : null}
          </div>

          <div>
            <PriceRow pricePaise={card.priceFromPaise} mrpPaise={card.mrpFromPaise} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of GST</p>
          </div>

          <VariantSelector product={card} initialWishlisted={wishlist.has(product.id)} />

          {/* Trust row */}
          <ul className="grid gap-x-6 gap-y-2 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
            {trustRow.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                <item.icon aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {item.label}
              </li>
            ))}
          </ul>

          <PincodeChecker />
        </div>
      </div>

      {/* Specifications — parsed spec sheet, or the real variant axes as fallback */}
      {specFallback.length > 0 ? (
        <section aria-label="Specifications" className="mt-14 border-t border-border pt-10 md:mt-16">
          <h2 className="label-caps">Specifications</h2>
          <div className="mt-6 max-w-3xl rounded-xl border border-border bg-card p-6 shadow-whisper sm:p-8">
            <dl className="grid gap-x-10 sm:grid-cols-2">
              {specFallback.map((row) => (
                <div key={row.label} className="border-b border-border py-3 text-[14px] last:border-0">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* Documents — datasheets & manuals straight from the catalog row */}
      {docs.length > 0 ? (
        <section aria-label="Documents" className="mt-14 border-t border-border pt-10 md:mt-16">
          <h2 className="label-caps">Documents</h2>
          <ul className="mt-4 space-y-1.5">
            {docs.map((doc) => (
              <li key={doc.url}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] text-foreground underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  {doc.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Delivery & returns — real policy routes and frozen constants */}
      <section aria-label="Delivery and returns" className="mt-14 border-t border-border pt-10 md:mt-16">
        <h2 className="label-caps">Delivery &amp; returns</h2>
        <dl className="mt-6 max-w-3xl divide-y divide-border rounded-xl border border-border bg-card px-6 shadow-whisper">
          <div className="py-4 text-[14px]">
            <dt className="text-muted-foreground">Dispatch</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              Ships from {STORE.city}, {STORE.originState} — paid orders before {STORE.dispatchCutoff} dispatch same day. Free shipping over{" "}
              {formatINR(FREE_SHIPPING_THRESHOLD_PAISE)}.{" "}
              <Link href="/shipping-policy" className="underline underline-offset-2 transition-opacity hover:opacity-70">
                Shipping policy
              </Link>
            </dd>
          </div>
          <div className="py-4 text-[14px]">
            <dt className="text-muted-foreground">Returns</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              7-day DOA replacement · serial-matched RMA.{" "}
              <Link href="/return-policy" className="underline underline-offset-2 transition-opacity hover:opacity-70">
                Return &amp; warranty policy
              </Link>
            </dd>
          </div>
          {product.warrantyMonths > 0 ? (
            <div className="py-4 text-[14px]">
              <dt className="text-muted-foreground">Warranty</dt>
              <dd className="mt-0.5 font-medium text-foreground">
                {product.warrantyMonths}-month brand warranty — claims matched by serial number against your GST invoice.
              </dd>
            </div>
          ) : null}
          <div className="py-4 text-[14px]">
            <dt className="text-muted-foreground">Cash on Delivery</dt>
            <dd className="mt-0.5 font-medium text-foreground">
              {product.isCodAllowed
                ? `Available in serviceable COD zones on orders up to ${formatINR(COD_MAX_ORDER_VALUE_PAISE)} — check your PIN above.`
                : "Prepaid only for this item (above the COD order limit)."}
            </dd>
          </div>
        </dl>
      </section>

      {/* Reviews — average, distribution, approved list, then the form */}
      <section id="reviews" aria-label="Customer reviews" className="mt-14 scroll-mt-24 border-t border-border pt-10 md:mt-16">
        <h2 className="label-caps">Reviews</h2>
        <div className="mt-6 grid gap-10 lg:grid-cols-[280px_1fr]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold leading-none tracking-tight tabular-nums">{rating && rating.count > 0 ? rating.avg.toFixed(1) : "—"}</span>
              <span className="text-[13px] text-muted-foreground">/ 5</span>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {rating && rating.count > 0 ? `Based on ${rating.count} approved review${rating.count === 1 ? "" : "s"}` : "No approved reviews yet"}
            </p>

            {rating && rating.count > 0 ? (
              <dl className="mt-5 space-y-1.5" aria-label="Rating distribution">
                {distribution.map(({ rating: star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <dt className="flex w-9 shrink-0 items-center gap-0.5 tabular-nums">
                      {star}
                      <Star aria-hidden className="h-2.5 w-2.5 fill-star text-star" />
                    </dt>
                    <dd className="flex flex-1 items-center gap-2">
                      <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full bg-star/70"
                          style={{ width: `${Math.round((count / rating.count) * 100)}%` }}
                        />
                      </span>
                      <span className="w-5 text-right tabular-nums">{count}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <div className="space-y-8">
            {product.reviews.length > 0 ? (
              <ul className="space-y-7">
                {product.reviews.map((review) => (
                  <li key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} aria-hidden className={n <= review.rating ? "h-3.5 w-3.5 fill-star text-star" : "h-3.5 w-3.5 text-border"} />
                        ))}
                      </div>
                      {review.isVerified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          <PackageCheck aria-hidden className="h-3 w-3" /> Verified purchase
                        </span>
                      ) : null}
                      <span className="text-[12px] text-muted-foreground">
                        {review.user?.fullName ?? "Verified buyer"} ·{" "}
                        <time dateTime={new Date(review.createdAt).toISOString()}>{dateFormatter.format(new Date(review.createdAt))}</time>
                      </span>
                    </div>
                    {review.title ? <p className="mt-2 text-[16px] font-semibold leading-snug">{review.title}</p> : null}
                    {review.comment ? <p className="mt-1 text-[14px] leading-relaxed text-foreground/85">{review.comment}</p> : null}
                  </li>
                ))}
              </ul>
            ) : null}

            <ReviewForm productId={product.id} />
          </div>
        </div>
      </section>

      {/* Related — same-category carousel from real catalog rows */}
      <div className="mt-14 md:mt-16">
        <ProductCarousel
          eyebrow="Complete the install"
          title="You may also need"
          products={relatedCards}
          wishlistIds={[...wishlist]}
          href={categoryHref}
          linkLabel="View all"
        />
      </div>

      <div className="mt-14 md:mt-16">
        <RecentlyViewed
          current={{
            id: card.id,
            slug: card.slug,
            name: card.name,
            imageUrl: card.images[0]?.url ?? null,
            priceFromPaise: card.priceFromPaise,
            at: 0, // placeholder — recordRecent stamps the real timestamp on mount
          }}
        />
      </div>

      <PdpStickyBar product={card} />
    </div>
  );
}
