# REFERENCE BLUEPRINT — neemans.com (live-verified 2026-10-01, capture: tool-results/neemans51/home.json)

Source of truth for the VISUAL/UX STRUCTURE. Client DB/constants = 100% of content. Structural fidelity beats creativity (brief §21).

## 1. VERIFIED HOMEPAGE SEQUENCE (live capture, in order)

| # | Reference section | Verified shape | Client content (genuine only) |
|---|---|---|---|
| 1 | Announcement strip | rotating promotional messages (✦ Comfort Club, 🏷️ Buy 2 Get 7%…) | 3 rotating: free shipping ₹500 / GST invoice / same-day Surat dispatch (constants) |
| 2 | Utility bar | Track Order · Brand Impact · Store Reviews · Nearby Stores · Return & Exchange · Contact Us · Bulk Inquiry · Return Policy | Track Order · FAQ · Bulk Inquiry · Shipping Policy · Return Policy · Contact (real routes) + WhatsApp |
| 3 | Nav + mega menus | Download App / New Launches / Begin Walk / Men / Women / Sneakers…; mega: "Featured:" links + grouped categories + All Products | NAV: 5 root categories (tree) + Kit Builder + Brands; mega = lazy /api/categories tree, "Featured:" shortcuts rail, View all |
| 4 | Hero campaign | full-bleed image carousel, "Comfort Rush Deals Ends In:" countdown, "Go to item N" dots ×7 | DB HOME_HERO banners (title/subtitle/linkUrl), arrows + "Go to item N" dots; ivory fallback at zero banners (NO fake countdown) |
| 5 | App download band | h2 "Hey, Shoe lover!" + input + Download App | NO app exists → same placement/visual weight: WhatsApp deal-alerts band (wa.me deep link) |
| 6 | Trust strip | 4 stats: 4M+ customers / Made in India / 3.2M+ bottles / No-cost EMI | real getHomeSocialProof stats + GST invoice + brand warranty + Surat dispatch 4 PM + ₹500 shipping |
| 7 | Brand impact band | h2 "Good for You & Better for the Planet" | genuine posture band: authorized distribution + GST invoicing + Surat hub (constants only) |
| 8 | Rewards band | h2 "Join Neeman's Comfort Club" | kit-builder 5% bundle band (live bundle row custom-cctv-kit, genuine discount) → /kit-builder |
| 9 | "Our Exclusive Series" | product carousel | "Trade Desk Picks" — getBestSellerProducts first 8 (featured) |
| 10 | "New Launches" | product carousel ×12 | getNewArrivals(8) |
| 11 | "What Our Customers Say" | testimonial carousel ×5 (human stories) | approved reviews carousel (real ReviewCard) |
| 12 | "Best Seller" | product carousel ×12 | getBestSellerProducts(16) ranks 9–16 |
| 13 | "Brand Reviews" | brand-level reviews | Authorised Distribution & Service Partners strip (getBrands → /products?brand=) |
| 14 | "Our Customers speak for us" | reviews wall | reviews wall: real count (db.review approved) + 6 cards; hides at 0 |
| 15 | Trust validation band | "Comfort loved and trusted by 4M+ customers" | real count band from getHomeSocialProof |
| 16 | "Shop by Category" | category discovery | getCategoryTree circles w/ imageUrl |
| 17 | Store locator | "Your Nearest Step to Comfort" | Surat Trade Desk: real address/hours/GSTIN/WhatsApp/4 PM cutoff |
| 18 | Corporate & Bulk Orders | band + CTA | CorporateBand → /contact (real B2B form) |
| 19 | Featured In | press logos | REAL brands only as authorised partners; NO fake press |
| 20 | Mega footer | category nav columns (Download App/New Launches/Men/Women/Sneakers…) + offers + support + about + policies + contact + brand-story SEO ("founded in 2017") | 4 reference-IA columns (Offers & Services / Help & Support / Company / Policies) + contact/trust + secure line + collapsible brand story |

## 2. LAYOUT CONSTRAINTS (§02 — treat as law)

- Container: `max-w-[1280px]`, px-4 (mobile) / px-6 (desktop). Full-bleed only: announcement, hero, colored bands.
- Sections: py-12 mobile / py-16 desktop between merchandising sections; bands py-10/14.
- Grid: PLP 2-col mobile / 3-col tablet / 4-col desktop, gap-4/6. Carousels: card width ≈ 260–280px desktop (4 visible), 168–180px mobile (2.2 peek).
- Product-card image ratio 4:5 (object-cover), cards radius-lg (12px) images, pill buttons, chip radius-full.
- Heading stack: section-heading text-xl/2xl font-semibold tracking-tight; eyebrow label-caps (11px uppercase tracking-[0.14em] muted); body text-sm muted.
- Header stack heights: announcement h-9, utility h-9 (desktop only), primary nav h-16; sticky primary nav.
- Motion: 150–300ms ease-out only; opacity crossfades; no bounce/parallax/spring.

## 3. DESIGN TOKENS (§04 — globals.css is the only source)

Canvas `#f3f2ee` · surface `#ffffff` · ink `#212121` · muted `#6b6b66` · border `#e5e2da` · accent CTA caramel `#c99a55` (hover `#b78a45`) · sand band `#f4e5c9` · deep green `#175615` (success/discount/links-accent) · star `#d3b289` · sale `#a83a2a` · radius: pill buttons/chips, lg cards, full avatars · shadows: whisper only · dark mode same DNA (canvas `#171614`, surface `#201f1c`, caramel CTA stays).

Type scale: display 2xl–4xl/600 · page 3xl/600 · section xl–2xl/600 · body sm/400 · caption xs muted · label-caps 11px/600 uppercase · price sm–base/600.

## 4. COMPONENT ARCHITECTURE (§16 — these names, one token set)

Primitives (lead-owned): `product-card.tsx`(ProductCard) `price.tsx`(Price) `rating.tsx`(Rating) `product-badge.tsx`(ProductBadge) `section-header.tsx`(SectionHeader) `empty-state.tsx`(EmptyState) `breadcrumb.tsx`(Breadcrumb) `rail.tsx`(RailWithArrows) `product-carousel.tsx`(ProductCarousel) `product-grid.tsx`(ProductGrid) `add-to-cart.tsx`(AddToCart hook helper) `wishlist-toggle.tsx` `compare-toggle.tsx` `recently-viewed.tsx` `promo-banner.tsx`(PromoBanner).

Chrome (agent A): `header.tsx`(Header) `utility-bar.tsx`(UtilityBar) `navigation.tsx`(Navigation) `mega-menu.tsx`(MegaMenu) `search-overlay.tsx`(SearchOverlay) `mobile-menu.tsx`(MobileMenu) `account-drawer.tsx`(AccountDrawer) `cart-drawer.tsx`(CartDrawer) `footer.tsx`(Footer) `footer-story.tsx` `compare-tray.tsx` `compare-ids-bridge.tsx` `whatsapp-widget.tsx`.

Home (agent B): `hero-carousel.tsx`(HeroCarousel) `trust-strip.tsx`(TrustStrip) `collection-section.tsx`(CollectionSection) `category-section.tsx`(CategorySection) `review-section.tsx`(ReviewSection) `editorial-section.tsx`(EditorialSection) `store-section.tsx`(StoreSection) `corporate-section.tsx`(CorporateSection) `featured-in.tsx`(FeaturedIn) `newsletter.tsx`(Newsletter).

Catalog (agent C): `filter-drawer.tsx`(FilterDrawer) `sort-control.tsx`(SortControl) `catalog-pagination.tsx` `gallery.tsx` `variant-selector.tsx`(VariantSwatches) `pdp-sticky-bar.tsx` `pincode-checker.tsx` `review-form.tsx` `notify-me-inline.tsx`.

Commerce (agent D1): `cart-view.tsx` `cart-coupon-box.tsx` `checkout-view.tsx` `checkout-pay-now-button.tsx` `tracking-timeline.tsx` `order-actions.tsx`.

Account/content (agent D2): `otp-login.tsx` `account-profile-form.tsx` `account-address-book.tsx` `account-wishlist-actions.tsx` `content-page-shell.tsx` `b2b-inquiry-form.tsx` `platform-enquiry-form.tsx` `content-blog-card.tsx` `blog-post-body.tsx` `kit-builder-wizard.tsx`.

## 5. FROZEN CONTRACTS (§15 — from preserve map, byte-frozen)

- Envelope `{ok,data}`/`{ok,error}`; money in paise; `formatINR`; `ApiProductCard` via `mapProductCard` = card data contract.
- `useCartStore`: `cart/loaded/loading/drawerOpen`, `add(skuId, qty)` (caller opens drawer), `update/remove/clear/refresh/openDrawer/closeDrawer`, `CartHydrator`, `useCartCount`.
- APIs: `/api/categories`→`{tree:CategoryFacet[]}`, `/api/search/quick?q=`→`{hits:QuickSearchHit[]}` (200ms debounce), `/api/cart*`, `/api/orders`, `/api/payments/razorpay/{order,verify,simulate}`, `/api/auth/*`, `/api/wishlist*`, `/api/shipping/{pincode,rates}`, `/api/coupon/validate`, `/api/track`, `/api/stock-alerts`, `/api/contact`, `/api/platform-enquiry`, `/api/reviews`.
- Services (server components): `getCategoryTree, getNewArrivals(8), getBestSellerProducts(16), getBrands, getHomeSocialProof, getPriceAndRating, getWishlistProductIds, getProductBySlug, getRelatedProducts, getRatingDistribution, getBrandBySlug, getProductsForCompare, getInstallAccessories, listProducts(productQuerySchema), quickSearch` + `db.banner(HOME_HERO)/db.review approved`.
- localStorage `pn-compare-v1`, `pn-recent-v1`; sessionStorage `pn_coupon`; cookies `pn_cart_id`/`pn_session`; `/login`→`/account/login?next=`; `/wishlist`→`/account/wishlist`.
- Root layout: Inter font, ThemeProvider, Toster at root; store layout: skip-link + CartHydrator + Header + main#main-content + Footer + CompareTray + CartDrawer (siblings after footer).

## 6. QA CHECKLIST (§20) — verify each YES before hand-off

Header IA YES/NO · Nav mega structure YES/NO · Search interaction model YES/NO · Hero prominence YES/NO · Trust density YES/NO · Card anatomy (image/badge/name/rating/price/strike/%off/variants/quick-add/hover) YES/NO · Reviews hierarchy YES/NO · Category discovery YES/NO · Footer IA YES/NO · Mobile responsive logic (375 no overflow, drawers, sticky PDP bar) YES/NO · lint 0 · tsc 0.

## 7. PROHIBITIONS (§14)

No glassmorphism, neon//random gradients, heavy rounding, floating cards, blobs, fake reviews/stats/press, fabricated claims, invented section order, SaaS aesthetics. Self-hide thin sections instead of faking them.
