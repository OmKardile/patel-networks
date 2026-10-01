import type { Metadata } from "next";
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
import { PromoBanner } from "@/components/storefront/promo-banner";
import { TradeClubBand } from "@/components/storefront/trade-club-band";
import { CollectionSection } from "@/components/storefront/collection-section";
import { CategorySection } from "@/components/storefront/category-section";
import { ReviewCard, ReviewSection, type HomeReview } from "@/components/storefront/review-section";
import { EditorialSection } from "@/components/storefront/editorial-section";
import { StoreSection } from "@/components/storefront/store-section";
import { CorporateSection } from "@/components/storefront/corporate-section";
import { FeaturedIn } from "@/components/storefront/featured-in";
import { MarqueeBand } from "@/components/storefront/marquee-band";
import { QuickShopRail, type RailSpotlight } from "@/components/storefront/quick-shop-rail";
import { ExclusiveSeries, type SeriesTile } from "@/components/storefront/exclusive-series";
import { RatingsBand } from "@/components/storefront/ratings-band";

// Homepage — exact mirror of the owner-approved reference homepage, top to
// bottom: quick-shop rail → hero → dark trust band → brand statement →
// trade-club band (OTP account + WhatsApp QR) → promo → exclusive series →
// sage New Launches rail → promo → customer stories → cream Best Seller rail
// → brand reviews → ratings band → shop by category → store → corporate →
// authorised brands band → marquee. Newsletter lives in the footer (reference
// position). Server component reading the DB directly; every service call is
// defensive (a thin DB degrades the page, never breaks it) and thin sections
// self-hide instead of fabricating content.

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
  // A de-dup picker guarantees the four editorial tiles never repeat the same
  // photo (a thin DB falls back to real product shots before letter tiles).
  const bySlug = new Map(categoryTree.map((category) => [category.slug, category]));
  const imagePool = [
    ...arrivals.map((card) => card.images[0]?.url),
    ...bestSellerRail.map((card) => card.images[0]?.url),
    ...categoryTree.map((category) => category.imageUrl),
  ].filter((url): url is string => Boolean(url));
  const usedImages = new Set<string>();
  const pickImage = (preferred?: string | null): string | undefined => {
    if (preferred && !usedImages.has(preferred)) {
      usedImages.add(preferred);
      return preferred;
    }
    const next = imagePool.find((url) => !usedImages.has(url));
    if (next) usedImages.add(next);
    return next;
  };
  const seriesTiles: SeriesTile[] = [
    {
      title: "Complete CCTV Kits",
      caption: "Recorder + cameras + storage — bundle discount applied automatically",
      href: "/kit-builder",
      imageUrl: pickImage(bySlug.get("cctv-surveillance")?.imageUrl),
    },
    ...["cctv-surveillance", "displays-screens", "cables-wiring"]
      .map((slug) => bySlug.get(slug))
      .filter((category): category is NonNullable<typeof category> => Boolean(category))
      .map((category) => ({
        title: category.name,
        caption:
          category.children.length > 0
            ? `${category.children.length} ${category.children.length === 1 ? "range" : "ranges"} in stock`
            : "Shop the range",
        href: `/products?category=${category.slug}`,
        imageUrl: pickImage(category.imageUrl),
      })),
  ];

  // Promo bands — real category imagery with honest copy (self-hide without
  // an image; a real product photo is the fallback so thin DBs still show).
  const cctvImage =
    bySlug.get("cctv-surveillance")?.imageUrl ?? arrivals[0]?.images[0]?.url ?? undefined;
  const wiringImage =
    bySlug.get("cables-wiring")?.imageUrl ?? bestSellerRail[0]?.images[0]?.url ?? undefined;

  return (
    <div>
      {/* sr-only h1 — the banner hero keeps slide titles as h2s (reference-minimal) */}
      {slides.length > 0 ? (
        <h1 className="sr-only">
          {STORE.name} — {STORE.tagline}
        </h1>
      ) : null}

      {/* Reference row 1 — quick-shop rail above the hero */}
      <QuickShopRail
        categories={categoryTree}
        spotlight={
          {
            newArrivals: arrivals[0]?.images[0]?.url,
            kitBuilder: bestSellerRail.find((card) => card.images[0]?.url)?.images[0]?.url,
            allProducts: categoryTree[0]?.imageUrl ?? undefined,
          } satisfies RailSpotlight
        }
      />

      {/* Reference row 2 — hero campaign (DB banners / ivory fallback) */}
      <HeroCarousel slides={slides} />

      {/* Reference row 3 — dark trust band (real stats + constant commitments) */}
      <div className="pt-3 md:pt-4">
        <TrustStrip
          stats={{
            deliveredOrders: socialProof.deliveredOrders,
            customers: socialProof.customers,
            reviewCount: socialProof.reviewCount,
            avgRating: socialProof.avgRating,
          }}
        />
      </div>

      {/* Reference row 4 — brand statement (green heading, centered) */}
      <EditorialSection
        variant="statement"
        title="Honest specs. Genuine stock. Real support."
        body={editorialBody}
        ctaHref="/about"
        ctaLabel="About the store"
        headingId="why-patel-networks-heading"
      />

      {/* Reference row 5 — trade-club band (OTP account + WhatsApp QR) */}
      <TradeClubBand
        whatsappUrl={`https://wa.me/${STORE.whatsapp}`}
        deliveredOrders={socialProof.deliveredOrders}
        dispatchCutoff={STORE.dispatchCutoff}
      />

      {/* Reference row 6 — full-bleed promo (surveillance line-up) */}
      {cctvImage ? (
        <PromoBanner
          imageUrl={cctvImage}
          imageAlt="Surveillance cameras in stock at the Surat counter"
          eyebrow="Protect first"
          title="Outdoor-ready surveillance line-up"
          tone="dark"
          align="right"
          ctaHref="/products?category=cctv-surveillance"
          ctaLabel="Shop now"
          className="mt-10 md:mt-14"
        />
      ) : null}

      {/* Reference row 7 — exclusive series: 4 editorial collection tiles */}
      <div className="pt-12 md:pt-16">
        <ExclusiveSeries tiles={seriesTiles} />
      </div>

      {/* Reference row 8 — sage New Launches rail */}
      <div className="pt-12 md:pt-16">
        <ProductCarousel
          title="New Launches"
          href="/new-arrivals"
          linkLabel="View all"
          headingId="new-arrivals-heading"
          products={arrivals}
          wishlistIds={wishlistIds}
          tone="sage"
          badge="New"
        />
      </div>

      {/* Reference row 9 — full-bleed promo (wiring line-up) */}
      {wiringImage ? (
        <PromoBanner
          imageUrl={wiringImage}
          imageAlt="Copper wiring and cables in stock"
          eyebrow="Presenting"
          title="Copper-grade wiring, in stock"
          tone="light"
          align="right"
          ctaHref="/products?category=cables-wiring"
          ctaLabel="Shop now"
          className="mt-12 md:mt-16"
        />
      ) : null}

      {/* Reference row 10 — customer stories (approved reviews, product-bound) */}
      <ReviewSection reviews={reviews} />

      {/* Reference row 11 — cream Best Seller rail */}
      <div className="px-0">
        <ProductCarousel
          title="Best Seller"
          href="/products?sort=popular"
          linkLabel="View all"
          headingId="best-sellers-heading"
          products={bestSellerRail}
          wishlistIds={wishlistIds}
          tone="cream"
          badge="Best Seller"
        />
      </div>

      {/* Reference row 12 — brand reviews wall (real approved count, hides at 0) */}
      {approvedReviewCount > 0 && reviews.length > 0 ? (
        <CollectionSection
          eyebrow="Reviews"
          title="Brand reviews"
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

      {/* Reference row 13 — cream ratings band (real counts only) */}
      <div className="pb-12 md:pb-16">
        <RatingsBand
          avgRating={socialProof.avgRating}
          reviewCount={socialProof.reviewCount}
          deliveredOrders={socialProof.deliveredOrders}
        />
      </div>

      {/* Reference row 14 — shop by category (real tabs over real groups) */}
      <CategorySection categories={categoryTree} />

      {/* Reference row 15 — store section: Surat trade desk */}
      <div className="pt-12 md:pt-16">
        <StoreSection />
      </div>

      {/* Reference row 16 — corporate & bulk orders → /corporate (real B2B form) */}
      <div className="pt-3 md:pt-4">
        <CorporateSection />
      </div>

      {/* Reference row 17 — authorised brands (real, NO fake press) */}
      <div className="pt-3 md:pt-4">
        <FeaturedIn brands={brands} />
      </div>

      {/* Reference row 18 — marquee band above the footer */}
      <div className="pt-12 md:pt-16">
        <MarqueeBand
          items={[
            "Security & connectivity",
            "Surat, Gujarat",
            "Genuine stock, GST invoices",
            `Same-day dispatch before ${STORE.dispatchCutoff}`,
          ]}
        />
      </div>
    </div>
  );
}
