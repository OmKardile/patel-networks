"use client";

// CartDrawer — slide-over driven by useCartStore.drawerOpen (the reference
// pattern: never force navigation to /cart). Free-shipping progress uses the
// frozen ₹500 threshold; quantity stepping caps at the line's available stock
// and removing at zero goes through remove().

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, TriangleAlert, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { useCartStore, type CartLine } from "@/store/cart-store";
import { EmptyState } from "./empty-state";
import { Price } from "./price";
import { PriceRow } from "./price-row";

function FreeShippingStrip({ subtotalPaise }: { subtotalPaise: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise;
  const pct = Math.max(
    0,
    Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 100)),
  );
  return (
    <div className="border-b px-4 py-3">
      <p className="flex items-center gap-1.5 text-xs font-medium">
        <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {remaining > 0 ? (
          <span>
            Add <Price paise={remaining} className="font-semibold" /> more for free shipping
          </span>
        ) : (
          <span className="text-success">Free shipping unlocked on this order</span>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full", remaining > 0 ? "bg-foreground/60" : "bg-success")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const update = useCartStore((s) => s.update);
  const remove = useCartStore((s) => s.remove);
  const atCap = line.quantity >= line.availableStock;

  const step = (next: number) => {
    if (next < 1) void remove(line.skuId);
    else void update(line.skuId, next);
  };

  return (
    <li className="flex gap-3 px-4 py-4">
      {line.image ? (
        <Image
          src={line.image}
          alt={line.productName}
          width={64}
          height={80}
          className="h-20 w-16 shrink-0 rounded-md bg-secondary object-cover"
        />
      ) : (
        <span className="h-20 w-16 shrink-0 rounded-md bg-secondary" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${line.productSlug}`}
            className="line-clamp-2 text-sm font-medium hover:underline"
          >
            {line.productName}
          </Link>
          <button
            type="button"
            onClick={() => void remove(line.skuId)}
            aria-label={`Remove ${line.productName} from cart`}
            className="-mr-1 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {line.variantName ? (
          <p className="text-xs text-muted-foreground">{line.variantName}</p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">SKU {line.skuCode}</p>
        {!line.inStock ? (
          <p className="mt-1 inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
            Out of stock
          </p>
        ) : null}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border">
            <button
              type="button"
              onClick={() => step(line.quantity - 1)}
              aria-label={`Decrease quantity of ${line.productName}`}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="w-7 text-center text-sm font-medium">{line.quantity}</span>
            <button
              type="button"
              onClick={() => step(line.quantity + 1)}
              disabled={atCap}
              aria-label={`Increase quantity of ${line.productName}`}
              title={atCap ? `Only ${line.availableStock} in stock` : undefined}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <PriceRow
            pricePaise={line.lineTotalPaise}
            mrpPaise={line.mrpPaise * line.quantity}
            size="sm"
          />
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const cart = useCartStore((s) => s.cart);
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const savings = cart.mrpTotalPaise - cart.subtotalPaise;
  const empty = cart.lines.length === 0;

  return (
    <Sheet
      open={drawerOpen}
      onOpenChange={(next) => {
        if (!next) closeDrawer();
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 data-[state=open]:duration-300 sm:max-w-md"
      >
        <SheetHeader className="border-b p-4 pb-3">
          <SheetTitle className="text-base font-semibold">
            Your cart
            {cart.itemCount > 0
              ? ` · ${cart.itemCount} ${cart.itemCount === 1 ? "item" : "items"}`
              : ""}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Free shipping over {formatINR(FREE_SHIPPING_THRESHOLD_PAISE)} · GST tax invoice on
            every order.
          </SheetDescription>
        </SheetHeader>

        {empty ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            body="Add cameras, recorders and switches, or assemble a complete kit with every cable and accessory matched."
            className="flex-1"
          >
            <Button asChild className="h-11">
              <Link href="/products">Browse catalogue</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/kit-builder">Build a kit</Link>
            </Button>
          </EmptyState>
        ) : (
          <>
            <FreeShippingStrip subtotalPaise={cart.subtotalPaise} />
            {cart.hasOutOfStock ? (
              <p className="flex items-start gap-2 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                An item is out of stock — adjust the quantity or remove it before checkout.
              </p>
            ) : null}
            <ul className="thin-scrollbar flex-1 divide-y overflow-y-auto">
              {cart.lines.map((line) => (
                <CartLineRow key={line.skuId} line={line} />
              ))}
            </ul>
            <div className="border-t p-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>
                    <Price paise={cart.subtotalPaise} className="font-semibold" />
                  </dd>
                </div>
                {savings > 0 ? (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">You save</dt>
                    <dd className="text-success">
                      <Price paise={savings} className="font-medium" />
                    </dd>
                  </div>
                ) : null}
              </dl>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Prices are GST-inclusive · shipping calculated at checkout.
              </p>
              <div className="mt-3 grid gap-2">
                <Button asChild className="h-11">
                  <Link href="/checkout" onClick={closeDrawer}>
                    Checkout
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11">
                  <Link href="/cart" onClick={closeDrawer}>
                    View full cart
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
