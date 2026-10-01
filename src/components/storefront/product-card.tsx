"use client";

import Image from "next/image";
import Link from "next/link";
import { ApiProductCard } from "@/lib/serializers";
import { cn } from "@/lib/utils";
import { discountPercent } from "@/lib/money";
import { Rating } from "./rating";
import { PriceRow } from "./price-row";
import { ProductBadge } from "./product-badge";
import { AddToCartButton } from "./add-to-cart";
import { WishlistToggle } from "./wishlist-toggle";
import { CompareToggle, compareItemFromCard } from "./compare-toggle";

// ProductCard — the reference anatomy, identical everywhere:
// 4:5 image w/ hover crossfade → badges → quick-add (desktop hover) /
// mobile 44px pill → brand caps → name → rating → variants → price row.

export function ProductCard({
  product,
  className,
  wishlisted = false,
}: {
  product: ApiProductCard;
  className?: string;
  wishlisted?: boolean;
}) {
  const img0 = product.images[0]?.url;
  const img1 = product.images[1]?.url;
  const pct =
    product.mrpFromPaise > product.priceFromPaise
      ? discountPercent(product.priceFromPaise, product.mrpFromPaise)
      : null;
  const inStockVariant =
    product.variants.find((v) => v.inStock) ?? product.variants[0] ?? null;
  const oos = !product.inStock;
  const lowStock = !oos && product.availableStock > 0 && product.availableStock <= 10;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary">
        {img0 ? (
          <Image
            src={img0}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(min-width:1024px) 24vw, (min-width:768px) 32vw, 46vw"
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
        ) : null}
        {img1 ? (
          <Image
            src={img1}
            alt={product.images[1]?.alt || product.name}
            fill
            sizes="(min-width:1024px) 24vw, (min-width:768px) 32vw, 46vw"
            className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        ) : null}

        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 z-[1]"
          aria-label={product.name}
        >
          <span className="sr-only">{product.name}</span>
        </Link>

        {pct ? (
          <div className="absolute left-2 top-2 z-[2]">
            <ProductBadge tone="discount">{pct}% off</ProductBadge>
          </div>
        ) : null}

        {lowStock ? (
          <p className="absolute bottom-2 left-2 z-[2] rounded-full bg-card/95 px-2 py-1 text-[11px] font-medium text-destructive">
            Only {product.availableStock} left
          </p>
        ) : null}

        {oos ? (
          <div className="absolute inset-0 z-[2] grid place-items-center bg-card/70">
            <ProductBadge tone="oos">Out of stock</ProductBadge>
          </div>
        ) : null}

        <div className="absolute right-2 top-2 z-[3] flex flex-col gap-2">
          <WishlistToggle productId={product.id} initialWishlisted={wishlisted} />
          <CompareToggle item={compareItemFromCard(product)} />
        </div>

        <div className="absolute inset-x-2 bottom-2 z-[3] hidden lg:block">
          <AddToCartButton
            skuId={inStockVariant?.skuId}
            disabled={oos || !inStockVariant}
            label={oos ? "Out of stock" : "Add to cart"}
            size="sm"
            className="w-full translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        {product.brand?.name ? <p className="label-caps">{product.brand.name}</p> : null}
        <h3 className="text-sm font-medium leading-snug">
          <Link href={`/products/${product.slug}`} className="line-clamp-2 hover:underline">
            {product.name}
          </Link>
        </h3>
        <Rating avg={product.ratingAvg} count={product.ratingCount} />
        {product.variants.length > 1 ? (
          <p className="text-xs text-muted-foreground">
            {product.variants.length} options available
          </p>
        ) : null}
        <PriceRow
          pricePaise={product.priceFromPaise}
          mrpPaise={product.mrpFromPaise}
          size="sm"
          className="mt-auto pt-1"
        />
        <div className="mt-2 lg:hidden">
          <AddToCartButton
            skuId={inStockVariant?.skuId}
            disabled={oos || !inStockVariant}
            label={oos ? "Out of stock" : "Add to cart"}
            variant="outline"
            className="w-full"
          />
        </div>
      </div>
    </article>
  );
}
