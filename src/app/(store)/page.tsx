import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  PackageCheck,
  Quote,
  Receipt,
  Star,
  Truck,
} from "lucide-react";
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
import { ProductCard } from "@/components/storefront/product-card";
import { RecentlyViewedRail } from "@/components/storefront/recently-viewed";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

// Storefront homepage — rebuilt from zero on the Neeman's system: warm greige
// canvas, ivory-radial hero, category circles, editorial sections alternating
// SHOP → DISCOVER → TRUST, all data from the live DB (same database).

const COMMITMENTS = [
  { icon: BadgeCheck, title: "100% genuine stock", note: "Brand-authorized, serial-tracked" },
  { icon: Truck, title: "Same-day dispatch", note: "Orders confirmed before 4:00 PM IST" },
  { icon: Receipt, title: "GST tax invoices", note: "Input-credit ready, every order" },
  { icon: PackageCheck, title: "7-day DOA cover", note: "Pan-India delivery from Surat" },
];

function SectionHead({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="label-caps">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
        {lede && <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{lede}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="link-underline hidden shrink-0 text-sm font-medium sm:block">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export default async function HomePage() {
  const session = await getCustomerSession();
  const [tree, newArrivals, bestSellers, brands, social, wishlistIds] = await Promise.all([
    getCategoryTree(),
    getNewArrivals(8),
    getBestSellerProducts(8),
    getBrands(),
    getHomeSocialProof(),
    getWishlistProductIds(session?.userId ?? null),
  ]);

  const { minPrice, ratings } = await getPriceAndRating([
    ...new Set([...newArrivals, ...bestSellers].map((p) => p.id)),
  ]);

  const toCard = (p: (typeof newArrivals)[number]) => mapProductCard(p, minPrice.get(p.id) ?? 0, ratings.get(p.id));
  const newArrivalCards = newArrivals.map(toCard);
  const bestSellerCards = bestSellers.map(toCard);

  return (
    <div>
      {/* ============ HERO — ivory radial, sans display, commitments ============ */}
      <section className="relative overflow-hidden border-b border-border bg-hero-ivory">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="label-caps">Authorized distribution · Surat, Gujarat</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Surveillance &amp; networking hardware, specified right the first time.
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Genuine Hikvision, Dahua, CP Plus and D-Link equipment for homes, installers and system integrators —
              with SKU-level stock you can actually rely on, GST tax invoices and pan-India dispatch.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-7 text-base">
                <Link href="/products">
                  Shop the catalog <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
                <Link href="/kit-builder">Build a CCTV kit</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              10 authorized brands · B2B GSTIN billing · Same-day dispatch before 4 PM IST
            </p>
          </div>

          {/* commitment panel — the store's promises, immediately visible */}
          <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
            {COMMITMENTS.map(({ icon: Icon, title, note }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-5 shadow-whisper">
                <Icon className="h-5 w-5 text-success" aria-hidden />
                <p className="mt-3 text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SHOP BY CATEGORY — circles ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="categories-heading">
        <SectionHead
          eyebrow="Shop by category"
          title="Find the hardware for the job."
          lede="Cameras, recorders, displays, cable and optical — every range stocked at SKU level."
        />
        <h2 id="categories-heading" className="sr-only">
          Shop by category
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          {tree.map((root, i) => (
            <Reveal key={root.id} delay={i * 60}>
              <Link href={`/products?category=${root.slug}`} className="group flex flex-col items-center text-center">
                <span className="flex aspect-square w-full max-w-[190px] items-center justify-center overflow-hidden rounded-full border border-border bg-card shadow-whisper transition-all duration-200 group-hover:shadow-lift">
                  {root.imageUrl ? (
                    <img
                      src={root.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <Camera className="h-10 w-10 text-muted-foreground" aria-hidden />
                  )}
                </span>
                <span className="mt-3 text-sm font-medium leading-snug">{root.name}</span>
                {root.children.length > 0 && (
                  <span className="mt-0.5 text-[11px] text-muted-foreground">
                    {root.children.length} range{root.children.length === 1 ? "" : "s"}
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ NEW ARRIVALS ============ */}
      {newArrivalCards.length > 0 && (
        <section className="border-y border-border bg-card/60" aria-labelledby="new-heading">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <h2 id="new-heading" className="sr-only">
              New arrivals
            </h2>
            <SectionHead
              eyebrow="Just landed"
              title="New arrivals at the counter."
              lede="The freshest stock on the shelves — listed the day it lands."
              href="/products?sort=newest"
              linkLabel="Shop new"
            />
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {newArrivalCards.slice(0, 4).map((card) => (
                <ProductCard key={card.id} product={card} wishlisted={wishlistIds.has(card.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ BEST SELLERS — the reorder list ============ */}
      {bestSellerCards.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="best-heading">
          <h2 id="best-heading" className="sr-only">
            Best sellers
          </h2>
          <SectionHead
            eyebrow="Best sellers"
            title="The reorder list."
            lede="Ranked by what installers and integrators actually reorder — not by who paid for placement."
            href="/products"
            linkLabel="Shop all"
          />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {bestSellerCards.slice(0, 8).map((card, i) => (
              <Reveal key={card.id} delay={Math.min(i, 3) * 60}>
                <ProductCard product={card} wishlisted={wishlistIds.has(card.id)} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ SOCIAL PROOF — real numbers, real reviews ============ */}
      {social && social.reviewCount > 0 && (
        <section className="border-y border-border bg-brand text-brand-foreground" aria-labelledby="proof-heading">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <div>
                <p className="label-caps !text-brand-foreground/70">Verified by buyers</p>
                <h2 id="proof-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                  The counter, trusted India-wide.
                </h2>
                <dl className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-brand-foreground/70">Orders delivered</dt>
                    <dd className="font-display text-3xl font-semibold">{social.deliveredOrders}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-foreground/70">Customers served</dt>
                    <dd className="font-display text-3xl font-semibold">{social.customers}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-foreground/70">Average rating</dt>
                    <dd className="font-display text-3xl font-semibold">
                      {social.avgRating.toFixed(1)}
                      <span className="text-base font-normal text-brand-foreground/70"> / 5</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-brand-foreground/70">Verified reviews</dt>
                    <dd className="font-display text-3xl font-semibold">{social.reviewCount}</dd>
                  </div>
                </dl>
              </div>
              <ul className="space-y-4">
                {social.quotes.map((q, i) => (
                  <li key={`${q.productSlug}-${i}`} className="rounded-xl border border-brand-foreground/15 bg-brand-foreground/[0.06] p-5">
                    <div className="flex items-center gap-1" aria-label={`${q.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${s < q.rating ? "fill-star text-star" : "text-brand-foreground/30"}`}
                          aria-hidden
                        />
                      ))}
                    </div>
                    {q.comment && (
                      <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
                        <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                        {q.comment}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-brand-foreground/75">
                      {q.authorName ?? "Verified buyer"} · verified purchase
                      {q.productSlug && q.productName && (
                        <>
                          {" · "}
                          <Link
                            href={`/products/${q.productSlug}`}
                            className="underline underline-offset-2 hover:text-brand-foreground"
                          >
                            {q.productName}
                          </Link>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ============ BRANDS ============ */}
      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="brands-heading">
          <h2 id="brands-heading" className="sr-only">
            Authorized brands
          </h2>
          <SectionHead
            eyebrow="Authorized brands"
            title="The counters we stand behind."
            href="/brands"
            linkLabel="All brands"
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {brands.slice(0, 10).map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="flex h-16 items-center justify-center rounded-xl border border-border bg-card px-4 text-center text-sm font-semibold tracking-tight shadow-whisper transition-all duration-200 hover:shadow-lift"
              >
                {b.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ RECENTLY VIEWED ============ */}
      <RecentlyViewedRail />

      {/* ============ FINAL CTA — trade desk ============ */}
      <section className="border-t border-border bg-sand text-sand-foreground" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <p className="label-caps !text-sand-foreground/70">Planning a full site?</p>
          <h2 id="cta-heading" className="mx-auto mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            One spec, one quote — cameras to cable.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand-foreground/80">
            Send us the site layout or channel count. The trade desk sizes the recorder, cameras, storage and cabling —
            with a GST quote you can take to your client.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 bg-primary px-7 text-base text-primary-foreground hover:bg-primary/90">
              <Link href="/contact">
                Talk to the trade desk <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-sand-foreground/30 px-7 text-base text-sand-foreground hover:bg-sand-foreground/10"
            >
              <Link href="/kit-builder">Use the kit builder</Link>
            </Button>
          </div>
          {social && social.deliveredOrders > 0 && (
            <p className="mt-6 text-xs text-sand-foreground/70">
              {social.deliveredOrders} orders delivered · {social.customers} customers · {social.avgRating.toFixed(1)}/5 from{" "}
              {social.reviewCount} verified reviews
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
