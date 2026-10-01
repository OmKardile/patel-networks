"use client";

import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";

// AddToCart — single add path: store.add → toast → optional drawer open.
// Used by card quick-add, PDP buy box, sticky bar, kit summary.

export function AddToCartButton({
  skuId,
  quantity = 1,
  label = "Add to cart",
  openAfter = true,
  disabled = false,
  size = "default",
  variant = "pill",
  className,
}: {
  skuId: string | null | undefined;
  quantity?: number;
  label?: string;
  openAfter?: boolean;
  disabled?: boolean;
  size?: "default" | "sm";
  variant?: "pill" | "outline";
  className?: string;
}) {
  const add = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const onAdd = async () => {
    if (!skuId || busy) return;
    setBusy(true);
    const res = await add(skuId, quantity);
    setBusy(false);
    if (res.ok) {
      toast({ title: "Added to cart", description: "Item is in your cart." });
      if (openAfter) openDrawer();
    } else {
      toast({
        title: "Could not add to cart",
        description: res.error ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled || busy || !skuId}
      className={cn(
        "press inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "min-h-[38px] px-4 text-[13px]",
        variant === "pill"
          ? "bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground"
          : "border bg-card hover:bg-secondary",
        className,
      )}
      aria-busy={busy}
    >
      {busy ? (
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
      ) : (
        <ShoppingCart aria-hidden className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
