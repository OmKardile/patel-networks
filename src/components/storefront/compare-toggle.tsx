"use client";

import { Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompareStore, type CompareItem } from "@/store/compare-store";
import { cn } from "@/lib/utils";

// CompareToggle — zustand-persist store (pn-compare-v1), max 4 items.

export function CompareToggle({
  item,
  variant = "card",
  className,
}: {
  item: CompareItem;
  variant?: "card" | "page";
  className?: string;
}) {
  const toggle = useCompareStore((s) => s.toggle);
  const items = useCompareStore((s) => s.items);
  const { toast } = useToast();
  const on = items.some((i) => i.id === item.id);

  const onToggle = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const res = toggle(item);
    if (res === "added") toast({ title: "Added to compare" });
    if (res === "removed") toast({ title: "Removed from compare" });
    if (res === "full")
      toast({
        title: "Compare is full",
        description: "You can compare up to 4 products.",
        variant: "destructive",
      });
  };

  if (variant === "page") {
    return (
      <button
        type="button"
        onClick={(e) => onToggle(e)}
        aria-pressed={on}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-5 text-sm font-semibold hover:bg-secondary",
          className,
        )}
      >
        <Scale aria-hidden className="h-4 w-4" />
        {on ? "In compare" : "Compare"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => onToggle(e)}
      aria-pressed={on}
      aria-label={on ? "Remove from compare" : "Add to compare"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full bg-card/95 shadow-whisper transition-transform hover:scale-105",
        on && "ring-1 ring-accent",
        className,
      )}
    >
      <Scale aria-hidden className="h-4 w-4" />
    </button>
  );
}

// Map an ApiProductCard to the persisted CompareItem snapshot.
export function compareItemFromCard(p: {
  id: string;
  slug: string;
  name: string;
  images: { url: string; alt?: string | null }[];
  priceFromPaise: number;
  brand?: { name: string } | null;
}): CompareItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    imageUrl: p.images[0]?.url ?? null,
    priceFromPaise: p.priceFromPaise,
    brandName: p.brand?.name ?? "",
  };
}
