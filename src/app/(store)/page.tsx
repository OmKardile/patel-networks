import {
  getCategoryTree,
  getBrands,
  getBestSellerProducts,
  getNewArrivals,
  getHomeSocialProof,
  getPriceAndRating,
} from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { mapProductCard } from "@/lib/serializers";
import { db } from "@/lib/db";
import { RecentlyViewedRail } from "@/components/storefront/recently-viewed";
import { HeroCarousel, type HeroSlide } from "@/components/storefront/home/hero-carousel";
import { TrustStrip } from "@/components/storefront/home/trust-strip";
import { ProductCarousel } from "@/components/storefront/home/product-carousel";
import { EditorialStory } from "@/components/storefront/home/editorial-story";
import { CustomerStories, type HomeReview } from "@/components/storefront/home/customer-stories";
import { ReviewsWall } from "@/components/storefront/home/reviews-wall";
import { RatingsBand } from "@/components/storefront/home/ratings-band";
import { UseCaseTiles } from "@/components/storefront/home/use-case-tiles";
import { StoreBand } from "@/components/storefront/home/store-band";
import { CorporateBand } from "@/components/storefront/home/corporate-band";
import { FeaturedIn } from "@/components/storefront/home/featured-in";
import { NewsletterBand } from "@/components/storefront/home/newsletter-band";

// Storefront homepage — Task 50-a structural-fidelity rebuild. The section
// sequence follows the verified neemans.com inventory (docs/NEEMANS-BLUEPRINT.md
// §1.2) while every word, number and image is genuine client content from the
// live DB and the frozen constants (§2 mapping). Same database, same frozen
// contracts (§5) — presentation only.

export default async function HomePage() {
  const session = await getCustomerSession();
  const [tree, newArrivals, bestSellers, brands, social, wishlistIds, heroBanners, latestReviews, reviewCount] =
    await Promise.all([
      getCategoryTree(),
      getNewArrivals(8),
      getBestSellerProducts(16), // splits across the two seller rails below
      getBrands(),
      getHomeSocialProof(),
      getWishlistProductIds(session?.userId ?? null),
      // Blueprint §2: hero slides read directly (read-only) from the Banner table
      db.banner.findMany({ where: { isActive: true, placement: "HOME_HERO" }, orderBy: { sortOrder: "asc" } }),
      // Blueprint §2: customer stories + reviews wall share one approved-review query
      db.review.findMany({
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { fullName: true } },
        },
      }),
      db.review.count({ where: { isApproved: true } }),
    ]);

  const { minPrice, ratings } = await getPriceAndRating([
    ...new Set([...newArrivals, ...bestSellers].map((p) => p.id)),
  ]);

  const toCard = (p: (typeof newArrivals)[number]) => mapProductCard(p, minPrice.get(p.id) ?? 0, ratings.get(p.id));
  const featuredPicks = bestSellers.slice(0, 8).map(toCard);
  const bestSellerRail = bestSellers.slice(8, 16).map(toCard);
  const newArrivalCards = newArrivals.map(toCard);

  const heroSlides: HeroSlide[] = heroBanners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    imageUrl: b.imageUrl,
    linkUrl: b.linkUrl,
  }));

  const homeReviews: HomeReview[] = latestReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString(),
    authorName: r.user.fullName,
    productName: r.product.name,
    productSlug: r.product.slug,
  }));

  return (
    <div>
      {/* 1 · HERO — campaign carousel; falls back to the ivory hero with zero banners */}
      <HeroCarousel slides={heroSlides} />

      {/* 2 · TRUST STRIP — five compact promises, one real-stats pill */}
      <TrustStrip
        deliveredOrders={social.deliveredOrders}
        customers={social.customers}
        reviewCount={social.reviewCount}
        avgRating={social.avgRating}
      />

      {/* 3 · FEATURED COLLECTION — "Trade Desk Picks", the exclusive-series analog */}
      <section aria-labelledby="featured-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <ProductCarousel
          headingId="featured-heading"
          eyebrow="Trade Desk Picks"
          title="Our exclusive series."
          lede="The SKUs our counter recommends first — ranked by real reorders, stock-backed and ready to dispatch."
          href="/products"
          linkLabel="Shop all"
          products={featuredPicks}
          wishlistIds={[...wishlistIds]}
        />
      </section>

      {/* 4 · EDITORIAL STORY — the kit builder, a real product family */}
      <EditorialStory
        headingId="story-heading"
        eyebrow="The kit builder"
        title="One kit. Everything wired."
        body="Pick a recorder, cameras bounded by channels, surveillance storage, cabling and connectors — the builder sizes the load and applies an automatic 5% bundle discount on the lot, GST-inclusive. One spec, one invoice, one dispatch."
        imageUrl="/images/seed/nvr/01.jpg"
        imageAlt="Network video recorder and surveillance cameras staged as a complete CCTV kit"
        ctaHref="/kit-builder"
        ctaLabel="Build a CCTV kit"
        secondaryHref="/products?category=cctv-surveillance"
        secondaryLabel="Shop CCTV & Surveillance"
      />

      {/* 5 · CUSTOMER STORIES — hidden entirely when fewer than 3 approved reviews */}
      {homeReviews.length >= 3 && (
        <section
          aria-labelledby="customer-stories-heading"
          className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20"
        >
          <CustomerStories reviews={homeReviews} />
        </section>
      )}

      {/* 6 · NEW ARRIVALS — the fresh-stock rail */}
      {newArrivalCards.length > 0 && (
        <section aria-labelledby="new-heading" className="border-y border-border bg-card/60">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
            <ProductCarousel
              headingId="new-heading"
              eyebrow="Just landed"
              title="New arrivals at the counter."
              lede="The freshest stock on the shelves — listed the day it lands."
              href="/products?sort=newest"
              linkLabel="Shop new"
              products={newArrivalCards}
              wishlistIds={[...wishlistIds]}
            />
          </div>
        </section>
      )}

      {/* 7 · BEST SELLERS — the reorder rail, ranks nine and up */}
      {bestSellerRail.length > 0 && (
        <section aria-labelledby="best-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
          <ProductCarousel
            headingId="best-heading"
            eyebrow="Best sellers"
            title="The reorder list, continued."
            lede="More of what installers and integrators actually reorder — ranked by real order lines, not placement."
            href="/products"
            linkLabel="Shop all"
            products={bestSellerRail}
            wishlistIds={[...wishlistIds]}
          />
        </section>
      )}

      {/* 8 · REVIEWS WALL — aggregate count + recent approved reviews */}
      <ReviewsWall reviewCount={reviewCount} reviews={homeReviews.slice(0, 6)} />

      {/* 9 · RATINGS BAND — genuine posture badges, no marketplace logos */}
      <RatingsBand />

      {/* 10 · USE-CASE TILES — the category circles as a discovery band */}
      <UseCaseTiles categories={tree} />

      {/* 11 · STORE BAND — the Surat trade desk, real address & channels */}
      <StoreBand />

      {/* 12 · CORPORATE & BULK — the B2B path to the contact form */}
      <CorporateBand />

      {/* 13 · FEATURED IN — authorised distribution & service partners */}
      <FeaturedIn brands={brands} />

      {/* 14 · RECENTLY VIEWED — client-side rail, renders only when non-empty */}
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <RecentlyViewedRail />
      </div>

      {/* 15 · NEWSLETTER — the closing band, genuine WhatsApp-deal CTA */}
      <NewsletterBand />
    </div>
  );
}
