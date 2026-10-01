"use client";

import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// WishlistToggle — POST/DELETE /api/wishlist/[productId]. Guests are sent to
// OTP login with ?next=. Card variant must stopPropagation/preventDefault.

export function WishlistToggle({
  productId,
  initialWishlisted = false,
  variant = "card",
  className,
}: {
  productId: string;
  initialWishlisted?: boolean;
  variant?: "card" | "page";
  className?: string;
}) {
  const [on, setOn] = useState(initialWishlisted);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !on;
    try {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: next ? "POST" : "DELETE",
      });
      if (res.status === 401) {
        toast({
          title: "Sign in to save items",
          description: "Verify your phone to use the wishlist.",
        });
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      if (!res.ok) throw new Error("failed");
      setOn(next);
      toast({
        title: next ? "Saved to wishlist" : "Removed from wishlist",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not update the wishlist. Try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (variant === "page") {
    return (
      <button
        type="button"
        onClick={(e) => toggle(e)}
        aria-pressed={on}
        aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 text-sm font-semibold hover:bg-secondary",
          className,
        )}
      >
        <Heart aria-hidden className={cn("h-4 w-4", on && "fill-destructive text-destructive")} />
        {on ? "Wishlisted" : "Add to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => toggle(e)}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-card/95 shadow-whisper transition-transform hover:scale-105",
        className,
      )}
    >
      <Heart
        aria-hidden
        className={cn("h-4 w-4", on ? "fill-destructive text-destructive" : "text-foreground")}
      />
    </button>
  );
}
