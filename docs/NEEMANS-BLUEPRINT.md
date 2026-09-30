# NEEMANS-BLUEPRINT.md — Structural Source of Truth (Task 50)

> **Status**: Verified live against https://neemans.com/ on 2026-09-30 (full-text
> section inventory captured in `tool-results/neemans/home.json`).
> **Directive**: Neeman's is the PRIMARY STRUCTURAL BLUEPRINT — section sequence,
> proportions, density, interaction patterns, spacing rhythm. Only the content
> layer (brand, products, imagery, copy, claims) is the client's.
> **Priority order when decisions conflict**: 1 reference layout fidelity ·
> 2 reference IA · 3 reference interaction behavior · 4 usability · 5 client
> branding · 6 a11y · 7 perf · 8 decoration.

---

## 1. REFERENCE DECONSTRUCTION (verified live)

### 1.1 Header stack (top → bottom)
1. **Announcement strip** — rotating promo messages with prev/next arrows
   ("Get ₹150 Off · Claim it on the app today · Download App · Nearby Stores").
2. **Utility row** — small links: Track Order · About · Brand Impact · Store
   Reviews · Help · Return & Exchange · Contact Us · Bulk Inquiry · Return &
   Exchange Policy.
3. **Primary nav row** — logo left · category items with mega menus · search ·
   account/login · cart with count badge.
4. **Mega menus** — per top item: "Featured:" links row → "By Category" column
   set → "By Use" column set → "View All". Grouped, dense, imagery-light.
5. **Search** — full overlay panel: "Trending Search" chips + "Browse by
   Category" shortcuts + predictive suggestions; empty state still shows both.
6. **Account** — drawer/sheet: greeting ("Hey, Shoe lover!"), login prompt,
   "Shop:" best sellers, "Account:" links.
7. **Cart** — right drawer; empty state = message + supporting copy + recovery
   CTA ("Shop & Explore") + trending collections.

### 1.2 Homepage section sequence (verified order)
| # | Reference section | Role |
|---|---|---|
| 1 | Hero carousel | Campaign slides, arrows + dot pagination ("Go to item N") |
| 2 | Trust strip | 5 compact value indicators (4M+ customers · Made in India · bottles recycled · No-cost EMI · planet line) |
| 3 | Featured collection carousel ("Our Exclusive Series") | Horizontal product carousel: color swatches (per-variant names), rating (n), price + original + % off, **inline size chips**, Add to Cart |
| 4 | Editorial story block ("Brogues Reborn") | Single product-family story: big visual + heading + CTA |
| 5 | Customer stories carousel ("What Our Customers Say") | Testimonial + product association + rating; person-first headlines |
| 6 | New arrivals rail | Product carousel |
| 7 | Best sellers carousel | Product carousel with full card anatomy |
| 8 | Reviews wall ("Let customers speak for us — from N reviews") | Aggregate count + review cards (title, body, reviewer, date, product) |
| 9 | Ratings validation ("The Ratings Say It All — loved by 4M+") | External trust badges (Flipkart/Amazon for them) |
| 10 | Category discovery ("DESIGNED FOR YOU & PLANET — Shop By Use") | Use-case tiles: Signature / Retro / Extra-Soft |
| 11 | Store locator ("Your Nearest Step to Comfort — Find Your Favorites at a Store Near You") | Physical-presence band + CTA |
| 12 | Corporate & bulk ("Corporate & Bulk Orders — Enquire Now") | B2B band |
| 13 | Featured In ("Our award-winning designs are shaping the future…") | Press logo band |
| 14 | Newsletter ("Let's walk greener paths Together! … Subscribe") | Prominent input + CTA |
| 15 | Footer: category footer nav + link columns (Offers & Rewards / Help & Support / About / Policy) + Social · live chat · phone · registered address · hours · "100% Secure Transaction" · brand-story SEO text (collapsible) · © |

### 1.3 Card anatomy (reference product card, top → bottom)
image (hover = alternate image/zoom) → badge → name (per-variant color names as
swatches) → rating "4.8 (571)" → price + struck original + % off chip → size
chips / Add to Cart on hover. Consistent aspect ratio, consistent gap rhythm.

---

## 2. CLIENT CONTENT MAPPING (Patel Networks / MegaTechzy)

| Reference element | Client's genuine equivalent (DB source) |
|---|---|
| Announcement strip | Existing marquee promises (free shipping ₹500+ · GST invoice · Surat dispatch) — **rotate** 3 messages with arrows, no marquee |
| Utility row | Track Order / About / Help(/faq) / Bulk Inquiry(/contact) / Policies — all existing pages |
| Hero carousel | `Banner` model (`placement=HOME_HERO`, isActive, sortOrder) via direct `db.banner.findMany` in the server component; static ivory hero stays as the empty-state fallback |
| Trust strip | 5 compact pills: real catalog stats from `getHomeSocialProof()` + FREE_SHIPPING_THRESHOLD + GST invoice + brand warranty |
| Featured carousel | Best-rated / newest `ProductCard`s as horizontal carousel with arrows + variant swatches (existing variant data) |
| Editorial story | Real category story (CCTV & Surveillance → "security that never sleeps") or kit-builder story — client copy only |
| Customer stories | Real `Review` rows (`isApproved=true`) joined to product + rating |
| Reviews wall | Real approved `Review`s + aggregate count (`from N verified reviews`) — **never fabricate** |
| Ratings validation | Genuine posture badges: 100% Genuine · GST Invoice · Brand Warranty · Secure Checkout (NO fake Flipkart/Amazon logos) |
| Category discovery | Existing category circles → restyled as "Shop by use" tiles |
| Store band | **Surat trade desk** (real address/contact from `src/lib/constants.ts`) + WhatsApp deep link — replaces store locator, same visual weight |
| Corporate & bulk | Real B2B path: CTA → `/contact` B2BInquiryForm anchor |
| Featured In | **Genuine partner brands** from `getBrands()` — "Authorised distribution & service partners" (NO fake press logos) |
| Newsletter | Genuine CTA: WhatsApp deal alerts (wa.me from constants) + catalog links — no fake subscribe capture |
| Footer | Existing 4 columns regrouped to reference IA + brand-story SEO line + "100% Secure Transactions" + contact line |

## 3. DESIGN SYSTEM (already installed — enforce, don't re-invent)

Tokens live in `src/app/globals.css` (Neeman's-extracted, Task 47/48): canvas
`bg-background`, white cards `bg-card` + `shadow-whisper` + `border-border`,
sand bands `bg-sand`, brand band `bg-brand`, accent `--accent` (decoration
only), `font-display` + `tracking-tight` headings, `label-caps`, rounded-xl
cards / rounded-lg inner, pill buttons, section rhythm `py-14 sm:py-20`
(mobile `py-10`), Reveal component, 150–400ms transitions, no bounce/3D/parallax.

**Container**: `max-w-7xl px-4 sm:px-6`. **Section head pattern**: eyebrow
(`label-caps`) → heading → lede → control row (arrows right-aligned) — reuse
`SectionHead`.

## 4. COMPONENT ARCHITECTURE (Task 50 targets)

New/renamed homepage components under `src/components/storefront/home/`:
`HeroCarousel` · `TrustStrip` · `SectionHead` (extract) · `ProductCarousel`
(rail + arrows) · `EditorialStory` · `CustomerStories` · `ReviewsWall` ·
`RatingsBand` · `UseCaseTiles` · `StoreBand` · `CorporateBand` ·
`FeaturedIn` · `NewsletterBand`. Header gets `UtilityBar` + rotating
announcement + `SearchOverlay`. All consume the SAME tokens + contracts.

## 5. FROZEN CONTRACTS (do not break — Task 48/49 baseline)

- `ProductCard({ product: ApiProductCard, className?, wishlisted? })`
- cart store: `useCartStore` / `useCartCount` / `openDrawer` / `closeDrawer`;
  add-to-cart opens drawer everywhere; Buy-now bypasses it
- `formatINR` · `FREE_SHIPPING_THRESHOLD_PAISE` · `Reveal`
- homepage data: `getCategoryTree / getNewArrivals / getBestSellerProducts /
  getBrands / getHomeSocialProof / getWishlistProductIds / getPriceAndRating /
  mapProductCard`
- header mega menu uses `GET /api/categories`; search uses `/api/search/quick`
- DB/schema/APIs/services/admin/auth: **untouched** (read-only `db.banner` /
  `db.review` queries allowed inside server components)

## 6. DESIGN QA CHECKLIST (run after build — all must be YES)

- [ ] Header: announcement rotation + utility row + nav + search + account + cart = reference IA? 
- [ ] Mega menu: grouped categories + featured links + view-all density?
- [ ] Search: overlay model with trending + category shortcuts + predictive?
- [ ] Hero: carousel prominence (arrows/dots) with client banners?
- [ ] Trust strip: compact 5-pill density directly under hero?
- [ ] Product carousels: card anatomy (swatches/rating/price/off) consistent?
- [ ] Editorial + customer stories: story structure, not generic cards?
- [ ] Reviews wall: real approved reviews + aggregate count?
- [ ] Category discovery: use-tile pattern?
- [ ] Store/corporate/press bands: same visual weight + genuine client content?
- [ ] Newsletter: prominent band, genuine CTA?
- [ ] Footer: reference IA (offers/help/about/policy columns + secure line + SEO story)?
- [ ] Mobile: same product feel — hamburger, swipe rails, stacked bands, no squeeze?
- [ ] Zero fabricated claims/reviews/press; zero DB/API changes; sweep 108/108; lint 0; tsc 0
