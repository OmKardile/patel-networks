"use client";

// Cart drawer — Neeman's pattern: the cart is a slide-over, never a forced
// navigation. The server cart (DB) stays the source of truth; the zustand
// store mirrors it for optimistic UI. Coupon handling stays on /cart — the
// drawer is deliberately minimal: lines, shipping progress, checkout.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useCartStore, type CartLine } from "@/store/cart-store";
import { formatINR } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

function DrawerLine({ line }: { line: CartLine }) {
  const update = useCartStore((s) => s.update);
  const remove = useCartStore((s) => s.remove);
  const [busy, setBusy] = useState(false);

  async function changeQty(next: number) {
    if (busy || next === line.quantity) return;
    if (next < 1) {
      await removeItem();
      return;
    }
    setBusy(true);
    const res = await update(line.skuId, next);
    if (!res.ok) {
      toast({ title: "Quantity not updated", description: res.error ?? "Not enough stock.", variant: "destructive" });
    }
    setBusy(false);
  }

  async function removeItem() {
    setBusy(true);
    await remove(line.skuId);
    setBusy(false);
  }

  const maxQty = Math.max(line.availableStock, 0);

  return (
    <li className="flex gap-3 py-4">
      <Link href={`/products/${line.productSlug}`} className="shrink-0" aria-label={line.productName}>
        {line.image ? (
          <img src={line.image} alt="" loading="lazy" className="h-16 w-16 rounded-lg border border-border object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-lg border border-border bg-muted" aria-hidden />
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${line.productSlug}`} className="link-underline line-clamp-2 text-sm font-medium leading-snug">
              {line.productName}
            </Link>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {line.variantName} · <span className="font-mono">{line.skuCode}</span>
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold tabular-nums">{formatINR(line.lineTotalPaise)}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <div className="flex items-center rounded-full border border-border" role="group" aria-label={`Quantity for ${line.productName}`}>
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => void changeQty(line.quantity - 1)}
              disabled={busy || !line.inStock}
              className="press flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold tabular-nums" aria-live="polite">
              {busy ? "…" : line.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => void changeQty(line.quantity + 1)}
              disabled={busy || !line.inStock || line.quantity >= maxQty}
              className="press flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!line.inStock && <span className="text-[11px] font-medium text-destructive">Not available</span>}
            <button
              type="button"
              onClick={() => void removeItem()}
              disabled={busy}
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
              aria-label={`Remove ${line.productName} from cart`}
            >
              {busy ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" /> : <Trash2 className="h-3 w-3" aria-hidden />}
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const cart = useCartStore((s) => s.cart);
  const loaded = useCartStore((s) => s.loaded);
  const refresh = useCartStore((s) => s.refresh);
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);

  useEffect(() => {
    if (drawerOpen && !loaded) void refresh();
  }, [drawerOpen, loaded, refresh]);

  const savings = Math.max(cart.mrpTotalPaise - cart.subtotalPaise, 0);
  const unlocked = cart.subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE;
  const progress = Math.min(100, Math.floor((cart.subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 100));

  return (
    <Sheet open={drawerOpen} onOpenChange={(open) => (open ? undefined : closeDrawer())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetTitle className="border-b border-border px-5 py-4 font-display text-lg font-semibold tracking-tight">
          Your cart
          {cart.itemCount > 0 && (
            <span className="ml-2 align-middle text-xs font-normal text-muted-foreground">
              {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </SheetTitle>
        <SheetDescription className="sr-only">Cart contents with a shortcut to checkout</SheetDescription>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted" aria-hidden>
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-display text-xl font-semibold tracking-tight">Nothing specified yet.</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cameras, recorders, cable and optical hardware — serial-tracked, GST-invoiced and dispatched from Surat within one business day.
            </p>
            <div className="mt-2 flex w-full max-w-xs flex-col gap-2.5">
              <Button asChild className="h-11 w-full" onClick={() => closeDrawer()}>
                <Link href="/products">Browse the catalogue</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 w-full" onClick={() => closeDrawer()}>
                <Link href="/kit-builder">Build a kit instead</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* free-shipping strip — same threshold math as /cart and checkout */}
            <div className="border-b border-border px-5 py-3" role="status">
              {unlocked ? (
                <p className="flex items-center gap-2 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Free shipping unlocked — this cart ships free across India.
                </p>
              ) : (
                <>
                  <p className="text-xs font-medium">
                    Add <span className="text-primary">{formatINR(FREE_SHIPPING_THRESHOLD_PAISE - cart.subtotalPaise)}</span> more for free shipping
                    <span className="float-right text-[11px] font-normal text-muted-foreground tabular-nums">{progress}%</span>
                  </p>
                  <div
                    className="mt-2 h-1 overflow-hidden rounded-full bg-border"
                    role="progressbar"
                    aria-label="Progress toward free shipping"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                  >
                    <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
                  </div>
                </>
              )}
            </div>

            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {cart.lines.map((line) => (
                <DrawerLine key={line.skuId} line={line} />
              ))}
            </ul>

            <div className="border-t border-border bg-card px-5 py-4">
              {cart.hasOutOfStock && (
                <p role="alert" className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  One or more items are no longer available in the requested quantity — resolve them on the full cart page.
                </p>
              )}
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">Subtotal</span>
                <span className="font-display text-lg font-semibold tabular-nums">{formatINR(cart.subtotalPaise)}</span>
              </div>
              {savings > 0 && <p className="mt-0.5 text-right text-[11px] text-primary">You save {formatINR(savings)} vs MRP</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                incl. {formatINR(cart.gstAmountPaise)} GST · shipping calculated at checkout
              </p>

              <div className="mt-4 grid gap-2.5">
                <Button asChild className="h-12 w-full text-base" onClick={() => closeDrawer()} aria-disabled={cart.hasOutOfStock}>
                  <Link href="/checkout">
                    Checkout <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 w-full" onClick={() => closeDrawer()}>
                  <Link href="/cart">View full cart</Link>
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" aria-hidden /> Serial-tracked warranty
                </span>
                <span className="inline-flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-success" aria-hidden /> Dispatch cut-off 4:00 PM IST
                </span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
