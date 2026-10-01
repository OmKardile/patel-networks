"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { ApiProductCard } from "@/lib/serializers";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/money";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/hooks/use-toast";
import { Rating } from "./rating";
import { ProductBadge } from "./product-badge";
import { WishlistToggle } from "./wishlist-toggle";
import { CompareToggle, compareItemFromCard } from "./compare-toggle";

// ProductCard — reference anatomy, identical everywhere: white bordered tile,
// square contained photo, optional merch badge, variant swatches (client
// state feeding quick-add), one-line brand·name, gated rating, from-price
// row, full-width quick-add (or View details when out of stock).

export type ProductCardBadge = "New" | "Best Seller";

const BADGE_CLASSES: Record<ProductCardBadge, string> = {
  New: "bg-emerald-600 text-white",
  "Best Seller": "border border-sky-200 bg-sky-100 text-sky-900",
};

function initialsOf(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.slice(0, 1).toUpperCase())
    .join("");
}

export function ProductCard({
  product,
  className,
  wishlisted = false,
  imagePriority = false,
  badge = null,
}: {
  product: ApiProductCard;
  className?: string;
  wishlisted?: boolean;
  /** Set on the first above-fold card of the first rail so the LCP image
   * preloads (brief D: LCP image must not lazy-load). */
  imagePriority?: boolean;
  /** Reference merch pill over the photo. Merchandising callsites only. */
  badge?: ProductCardBadge | null;
}) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(
    () => (product.variants.find((v) => v.inStock) ?? product.variants[0])?.id ?? null,
  );
  const [busy, setBusy] = useState(false);

  const selected =
    product.variants.find((v) => v.id === selectedId) ??
    product.variants.find((v) => v.inStock) ??
    product.variants[0] ??
    null;
  const oos = !product.inStock;
  const addableSkuId = !oos && selected?.inStock ? selected.skuId : null;
  const lowStock =
    !oos && product.availableStock > 0 && product.availableStock <= 10;
  const pct = product.discountPct > 0 ? product.discountPct : 0;
  const title = product.brand?.name ? `${product.brand.name} · ${product.name}` : product.name;

  const onQuickAdd = async () => {
    if (!addableSkuId || busy) return;
    setBusy(true);
    const res = await useCartStore.getState().add(addableSkuId);
    setBusy(false);
    if (res.ok) {
      toast({ title: "Added to cart", description: "Item is in your cart." });
      useCartStore.getState().openDrawer();
    } else {
      toast({
        title: "Could not add to cart",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white transition-shadow hover:shadow-lift",
        className,
      )}
    >
      {/* Stretched link: the photo, name and price all lead to the PDP.
          Interactive controls below opt out with their own stacking. */}
      <Link
        href={`/products/${product.slug}`}
        aria-label={product.name}
        className="absolute inset-0 z-[1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1b1b]"
      >
        <span className="sr-only">{product.name}</span>
      </Link>

      <div className="relative aspect-square bg-white p-3">
        {product.images[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(min-width:1024px) 24vw, (min-width:768px) 32vw, 46vw"
            priority={imagePriority}
            className="object-contain transition-opacity duration-300 group-hover:opacity-0"
          />
        ) : null}
        {product.images[1]?.url ? (
          <Image
            src={product.images[1].url}
            alt={product.images[1]?.alt || product.name}
            fill
            sizes="(min-width:1024px) 24vw, (min-width:768px) 32vw, 46vw"
            className="object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : null}

        {badge ? (
          <span
            className={cn(
              "absolute left-2 top-2 z-[2] rounded px-2 py-0.5 text-[10px] font-semibold uppercase leading-none",
              BADGE_CLASSES[badge],
            )}
          >
            {badge}
          </span>
        ) : null}

        {oos ? (
          <div className="absolute left-2 top-2 z-[2]">
            <ProductBadge tone="oos">Out of stock</ProductBadge>
          </div>
        ) : null}

        {lowStock ? (
          <p className="absolute bottom-2 left-2 z-[2] rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-destructive">
            Only {product.availableStock} left
          </p>
        ) : null}

        <div className="absolute right-2 top-2 z-[3] flex flex-col gap-1.5">
          <WishlistToggle
            productId={product.id}
            initialWishlisted={wishlisted}
            className="h-9 w-9 rounded-full border border-black/10 bg-white/90"
          />
          <CompareToggle
            item={compareItemFromCard(product)}
            className="h-9 w-9 rounded-full border border-black/10 bg-white/90"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-2">
        {product.variants.length > 1 ? (
          <div
            role="group"
            aria-label={`${product.name} options`}
            className="relative z-[2] flex flex-wrap items-center gap-1.5"
          >
            {product.variants.slice(0, 4).map((variant) => {
              const colorKey = Object.keys(variant.attributes).find((k) =>
                /colou?r/i.test(k),
              );
              const label =
                (colorKey ? variant.attributes[colorKey] : "") || variant.name;
              const isSelected = selected?.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  title={`${variant.name}${variant.inStock ? "" : " — out of stock"}`}
                  aria-label={`${variant.name}${variant.inStock ? "" : " (out of stock)"}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(variant.id)}
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-md border-2 border-black/10 bg-white text-[10px] font-semibold leading-none text-black/70 transition-colors hover:border-black/25",
                    isSelected && "border-[#1c1b1b] text-black",
                    !variant.inStock && "opacity-40",
                  )}
                >
                  {initialsOf(label) || label.slice(0, 1).toUpperCase()}
                </button>
              );
            })}
            {product.variants.length > 4 ? (
              <span className="text-[10px] font-medium text-black/40">
                +{product.variants.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        <h3 className="line-clamp-1 text-xs text-black/60">{title}</h3>

        {/* Brief rule: card rating shows ONLY with a meaningful sample (>= 5). */}
        {product.ratingCount >= 5 ? (
          <Rating
            avg={product.ratingAvg}
            count={product.ratingCount}
            size="sm"
            color="amber"
          />
        ) : null}

        <p className="mt-auto flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 pt-1">
          <span className="font-bold tracking-tight text-[#1c1b1b]">
            {formatINR(product.priceFromPaise)}
          </span>
          {product.mrpFromPaise > product.priceFromPaise ? (
            <span className="text-xs text-black/40 line-through">
              {formatINR(product.mrpFromPaise)}
            </span>
          ) : null}
          {pct > 0 ? (
            <span className="text-xs font-semibold text-emerald-600">{pct}% Off</span>
          ) : null}
        </p>

        {oos ? (
          <Link
            href={`/products/${product.slug}`}
            aria-label={`View details for ${product.name}`}
            className="relative z-[2] inline-flex h-10 w-full items-center justify-center rounded-full border border-black/15 bg-white text-sm font-semibold text-[#1c1b1b] transition-colors hover:bg-black/5"
          >
            View details
          </Link>
        ) : (
          <button
            type="button"
            onClick={onQuickAdd}
            disabled={busy || !addableSkuId}
            aria-busy={busy}
            aria-label={`Add ${product.name} to cart`}
            className="press relative z-[2] inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#1f1f1f] text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart aria-hidden className="h-4 w-4" />
            )}
            {busy ? "Adding…" : addableSkuId ? "Add to cart" : "Out of stock"}
          </button>
        )}
      </div>
    </article>
  );
}
