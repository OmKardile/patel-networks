import { ApiProductCard } from "@/lib/serializers";
import { SectionHeader } from "./section-header";
import { RailWithArrows } from "./rail";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

// ProductCarousel — reference merchandising model: heading + supporting
// control, horizontally browsable cards, arrows, view-all destination.

const ITEM_WIDTHS =
  "w-[46%] min-[420px]:w-[42%] sm:w-[34%] md:w-[30%] lg:w-[23.5%] shrink-0 snap-start";

export function ProductCarousel({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  headingId,
  products,
  wishlistIds,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId?: string;
  products: ApiProductCard[];
  wishlistIds?: string[];
  className?: string;
}) {
  if (products.length === 0) return null;
  const wished = new Set(wishlistIds ?? []);
  return (
    <RailWithArrows
      label={title}
      className={cn("container-inner", className)}
      head={
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          lede={lede}
          href={href}
          linkLabel={linkLabel}
          headingId={headingId}
        />
      }
      railClassName="mt-6"
    >
      {products.map((p, i) => (
        <li key={p.id} className={ITEM_WIDTHS}>
          <ProductCard
            product={p}
            wishlisted={wished.has(p.id)}
            imagePriority={i === 0}
          />
        </li>
      ))}
    </RailWithArrows>
  );
}
