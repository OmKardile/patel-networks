"use client";

// Mobile sticky purchase bar — fixed bottom on small screens only: thumbnail,
// name, price row and a pill that adds the first in-stock variant (the drawer
// opens from AddToCartButton — no forced navigation).

import Image from "next/image";
import { AddToCartButton } from "@/components/storefront/add-to-cart";
import { PriceRow } from "@/components/storefront/price-row";
import type { ApiProductCard } from "@/lib/serializers";

export function PdpStickyBar({ product }: { product: ApiProductCard }) {
  const variant = product.variants.find((v) => v.inStock) ?? product.variants[0];
  if (!variant) return null;

  return (
    <div
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-whisper backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            {product.images[0]?.url ? (
              <Image src={product.images[0].url} alt={product.images[0].alt ?? product.name} fill sizes="48px" className="object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <PriceRow pricePaise={variant.sellingPricePaise} mrpPaise={variant.mrpPaise} size="sm" />
            <p className="mt-0.5 max-w-[190px] truncate text-[11px] text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <AddToCartButton
          skuId={variant.inStock ? variant.skuId : null}
          disabled={!variant.inStock}
          label={variant.inStock ? "Add" : "Out of stock"}
          size="sm"
          className="shrink-0"
        />
      </div>
    </div>
  );
}
