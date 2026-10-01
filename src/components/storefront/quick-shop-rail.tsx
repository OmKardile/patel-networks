import Image from "next/image";
import Link from "next/link";
import type { CategoryFacet } from "@/server/services/catalog.service";

// QuickShopRail — reference top-of-main "SHOP & EXPLORE" strip: a horizontal,
// scroll-snap row of compact category slices (image circle + label + optional
// tag), rendered ABOVE the hero exactly like the reference homepage. Server
// component; slices are real destinations only (root categories, New
// arrivals, Kit Builder, All Products).

type Slice = {
  label: string;
  href: string;
  imageUrl?: string;
  tag?: string;
};

export function QuickShopRail({ categories }: { categories: CategoryFacet[] }) {
  const slices: Slice[] = [
    { label: "New arrivals", href: "/new-arrivals", tag: "New" },
    ...categories
      .filter((category) => category.imageUrl)
      .map((category) => ({
        label: category.name,
        href: `/products?category=${category.slug}`,
        imageUrl: category.imageUrl ?? undefined,
      })),
    { label: "Kit Builder", href: "/kit-builder" },
    { label: "All Products", href: "/products" },
  ];

  if (slices.length < 4) return null;

  return (
    <section aria-labelledby="quick-shop-heading" className="border-b bg-card">
      <div className="container-inner py-6 md:py-8">
        <p id="quick-shop-heading" className="label-caps">
          Shop &amp; explore
        </p>
        <ul className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slices.map((slice) => (
            <li key={slice.href + slice.label} className="w-[104px] shrink-0 snap-start md:w-[120px]">
              <Link href={slice.href} className="group flex flex-col items-center gap-2 text-center">
                <span className="relative block aspect-square w-full overflow-hidden rounded-full border bg-secondary">
                  {slice.imageUrl ? (
                    <Image
                      src={slice.imageUrl}
                      alt={slice.label}
                      fill
                      sizes="120px"
                      loading="eager"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-full w-full place-items-center text-xl font-semibold text-muted-foreground"
                    >
                      {slice.label.slice(0, 1)}
                    </span>
                  )}
                </span>
                {slice.tag ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-success">
                    {slice.tag}
                  </span>
                ) : null}
                <span className="text-sm font-medium leading-snug group-hover:underline">
                  {slice.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
