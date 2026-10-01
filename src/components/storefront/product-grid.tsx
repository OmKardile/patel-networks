import { ApiProductCard } from "@/lib/serializers";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

// ProductGrid — reference PLP density: 2-col mobile / 3 tablet / 4 desktop.

export function ProductGrid({
  products,
  wishlistIds,
  className,
}: {
  products: ApiProductCard[];
  wishlistIds?: string[];
  className?: string;
}) {
  const wished = new Set(wishlistIds ?? []);
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4",
        className,
      )}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} wishlisted={wished.has(p.id)} />
      ))}
    </div>
  );
}
