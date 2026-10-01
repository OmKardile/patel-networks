"use client";

// Cart view — calm line rows + one white summary slab. The server cart is the
// source of truth; the zustand store (hydrated by CartHydrator in the layout)
// mirrors it for optimistic UI. Empty state is a recovery surface, not a dead end.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Minus, Plus, ShieldCheck, ShoppingCart, Trash2, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore, type CartLine } from "@/store/cart-store";
import { formatINR } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import { EmptyState } from "@/components/storefront/empty-state";
import { CartCouponBox, readAppliedCoupon, type AppliedCoupon } from "@/components/storefront/cart-coupon-box";
import { toast } from "@/hooks/use-toast";

function LineThumb({ line }: { line: CartLine }) {
  if (line.image) {
    return (
      <img
        src={line.image}
        alt={line.productName}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-lg border border-border bg-background object-cover sm:h-24 sm:w-24"
      />
    );
  }
  return <div className="h-20 w-20 shrink-0 rounded-lg border border-border bg-muted sm:h-24 sm:w-24" aria-hidden />;
}

function CartLineRow({ line }: { line: CartLine }) {
  const update = useCartStore((s) => s.update);
  const remove = useCartStore((s) => s.remove);
  const [qtyBusy, setQtyBusy] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function changeQty(next: number) {
    if (qtyBusy || next === line.quantity) return;
    if (next < 1) {
      await removeItem();
      return;
    }
    setQtyBusy(true);
    const res = await update(line.skuId, next);
    if (!res.ok) {
      toast({ title: "Quantity not updated", description: res.error ?? "Not enough stock.", variant: "destructive" });
    }
    setQtyBusy(false);
  }

  async function removeItem() {
    setRemoving(true);
    await remove(line.skuId);
    setRemoving(false);
  }

  const maxQty = Math.max(line.availableStock, 0);
  const maxedOut = line.inStock && line.quantity >= maxQty;

  return (
    <li className="rounded-xl border border-border bg-card p-4 shadow-whisper sm:p-5">
      <div className="flex gap-4 sm:gap-5">
        <Link href={`/products/${line.productSlug}`} className="shrink-0" aria-label={line.productName}>
          <LineThumb line={line} />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
            <div className="min-w-0">
              <Link
                href={`/products/${line.productSlug}`}
                className="link-underline text-[15px] font-semibold leading-snug tracking-tight hover:text-primary sm:text-base"
              >
                {line.productName}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {line.variantName} · SKU <span className="font-mono">{line.skuCode}</span>
              </p>
            </div>
            <p className="whitespace-nowrap text-base font-semibold tabular-nums">{formatINR(line.lineTotalPaise)}</p>
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 pt-3.5">
            <div className="flex items-center gap-3">
              {/* pill stepper — 44px touch targets */}
              <div
                className="flex items-center rounded-full border border-border bg-background"
                role="group"
                aria-label={`Quantity for ${line.productName}`}
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => void changeQty(line.quantity - 1)}
                  disabled={qtyBusy || removing}
                  className="press flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                  {qtyBusy ? "…" : line.quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => void changeQty(line.quantity + 1)}
                  disabled={qtyBusy || removing || !line.inStock || line.quantity >= maxQty}
                  className="press flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatINR(line.unitPricePaise)} <span className="text-[10px]">/ unit · incl. GST</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!line.inStock ? (
                <span className="text-xs font-medium text-destructive">Not available</span>
              ) : maxedOut ? (
                <span className="text-xs text-muted-foreground">Max {maxQty} in stock</span>
              ) : null}
              <button
                type="button"
                onClick={() => void removeItem()}
                disabled={removing}
                className="inline-flex min-h-[44px] items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
                aria-label={`Remove ${line.productName} from cart`}
              >
                {removing ? (
                  <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" aria-hidden />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const cart = useCartStore((s) => s.cart);
  const loaded = useCartStore((s) => s.loaded);
  const refresh = useCartStore((s) => s.refresh);
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    if (!loaded) void refresh();
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setApplied(readAppliedCoupon());
    });
    return () => {
      cancelled = true;
    };
  }, [loaded, refresh]);

  const savings = useMemo(() => Math.max(cart.mrpTotalPaise - cart.subtotalPaise, 0), [cart.mrpTotalPaise, cart.subtotalPaise]);
  const payableAfterCoupon = Math.max(cart.subtotalPaise - cart.bundleDiscountPaise - (applied?.discountPaise ?? 0), 0);
  const shippingUnlocked = cart.subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE;
  const shippingProgress = Math.min(100, Math.floor((cart.subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 100));

  // --- skeleton while the cart hydrates ---
  if (!loaded) {
    return (
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-4 lg:col-span-7 xl:col-span-8">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  // --- empty state: calm + recovery paths ---
  if (cart.lines.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        body="Add cameras, recorders or cabling and they will show up here — every SKU is serial-tracked, GST-invoiced and dispatched from Surat. Your cart is saved on this device, so you can pick up where you left off."
      >
        <Button asChild className="h-11 px-6">
          <Link href="/products">
            Browse products <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 px-6">
          <Link href="/kit-builder">Build a kit</Link>
        </Button>
        <p className="w-full pt-2 text-xs text-muted-foreground">
          Or start from a shortcut:{" "}
          <Link href="/products?featured=1" className="link-underline font-medium text-foreground">
            Trade Desk Picks
          </Link>{" "}
          ·{" "}
          <Link href="/products?sort=newest" className="link-underline font-medium text-foreground">
            New arrivals
          </Link>
        </p>
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      {/* lines — one calm card per SKU */}
      <div className="lg:col-span-7 xl:col-span-8">
        {cart.hasOutOfStock && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            One or more items are no longer available in the requested quantity. Remove them or adjust the quantity before checkout.
          </div>
        )}

        <ul className="space-y-4">
          {cart.lines.map((line) => (
            <CartLineRow key={line.skuId} line={line} />
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} · dispatch cut-off {STORE.dispatchCutoff} (Mon–Sat)
          </span>
          <Link href="/products" className="link-underline inline-flex min-h-[44px] items-center font-medium text-foreground">
            Continue browsing <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>

      {/* summary — white slab, sticky */}
      <aside className="lg:col-span-5 xl:col-span-4" aria-label="Order summary">
        <div className="rounded-xl border border-border bg-card p-6 shadow-whisper lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold tracking-tight">Summary</h2>

          {/* free-shipping progress strip */}
          <div
            className={`mt-4 rounded-lg border p-3.5 ${
              shippingUnlocked ? "border-success/25 bg-success/[0.04]" : "border-border bg-muted/50"
            }`}
            role="status"
          >
            {shippingUnlocked ? (
              <p className="flex items-center gap-2 text-[13px] font-medium text-success">
                <Check className="h-4 w-4 shrink-0" aria-hidden />
                Free shipping unlocked — this cart ships free across India.
              </p>
            ) : (
              <>
                <p className="flex items-center justify-between gap-2 text-[13px] font-medium">
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    Add {formatINR(FREE_SHIPPING_THRESHOLD_PAISE - cart.subtotalPaise)} more
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground tabular-nums">{shippingProgress}%</span>
                </p>
                <div
                  className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-label="Progress toward free shipping"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={shippingProgress}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  for free shipping · free above {formatINR(FREE_SHIPPING_THRESHOLD_PAISE)} · pan-India delivery
                </p>
              </>
            )}
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})</span>
              <span className="font-medium tabular-nums">{formatINR(cart.subtotalPaise)}</span>
            </div>
            {savings > 0 && (
              <div className="flex items-baseline justify-between text-success">
                <span>Savings vs MRP</span>
                <span className="font-medium tabular-nums">− {formatINR(savings)}</span>
              </div>
            )}
            {cart.bundleApplied && cart.bundleDiscountPaise > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">
                  Kit bundle · {cart.bundleApplied.name} (−{cart.bundleApplied.discountPct}%)
                </span>
                <span className="font-medium text-success tabular-nums">− {formatINR(cart.bundleDiscountPaise)}</span>
              </div>
            )}
            {applied && (
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Coupon {applied.code}</span>
                <span className="font-medium text-success tabular-nums">− {formatINR(applied.discountPaise)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
          </div>

          <div className="mt-5 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm font-medium">Estimated total</span>
            <span className="text-2xl font-semibold tabular-nums">{formatINR(payableAfterCoupon)}</span>
          </div>
          <p className="mt-1 text-right text-[11px] text-muted-foreground">
            incl. {formatINR(cart.gstAmountPaise)} GST · taxable value {formatINR(cart.taxableBasePaise)}
          </p>

          <div className="mt-5">
            <CartCouponBox subtotalPaise={cart.subtotalPaise} applied={applied} onChange={setApplied} />
          </div>

          <Button asChild className="mt-5 h-12 w-full min-h-[44px] text-base" disabled={cart.hasOutOfStock}>
            <Link href="/checkout">
              Proceed to checkout <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          {cart.hasOutOfStock && (
            <p className="mt-2 text-center text-xs text-destructive">Resolve out-of-stock items to continue.</p>
          )}

          {/* trust row */}
          <div className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden /> Genuine stock with serial-tracked warranty
            </p>
            <p className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-success" aria-hidden /> Same-day dispatch from {STORE.city} before {STORE.dispatchCutoff}
            </p>
            <p className="flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 text-success" aria-hidden /> GST invoice on every order
            </p>
            <p className="flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-success" aria-hidden /> COD available up to ₹15,000 (fee applies)
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
