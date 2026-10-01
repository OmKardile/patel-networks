import type { Metadata } from "next";
import {
  Headset,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { db } from "@/lib/db";
import { STORE } from "@/lib/constants";
import { mapProductCard } from "@/lib/serializers";
import {
  getBestSellerProducts,
  getBrands,
  getCategoryTree,
  getHomeSocialProof,
  getNewArrivals,
  getPriceAndRating,
} from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { HeroCarousel, type HeroSlide } from "@/components/storefront/hero-carousel";
import { TrustStrip } from "@/components/storefront/trust-strip";
import { CollectionSection } from "@/components/storefront/collection-section";
import { CategorySection } from "@/components/storefront/category-section";
import { ReviewCard, ReviewSection, type HomeReview } from "@/components/storefront/review-section";
import { EditorialSection } from "@/components/storefront/editorial-section";
import { StoreSection } from "@/components/storefront/store-section";
import { CorporateSection } from "@/components/storefront/corporate-section";
import { FeaturedIn } from "@/components/storefront/featured-in";
import { QuickShopRail } from "@/components/storefront/quick-shop-rail";
import { ExclusiveSeries, type SeriesTile } from "@/components/storefront/exclusive-series";

// Homepage — mirror of the live reference homepage, full page, top to bottom:
// quick-shop rail → hero → trust strip → brand statement → exclusive series →
// new launches → customer stories → best sellers → reviews wall → ratings band
// → shop by category (tabs) → store → corporate → featured-in. Newsletter
// lives in the footer (reference position). Server component reading the DB
// directly; every service call is defensive (a thin DB degrades the page,
// never breaks it) and thin sections self-hide instead of fabricating content.

export const metadata: Metadata = {
  title: `${STORE.name} — CCTV & Networking Hardware, ${STORE.city}`,
  description: STORE.tagline,
};

type PrismaProductCard = Awaited<ReturnType<typeof getNewArrivals>>[number];
type PriceEnrichment = Awaited<ReturnType<typeof getPriceAndRating>>;

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[home] data load failed:", error);
    return fallback;
  }
}

export default async function HomePage() {
  const session = await getCustomerSession().catch(() => null);

  const [
    banners,
    bestSellers,
    newArrivals,
    categoryTree,
    brandRows,
    socialProof,
    reviewRows,
    approvedReviewCount,
    wishlist,
  ] = await Promise.all([
    safe(
      () =>
        db.banner.findMany({
          where: { placement: "HOME_HERO", isActive: true },
          orderBy: { sortOrder: "asc" },
        }),
      [],
    ),
    safe(() => getBestSellerProducts(12), []),
    safe(() => getNewArrivals(12), []),
    safe(() => getCategoryTree(), []),
    safe(() => getBrands(), []),
    safe(
      () => getHomeSocialProof(),
      { avgRating: 0, reviewCount: 0, deliveredOrders: 0, customers: 0, quotes: [] },
    ),
    safe(
      () =>
        db.review.findMany({
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 6,
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
            user: { select: { fullName: true } },
          },
        }),
      [],
    ),
    safe(() => db.review.count({ where: { isApproved: true } }), 0),
    safe(() => getWishlistProductIds(session?.userId ?? null), new Set<string>()),
  ]);

  // Card contract: ApiProductCard via mapProductCard + getPriceAndRating.
  const reviewProductIds = [...new Set(reviewRows.map((review) => review.productId))];
  const enrich = await safe(
    () =>
      getPriceAndRating([
        ...new Set([
          ...bestSellers.map((product) => product.id),
          ...newArrivals.map((product) => product.id),
          ...reviewProductIds,
        ]),
      ]),
    {
      minPrice: new Map<string, number>(),
      ratings: new Map<string, { avg: number; count: number }>(),
    } satisfies PriceEnrichment,
  );
  const toCard = (product: PrismaProductCard) =>
    mapProductCard(product, enrich.minPrice.get(product.id) ?? 0, enrich.ratings.get(product.id));

  const bestSellerRail = bestSellers.map(toCard);
  const arrivals = newArrivals.map(toCard);
  const wishlistIds = [...wishlist];

  const slides: HeroSlide[] = banners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle ?? undefined,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl ?? undefined,
  }));

  const brands = brandRows.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl ?? undefined,
  }));

  const reviews: HomeReview[] = reviewRows.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    isVerified: review.isVerified,
    createdAt: review.createdAt,
    authorName: review.user?.fullName ?? null,
    productName: review.product.name,
    productSlug: review.product.slug,
    productImageUrl: review.product.images[0]?.url ?? null,
    productRating: enrich.ratings.get(review.productId),
  }));

  // Brand statement copy — grounded in constants + the real brand rows.
  const brandNames = brandRows.slice(0, 3).map((brand) => brand.name);
  const editorialBody = brandNames.length
    ? `Authorised distribution for ${brandNames.join(", ")} and more — genuine stock, GST invoice on every order, and same-day dispatch from our ${STORE.city} counter when paid orders land before ${STORE.dispatchCutoff}.`
    : `Genuine stock, GST invoice on every order, and same-day dispatch from our ${STORE.city} counter when paid orders land before ${STORE.dispatchCutoff}.`;

  // Exclusive series tiles — the kit-builder bundle + real root collections.
  const bySlug = new Map(categoryTree.map((category) => [category.slug, category]));
  const kitImage = bySlug.get("cctv-surveillance")?.imageUrl ?? undefined;
  const seriesTiles: SeriesTile[] = [
    {
      title: "Complete CCTV Kits",
      caption: "Recorder + cameras + storage — bundle discount applied automatically",
      href: "/kit-builder",
      imageUrl: kitImage,
    },
    ...["cctv-surveillance", "displays-screens", "cables-wiring"]
      .map((slug) => bySlug.get(slug))
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .map((category) => ({
        title: category.name,
        caption: `${category.children.length} ${category.children.length === 1 ? "range" : "ranges"} in stock`,
        href: `/products?category=${category.slug}`,
        imageUrl: category.imageUrl ?? undefined,
      })),
  ];

  return (
    <div>
      {/* sr-only h1 — the banner hero keeps slide titles as h2s (reference-minimal) */}
      {slides.length > 0 ? (
        <h1 className="sr-only">
          {STORE.name} — {STORE.tagline}
        </h1>
      ) : null}

      {/* Row 3a — quick-shop rail ABOVE the hero, exactly like the reference */}
      <QuickShopRail categories={categoryTree} />

      {/* Row 3 — hero campaign (DB banners / ivory fallback) */}
      <HeroCarousel slides={slides} />

      {/* Row 4 — trust strip (real stats + constant commitments) */}
      <TrustStrip
        stats={{
          deliveredOrders: socialProof.deliveredOrders,
          customers: socialProof.customers,
          reviewCount: socialProof.reviewCount,
          avgRating: socialProof.avgRating,
        }}
      />

      {/* Row 5 — brand statement (1 message, 1 link — reference pattern) */}
      <EditorialSection
        eyebrow="Why Patel Networks"
        title="Specified right, installed once"
        body={editorialBody}
        imageUrl={categoryTree[0]?.imageUrl ?? undefined}
        imageAlt={categoryTree[0]?.name ? `${categoryTree[0].name} range` : undefined}
        ctaHref="/about"
        ctaLabel="About the store"
        tone="sand"
        headingId="why-patel-networks-heading"
      />

      {/* Row 6 — exclusive series: 4 editorial collection tiles + View all */}
      <ExclusiveSeries tiles={seriesTiles} />

      {/* Row 7 — new launches */}
      <div className="pb-12 md:pb-16">
        <ProductCarousel
          eyebrow="Just landed"
          title="New arrivals"
          href="/new-arrivals"
          linkLabel="View all"
          headingId="new-arrivals-heading"
          products={arrivals}
          wishlistIds={wishlistIds}
        />
      </div>

      {/* Row 8 — customer story carousel (approved reviews, product-bound; self-hides below 3) */}
      <ReviewSection reviews={reviews} />

      {/* Row 9 — best sellers (self-hides when thin) */}
      <div className="pb-12 md:pb-16">
        <ProductCarousel
          eyebrow="Reorders"
          title="Best sellers"
          lede="What the trade desk ships most of."
          href="/products?sort=popular"
          linkLabel="View all"
          headingId="best-sellers-heading"
          products={bestSellerRail}
          wishlistIds={wishlistIds}
        />
      </div>

      {/* Row 10 — reviews wall with real approved count (hides at 0) */}
      {approvedReviewCount > 0 && reviews.length > 0 ? (
        <CollectionSection
          eyebrow="Reviews"
          title="Our customers speak for us"
          lede={`${approvedReviewCount.toLocaleString("en-IN")} verified reviews across the catalogue.`}
          headingId="reviews-wall-heading"
          className="py-12 md:py-16"
          contentClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </CollectionSection>
      ) : null}

      {/* Row 10b — trust validation band (real counts, hides at 0 reviews) */}
      <RatingsBand
        customers={socialProof.customers}
        avgRating={socialProof.avgRating}
        reviewCount={socialProof.reviewCount}
      />

      {/* Row 11 — shop by category (genuine tabs over real groups) */}
      <CategorySection categories={categoryTree} />

      {/* Row 12 — store section: Surat trade desk (inverted band) */}
      <StoreSection />

      {/* Row 13 — corporate & bulk orders → /corporate landing (real B2B form) */}
      <CorporateSection />

      {/* Row 14 — featured in: authorised partners (real brands, NO fake press) */}
      <FeaturedIn brands={brands} />
    </div>
  );
}

// RatingsBand — reference "The Ratings Say It All" band: one real-count
// headline + five genuine posture badges. Hidden entirely when there are no
// reviews (marketplace logos are honestly omitted — none are verifiable).
function RatingsBand({
  customers,
  avgRating,
  reviewCount,
}: {
  customers: number;
  avgRating: number;
  reviewCount: number;
}) {
  if (reviewCount === 0) return null;
  const headingId = "ratings-band-heading";

  const parts: string[] = [];
  if (customers > 0) parts.push(`Trusted by ${customers.toLocaleString("en-IN")}+ customers`);
  if (avgRating > 0) parts.push(`${avgRating.toFixed(1)}★ average`);
  const headline = `${parts.join(" · ")} across ${reviewCount.toLocaleString("en-IN")} verified reviews`;

  const badges = [
    { icon: ReceiptText, label: "GST invoice on every order" },
    { icon: ShieldCheck, label: "Brand warranty on hardware" },
    { icon: Truck, label: `Same-day dispatch from ${STORE.city}` },
    { icon: LockKeyhole, label: "Secure Razorpay payments" },
    { icon: Headset, label: "Expert trade support" },
  ];

  return (
    <section aria-labelledby={headingId} className="border-y bg-card">
      <div className="container-inner py-10 md:py-14">
        <h2 id={headingId} className="text-center text-lg font-semibold tracking-tight sm:text-xl">
          {headline}
        </h2>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {badges.map((badge) => (
            <li key={badge.label} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <badge.icon aria-hidden className="h-4 w-4 text-success" />
              {badge.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
