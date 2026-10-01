"use client";

// Wishlist row actions — remove (DELETE /api/wishlist/[productId]) and add the
// chosen variant to the cart (useCartStore.add — the drawer is NOT opened from
// the wishlist; the customer stays in context).

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";

export function WishlistActions({
  productId,
  productName,
  skuId,
  inStock,
}: {
  productId: string;
  productName: string;
  skuId: string | null;
  inStock: boolean;
}) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.add);
  const [busy, setBusy] = useState<"cart" | "remove" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function remove() {
    setBusy("remove");
    setMessage(null);
    try {
      const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        router.refresh();
      } else {
        setMessage(json.error ?? "Could not remove the item.");
      }
    } catch {
      setMessage("Network error — try again.");
    } finally {
      setBusy(null);
    }
  }

  async function add() {
    if (!skuId) return;
    setBusy("cart");
    setMessage(null);
    const res = await addToCart(skuId, 1);
    setBusy(null);
    if (res.ok) {
      setMessage("Added to cart.");
    } else {
      setMessage(res.error ?? "Could not add to cart.");
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="h-11 rounded-full px-4"
          onClick={() => void add()}
          disabled={!skuId || !inStock || busy !== null}
          aria-busy={busy === "cart"}
        >
          {busy === "cart" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShoppingCart className="h-4 w-4" aria-hidden />}
          {inStock ? "Add to cart" : "Out of stock"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 rounded-full text-muted-foreground hover:text-destructive"
          onClick={() => void remove()}
          disabled={busy !== null}
          aria-busy={busy === "remove"}
          aria-label={`Remove ${productName} from wishlist`}
        >
          {busy === "remove" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <X className="h-4 w-4" aria-hidden />}
          Remove
        </Button>
      </div>
      {message ? (
        <p role="status" aria-live="polite" className="text-xs text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
