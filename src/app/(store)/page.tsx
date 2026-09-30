import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileText,
  Headset,
  RefreshCcw,
  Boxes,
  Truck,
  Star,
} from "lucide-react";
import {
  getCategoryTree,
  getFeaturedProducts,
  getBestSellerProducts,
  getNewArrivals,
  getHomeSocialProof,
  getBrands,
  getPriceAndRating,
} from "@/server/services/catalog.service";
import { getWishlistProductIds } from "@/server/services/wishlist.service";
import { getCustomerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { mapProductCard } from "@/lib/serializers";
import { ProductCard } from "@/components/storefront/product-card";
import { RecentlyViewedRail } from "@/components/storefront/recently-viewed";
import { ParallaxImage, ScrollDrift, BandDecor } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const KIT_STEPS = [
  { n: "01", title: "Recorder", body: "4/8/16-channel DVR (HD analog) or PoE NVR." },
  { n: "02", title: "Cameras", body: "Mix indoor domes & outdoor bullets — bounded by channels." },
  { n: "03", title: "Storage", body: "Surveillance HDD with retention-day estimate." },
  { n: "04", title: "Power & cable", body: "SMPS, coax/Cat6 rolls and connector packs." },
  { n: "05", title: "Add kit to cart", body: "One click, every SKU, 5% bundle discount." },
];

const TRUST_ITEMS = [
  { icon: BadgeCheck, title: "100% genuine, brand-authorized stock" },
  { icon: Truck, title: "Same-day dispatch before 4 PM IST" },
  { icon: FileText, title: "GST input-credit tax invoices" },
  { icon: RefreshCcw, title: "7-day DOA replacement" },
  { icon: Headset, title: "Trade-desk support on call" },
];

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < Math.round(rating) ? "fill-accent text-accent" : "fill-muted text-muted-foreground/30")}
          aria-hidden
        />
      ))}
    </span>
  );
}

export default async function HomePage() {
  const session = await getCustomerSession();
  const [categories, featuredRaw, bestRaw, newArrivalsRaw, brands, posts, wishlistIds, banners, social] =
    await Promise.all([
      getCategoryTree(),
      getFeaturedProducts(8),
      getBestSellerProducts(8),
      getNewArrivals(4),
      getBrands(),
      db.post.findMany({ where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, take: 3 }),
      getWishlistProductIds(session?.userId ?? null),
      db.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      getHomeSocialProof(),
    ]);

  const allIds = [...new Set([...featuredRaw, ...bestRaw, ...newArrivalsRaw].map((p) => p.id))];
  const enrich = await getPriceAndRating(allIds);
  const toCard = (p: (typeof featuredRaw)[number]) =>
    mapProductCard(p, enrich.minPrice.get(p.id) ?? 0, enrich.ratings.get(p.id));
  const featured = featuredRaw.map(toCard);
  const bestSellers = bestRaw.map(toCard);
  const newArrivals = newArrivalsRaw.map(toCard);

  const heroImage = categories.find((c) => c.slug === "cctv-surveillance")?.imageUrl;
  // Storefront consumes the Banner table (managed at /admin/banners):
  // HOME_HERO = full-bleed hero backdrop, HOME_STRIP = mid-page promo band.
  const heroBannerUrl = banners.find((b) => b.placement === "HOME_HERO")?.imageUrl ?? heroImage;
  const stripBanner = banners.find((b) => b.placement === "HOME_STRIP");

  const heroCopy = (
    <>
      <p className="label-caps">Authorized distribution · Surat, Gujarat</p>
      <h1 className="mt-4 font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
        Surveillance &amp; networking hardware,
        <span className="block italic text-primary">specified right the first time.</span>
      </h1>
      <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        Genuine Hikvision, Dahua, CP Plus and D-Link equipment for homes, installers and system integrators —
        with SKU-level stock you can actually rely on, GST tax invoices and pan-India dispatch.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild size="lg" className="rounded-full px-6">
          <Link href="/products">
            Shop the catalog <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full border-foreground/25 px-6">
          <Link href="/kit-builder">Build a CCTV kit</Link>
        </Button>
      </div>
      <p className="mt-6 text-[13px] text-muted-foreground">
        {brands.length} authorized brands · B2B GSTIN billing · Same-day dispatch before 4 PM IST
      </p>
    </>
  );

  return (
    <div>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden border-b border-border">
        {heroBannerUrl ? (
          <>
            {/* full-bleed backdrop (HOME_HERO banner) with scroll parallax + paper gradient for headline negative space */}
            <ParallaxImage src={heroBannerUrl} eager scale={1.18} from="0%" to="-8%" />
            <div aria-hidden className="absolute inset-0 bg-background/60 lg:hidden" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/55 via-38% to-transparent to-66%" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/55 from-0% to-transparent to-30%" />
          </>
        ) : null}
        <div className={`relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-6 ${heroBannerUrl ? "py-16 lg:py-28" : "py-12 lg:py-20"}`}>
          <ScrollDrift
            className={heroBannerUrl ? "lg:col-span-7" : "lg:col-span-6 xl:col-span-5"}
            lag={64}
            range={560}
            fadeTo={0.35}
            fadeRange={460}
          >
            {heroCopy}
          </ScrollDrift>
          {!heroBannerUrl && (
            <ScrollDrift className="relative lg:col-span-6 xl:col-span-7" lag={36} range={560}>
              <div className="relative ml-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-muted lg:ml-12 xl:ml-auto">
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Surveillance imagery</div>
              </div>
            </ScrollDrift>
          )}
        </div>
        {heroBannerUrl && (
          <ScrollDrift
            className="absolute bottom-6 right-4 hidden w-60 md:block"
            lag={-56}
            range={560}
          >
            <div className="rounded-lg border border-border/70 bg-card/85 p-4 shadow-sm backdrop-blur-sm">
              <p className="label-caps !text-[10px]">SKU-level inventory</p>
              <p className="mt-1 text-[12.5px] leading-snug text-muted-foreground">
                Every camera, recorder and drum of cable has its own tracked stock — the count you see is the count that
                ships.
              </p>
            </div>
          </ScrollDrift>
        )}
      </section>

      {/* ---------- trust strip (visible immediately — never buried) ---------- */}
      <Reveal>
        <section aria-label="Service commitments" className="border-b border-border bg-card">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-3 px-4 py-4 sm:px-6 md:grid-cols-5">
            {TRUST_ITEMS.map((item, i) => (
              <div key={item.title} className={cn("flex items-center gap-2.5", i === 4 && "col-span-2 md:col-span-1")}>
                <item.icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p className="text-[12.5px] font-medium leading-tight text-foreground/85">{item.title}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ---------- categories (primary discovery) ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-caps">Shop by category</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight">Five departments, one counter.</h2>
          </div>
          <Link href="/products" className="link-underline hidden shrink-0 text-sm font-medium sm:block">
            All products →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 60} className={cn(i === 0 && "col-span-2 md:col-span-3 lg:col-span-1")}>
              <Link
                href={`/products?category=${c.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/30"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{c.name}</div>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="text-sm font-medium leading-snug">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{c.children.length} subcategories</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- new arrivals ---------- */}
      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label-caps">New arrivals</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">Just landed at the counter.</h2>
            </div>
            <Link href="/products?sort=newest" className="link-underline hidden shrink-0 text-sm font-medium sm:block">
              Shop new →
            </Link>
          </div>
          <Reveal className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} wishlisted={wishlistIds.has(p.id)} />
            ))}
          </Reveal>
        </section>
      )}

      {/* ---------- kit builder band (editorial / USP) ---------- */}
      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <BandDecor />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:py-16">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">Kit Builder</p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              A complete CCTV kit, assembled in five considered steps.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-foreground/75">
              No compatibility guessing. Pick a recorder, add cameras within its channel count, choose storage with a
              retention estimate, then let us pair the power supply and cable. The 5% bundle discount applies itself.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-7 rounded-full px-6">
              <Link href="/kit-builder">
                Start building <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-px overflow-hidden rounded-lg border border-brand-foreground/15 bg-brand-foreground/10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-5">
            {KIT_STEPS.map((s) => (
              <div key={s.n} className="bg-brand p-5">
                <p className="font-display text-2xl text-brand-foreground/40">{s.n}</p>
                <p className="mt-3 text-sm font-semibold">{s.title}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-brand-foreground/70">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- best sellers (ranked by real order volume) ---------- */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label-caps">Best sellers</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">The reorder list.</h2>
              <p className="mt-1.5 hidden text-[13px] text-muted-foreground sm:block">
                Ranked by actual order-line volume across the counter&apos;s books — not by who paid for placement.
              </p>
            </div>
            <Link href="/products?sort=popular" className="link-underline hidden shrink-0 text-sm font-medium sm:block">
              Shop best sellers →
            </Link>
          </div>
          <Reveal className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} wishlisted={wishlistIds.has(p.id)} />
            ))}
          </Reveal>
        </section>
      )}

      {/* ---------- promo strip (HOME_STRIP banner) ---------- */}
      {stripBanner && (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <Link
            href={stripBanner.linkUrl ?? "/kit-builder"}
            className="group relative block overflow-hidden rounded-lg border border-border transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[16/7] sm:aspect-[64/11]">
              {stripBanner.imageUrl ? (
                <ParallaxImage
                  src={stripBanner.imageUrl}
                  alt=""
                  offset={["start end", "end start"]}
                  scale={1.15}
                  from="-6%"
                  to="6%"
                  hoverScale={1.19}
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/5" />
              <div className="absolute inset-0 flex flex-col justify-center gap-1 px-6 sm:px-10">
                <p className="label-caps">Complete systems</p>
                <h3 className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">{stripBanner.title}</h3>
                {stripBanner.subtitle && (
                  <p className="mt-1 hidden max-w-md text-[13px] leading-relaxed text-muted-foreground sm:block">
                    {stripBanner.subtitle}
                  </p>
                )}
              </div>
              <span className="absolute bottom-4 right-4 hidden items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium transition-colors group-hover:bg-primary group-hover:text-primary-foreground sm:inline-flex">
                Build now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* ---------- counter picks (featured rail) ---------- */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label-caps">Counter picks</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">Staff-flagged, warehouse-backed.</h2>
            </div>
            <Link href="/products" className="link-underline hidden shrink-0 text-sm font-medium sm:block">
              View all →
            </Link>
          </div>
          <Reveal className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                wishlisted={wishlistIds.has(p.id)}
                className="w-[72%] shrink-0 snap-start sm:w-[46%] lg:w-[calc(25%-12px)]"
              />
            ))}
          </Reveal>
        </section>
      )}

      {/* ---------- recently viewed (client island — hidden until the visitor has history) ---------- */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <RecentlyViewedRail />
      </section>

      {/* ---------- social proof (real buyer verdicts) ---------- */}
      {social.reviewCount > 0 && (
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <p className="label-caps">Buyer verdicts</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight">Rated by the people who install it.</h2>
              <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <p className="font-display text-3xl leading-none">{social.deliveredOrders.toLocaleString("en-IN")}</p>
                  <p className="label-caps mt-1.5 !text-[10px]">Orders delivered</p>
                </div>
                <div>
                  <p className="font-display text-3xl leading-none">{social.customers.toLocaleString("en-IN")}</p>
                  <p className="label-caps mt-1.5 !text-[10px]">Buyers served</p>
                </div>
                <div>
                  <p className="font-display text-3xl leading-none">
                    {social.avgRating.toFixed(1)}
                    <span className="text-base text-muted-foreground">/5</span>
                  </p>
                  <p className="label-caps mt-1.5 !text-[10px]">Average rating</p>
                </div>
                <div>
                  <p className="font-display text-3xl leading-none">{social.reviewCount.toLocaleString("en-IN")}</p>
                  <p className="label-caps mt-1.5 !text-[10px]">Verified reviews</p>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
              {social.quotes.map((q, i) => (
                <Reveal key={`${q.productSlug}-${i}`} delay={i * 70} className="h-full">
                  <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-5">
                    <Stars rating={q.rating} />
                    {q.title && <figcaption className="mt-3 text-[14px] font-semibold leading-snug">{q.title}</figcaption>}
                    {q.comment && <blockquote className="mt-2 line-clamp-4 flex-1 text-[13px] leading-relaxed text-muted-foreground">&ldquo;{q.comment}&rdquo;</blockquote>}
                    <footer className="mt-4 border-t border-border/70 pt-3">
                      <Link href={`/products/${q.productSlug}`} className="link-underline text-[12px] font-medium text-foreground/80">
                        {q.productName}
                      </Link>
                      <p className="mt-1 text-[11.5px] text-muted-foreground">
                        {q.authorName ? q.authorName.split(" ")[0] : "Verified buyer"}
                        {q.isVerified && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10.5px] font-medium text-primary">
                            <BadgeCheck className="h-3 w-3" aria-hidden /> Verified purchase
                          </span>
                        )}
                      </p>
                    </footer>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- brands ---------- */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="label-caps mr-2">Authorized brands</span>
            {brands.map((b) => (
              <Link key={b.id} href={`/brands/${b.slug}`} className="font-display text-lg text-foreground/60 transition-colors hover:text-foreground">
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- service commitments (documented policies) ---------- */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
        {[
          { icon: ClipboardCheck, title: "7-day DOA guarantee", body: "Dead-on-arrival units are replaced immediately after serial verification — every unit is serial-scanned at dispatch for clean RMA claims.", href: "/return-policy" },
          { icon: Truck, title: "Surat hub, same-day handover", body: "Orders confirmed and paid before 4:00 PM IST (Mon–Sat) leave the warehouse the same day via Delhivery and Shiprocket networks.", href: "/shipping-policy" },
          { icon: Boxes, title: "Built for B2B purchasing", body: "GSTIN input-tax-credit invoices, saved site addresses and contractor verification for repeat bulk orders.", href: "/contact" },
        ].map((item) => (
          <div key={item.title} className="border-t border-foreground/15 pt-6">
            <item.icon className="h-5 w-5 text-primary" aria-hidden />
            <h3 className="mt-4 font-display text-xl">{item.title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{item.body}</p>
            <Link href={item.href} className="link-underline mt-3 inline-block text-[13px] font-medium">
              Read the policy →
            </Link>
          </div>
        ))}
      </section>

      {/* ---------- journal ---------- */}
      {posts.length > 0 && (
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="label-caps">Field notes</p>
                <h2 className="mt-2 font-display text-3xl tracking-tight">Guides from the trade.</h2>
              </div>
              <Link href="/blog" className="link-underline hidden shrink-0 text-sm font-medium sm:block">
                All articles →
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-sm">
                  <div className="aspect-[16/8] overflow-hidden bg-muted">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Field note</div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug group-hover:text-primary">{post.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- final CTA ---------- */}
      <section className="relative overflow-hidden bg-brand text-brand-foreground">
        <BandDecor />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:py-14">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl leading-tight tracking-tight sm:text-3xl">
              Planning a full site? The counter will spec it with you.
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-brand-foreground/75">
              Share the camera count and cable runs — you get back a complete bill of materials with GST invoice
              pricing, ready to order.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" variant="secondary" className="rounded-full px-6">
              <Link href="/contact">
                Talk to the trade desk <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full border border-brand-foreground/30 bg-transparent px-6 text-brand-foreground hover:bg-brand-foreground/10 hover:text-brand-foreground"
            >
              <Link href="/products">Browse the catalog</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
