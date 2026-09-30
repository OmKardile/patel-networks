"use client";

// Storefront product card — rebuilt from zero for the Neeman's-clone
// storefront. Input is the serialized catalog shape. Behavior: hover crossfades
// to the second image, quick-add drops the default SKU into the server cart and
// opens the drawer, wishlist/compare toggles ride along, discount reads as a
// sand chip on the image.

import Link from "next/link";
import { Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/store/cart-store";
import { WishlistToggle } from "@/components/storefront/wishlist-toggle";
import { CompareToggle } from "@/components/storefront/compare-toggle";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ApiProductCard } from "@/lib/serializers";

interface ProductCardProps {
  product: ApiProductCard;
  priority?: boolean;
  className?: string;
  /** Server-computed: the signed-in customer has this product wishlisted. */
  wishlisted?: boolean;
}

export function ProductCard({ product, className, wishlisted = false }: ProductCardProps) {
  const add = useCartStore((s) => s.add);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { toast } = useToast();

  const image = product.images[0]?.url;
  const altImage = product.images[1]?.url;
  const defaultVariant = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const compareItem = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: image ?? null,
    priceFromPaise: product.priceFromPaise,
    brandName: product.brand.name,
  };

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant) return;
    const result = await add(defaultVariant.skuId, 1);
    if (result.ok) {
      toast({ title: "Added to cart", description: `${product.name} — ${defaultVariant.name}` });
      openDrawer();
    } else {
      toast({ title: "Could not add", description: result.error, variant: "destructive" });
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:shadow-lift",
        className
      )}
    >
      {/* image block */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image ? (
          <>
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            {altImage && (
              <img
                src={altImage}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}

        {/* sand discount chip — image corner, AA-safe on sand */}
        {product.discountPct > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-sand px-2 py-0.5 text-[10.5px] font-semibold text-sand-foreground">
            {product.discountPct}% off
          </span>
        )}

        {/* wishlist + compare column */}
        <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5">
          <WishlistToggle productId={product.id} productName={product.name} initialAdded={wishlisted} variant="card" />
          <CompareToggle item={compareItem} variant="card" />
        </div>

        {/* stock whisper */}
        {!product.inStock ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-background">
            Out of stock
          </span>
        ) : product.availableStock <= 10 ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium text-foreground shadow-whisper">
            Only {product.availableStock} left
          </span>
        ) : null}
      </div>

      {/* info block */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="label-caps !text-[10px] !tracking-[0.16em]">{product.brand.name}</span>
        <h3 className="line-clamp-2 min-h-[2.6em] text-[14px] font-medium leading-snug text-foreground">{product.name}</h3>
        {product.ratingCount > 0 && product.ratingAvg !== null && (
          <p className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <Star className="h-3 w-3 fill-star text-star" aria-hidden />
            <span className="font-medium text-foreground">{product.ratingAvg.toFixed(1)}</span>
            <span>({product.ratingCount})</span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-display text-lg leading-none">
              {formatINR(product.priceFromPaise)}
              {product.variants.length > 1 && (
                <span className="ml-1 align-middle font-sans text-[10.5px] font-normal text-muted-foreground">onwards</span>
              )}
            </span>
            {product.discountPct > 0 && <s className="text-[12px] text-muted-foreground">{formatINR(product.mrpFromPaise)}</s>}
          </div>

          {/* desktop quick-add */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={!defaultVariant?.inStock}
            aria-label={`Add ${product.name} to cart`}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40 sm:flex"
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* mobile add-to-cart pill */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!defaultVariant?.inStock}
          className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background text-[13px] font-medium text-foreground transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground active:bg-primary active:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:hidden"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add to cart
        </button>
      </div>
    </Link>
  );
}
