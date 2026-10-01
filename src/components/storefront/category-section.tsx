import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import type { CategoryFacet } from "@/server/services/catalog.service";
import { SectionHeader } from "./section-header";

// CategorySection — reference "Shop by Category" discovery row: root
// categories as aspect-square rounded-full image circles (monogram tile when
// a root has no imageUrl), child count underneath, linking the PLP facet.

export function CategorySection({ categories }: { categories: CategoryFacet[] }) {
  if (!categories.length) return null;
  const headingId = "shop-by-category-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <SectionHeader eyebrow="Find the right gear" title="Shop by category" headingId={headingId} />
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, i) => (
            <li key={category.id}>
              <Reveal delay={i * 60}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group flex h-full flex-col items-center gap-3 text-center"
                >
                  <span className="relative block aspect-square w-full overflow-hidden rounded-full border bg-secondary">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 46vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="grid h-full w-full place-items-center text-2xl font-semibold text-muted-foreground"
                      >
                        {category.name.slice(0, 1)}
                      </span>
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-medium leading-snug group-hover:underline">
                      {category.name}
                    </span>
                    {category.children.length > 0 ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {category.children.length} {category.children.length === 1 ? "subcategory" : "subcategories"}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
