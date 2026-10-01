"use client";

// PDP buy box — attribute chip groups narrow to the exact SKU, quantity stepper,
// add-to-cart (drawer opens) vs buy-now (express path, drawer stays shut), and
// the wishlist / compare row. When the selected SKU is out of stock the panel
// hands over to the notify-me capture instead of a dead "add" button.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/storefront/add-to-cart";
import { WishlistToggle } from "@/components/storefront/wishlist-toggle";
import { CompareToggle, compareItemFromCard } from "@/components/storefront/compare-toggle";
import { NotifyMeInline } from "@/components/storefront/notify-me-inline";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ApiProductCard, ApiProductVariant } from "@/lib/serializers";

function matchesSelection(variant: ApiProductVariant, selection: Record<string, string>): boolean {
  return Object.entries(selection).every(([key, value]) => variant.attributes[key] === value);
}

export function VariantSelector({ product, initialWishlisted = false }: { product: ApiProductCard; initialWishlisted?: boolean }) {
  const router = useRouter();
  const add = useCartStore((s) => s.add);
  const variants = product.variants;

  // Preselect the first in-stock variant (or the first variant) so the selection is always complete.
  const defaultVariant = variants.find((v) => v.inStock) ?? variants[0];
  const [selection, setSelection] = useState<Record<string, string>>(() => defaultVariant?.attributes ?? {});
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  const selectedVariant = useMemo(() => variants.find((v) => matchesSelection(v, selection)), [variants, selection]);

  function selectChip(key: string, value: string) {
    // Change the clicked attribute, then resolve the full combination to the best
    // real variant: prefer maximal overlap with the current selection, in-stock
    // first. (Cross-attribute jumps must stay possible — e.g. 2MP pairs with a
    // 3.6mm lens while the current selection holds 2.8mm — otherwise OOS
    // combinations become unreachable.)
    const candidates = variants.filter((v) => v.attributes[key] === value);
    const overlap = (v: ApiProductVariant) =>
      Object.entries(selection).filter(([k, val]) => k !== key && v.attributes[k] === val).length;
    const best =
      candidates.filter((v) => v.inStock).sort((a, b) => overlap(b) - overlap(a))[0] ??
      candidates.sort((a, b) => overlap(b) - overlap(a))[0] ??
      null;
    setSelection((prev) => ({ ...prev, [key]: value, ...(best ? best.attributes : {}) }));
    setQty(1);
    setBuyError(null);
  }

  /** Express path: add without opening the drawer, then straight to checkout. */
  async function buyNow() {
    if (!selectedVariant || !selectedVariant.inStock || buying) return;
    setBuying(true);
    setBuyError(null);
    try {
      const result = await add(selectedVariant.skuId, qty);
      if (result.ok) {
        router.push("/checkout");
        return;
      }
      setBuyError(result.error ?? "Could not start checkout — try again.");
    } finally {
      setBuying(false);
    }
  }

  if (!variants.length || !defaultVariant) {
    return (
      <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Variants for this item are being updated — message the trade desk on WhatsApp to order.
      </p>
    );
  }

  const stock = selectedVariant?.availableStock ?? 0;
  const inStock = (selectedVariant?.inStock ?? false) && stock > 0;
  const lowStock = inStock && (selectedVariant?.lowStock ?? false);
  const maxQty = stock > 0 ? Math.min(stock, 99) : 99;

  return (
    <div className="space-y-6">
      {/* Attribute chip groups — one group per attribute key across the variants */}
      {product.attributes.map((key) => {
        const values = [...new Set(variants.map((v) => v.attributes[key]).filter(Boolean))];
        return (
          <div key={key} role="group" aria-label={`Choose ${key}`} className="space-y-2">
            <p className="label-caps">
              {key}
              <span className="ml-2 font-sans text-[11px] normal-case tracking-normal text-muted-foreground">{selection[key] ?? "—"}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const hypothetical = { ...selection, [key]: value };
                const selected = selection[key] === value;
                const hasMatch = variants.some((v) => matchesSelection(v, hypothetical));
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectChip(key, value)}
                    aria-pressed={selected}
                    aria-label={`${key}: ${value}${hasMatch ? "" : " (adjusts other options to the nearest match)"}`}
                    className={cn(
                      "inline-flex min-h-[44px] items-center rounded-full border px-4 text-[13px] font-medium transition-all duration-200",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : hasMatch
                          ? "border-border bg-card text-foreground hover:border-foreground/40"
                          : "border-dashed border-border bg-muted/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground/80",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Selected SKU panel */}
      {selectedVariant ? (
        <div className="space-y-2.5 rounded-xl bg-muted/50 p-4" aria-live="polite">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-semibold tracking-tight">{formatINR(selectedVariant.sellingPricePaise)}</span>
            {selectedVariant.discountPct > 0 ? (
              <>
                <s className="text-sm font-normal text-muted-foreground">{formatINR(selectedVariant.mrpPaise)}</s>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold leading-none text-success">
                  {selectedVariant.discountPct}% off
                </span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
            <span className="text-muted-foreground">
              SKU <span className="font-mono text-[12px] text-foreground">{selectedVariant.skuCode}</span>
            </span>
            {inStock && !lowStock ? <span className="font-medium text-success">In stock</span> : null}
            {lowStock ? (
              <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                Low stock · only {stock} left
              </span>
            ) : null}
            {!inStock ? <span className="font-medium text-destructive">Out of stock</span> : null}
            {product.warrantyMonths > 0 ? (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
                {product.warrantyMonths}-month warranty
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Quantity + CTA row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 items-center rounded-full border border-border bg-card shadow-whisper" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="flex h-full w-11 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
          >
            <Minus aria-hidden className="h-3.5 w-3.5" />
          </button>
          <input
            type="text"
            inputMode="numeric"
            aria-label="Quantity"
            value={qty}
            onChange={(e) => {
              const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
              if (Number.isNaN(n)) return;
              setQty(Math.max(1, Math.min(maxQty, n)));
            }}
            className="h-full w-10 border-x border-border bg-transparent text-center text-sm tabular-nums outline-none"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            aria-label="Increase quantity"
            className="flex h-full w-11 items-center justify-center text-foreground transition-colors hover:text-accent disabled:opacity-30"
          >
            <Plus aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>

        <AddToCartButton
          skuId={selectedVariant?.skuId}
          quantity={qty}
          disabled={!inStock}
          label={inStock ? "Add to cart" : "Out of stock"}
          className="min-w-[150px] flex-1 px-6 sm:flex-none"
        />
        <Button
          type="button"
          onClick={() => void buyNow()}
          disabled={!inStock || buying}
          variant="outline"
          className="min-h-[44px] min-w-[110px] border-foreground/70 px-6 text-sm"
        >
          {buying ? "Starting…" : "Buy now"}
        </Button>
      </div>

      {buyError ? (
        <p role="alert" className="text-[13px] text-destructive">
          {buyError}
        </p>
      ) : null}

      {/* Save / compare row */}
      <div className="flex flex-wrap gap-3">
        <WishlistToggle productId={product.id} initialWishlisted={initialWishlisted} variant="page" />
        <CompareToggle item={compareItemFromCard(product)} variant="page" />
      </div>

      {selectedVariant && !inStock ? <NotifyMeInline skuId={selectedVariant.skuId} /> : null}
    </div>
  );
}
