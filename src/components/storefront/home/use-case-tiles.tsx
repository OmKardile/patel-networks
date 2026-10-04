// Use-case tiles — blueprint §1.2 slot 10 ("Shop By Use" discovery band).
// The existing category circles re-housed under a discovery head; every tile
// links to a real category slug from getCategoryTree(). Zero fabricated tiles.

import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import type { CategoryFacet } from "@/server/services/catalog.service";
import { SectionHead } from "./section-head";

export function UseCaseTiles({ categories }: { categories: CategoryFacet[] }) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="use-case-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
      <SectionHead
        headingId="use-case-heading"
        eyebrow="Designed for your site"
        title="Shop by use."
        lede="Start from what the site needs — every range below is stocked at SKU level in Surat."
      />
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((root, i) => (
          <Reveal key={root.id} delay={i * 60}>
            <Link
              href={`/products?category=${root.slug}`}
              className="group flex flex-col items-center text-center"
              aria-label={`Shop ${root.name}`}
            >
              <span className="relative flex aspect-square w-full max-w-[190px] items-center justify-center overflow-hidden rounded-full border border-border bg-card shadow-whisper transition-all duration-200 group-hover:shadow-lift">
                {root.imageUrl ? (
                  <Image
                    src={root.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 190px, 45vw"
                    className="rounded-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                ) : (
                  <Camera className="h-10 w-10 text-muted-foreground" aria-hidden />
                )}
              </span>
              <span className="mt-3 text-sm font-medium leading-snug">{root.name}</span>
              {root.children.length > 0 && (
                <span className="mt-0.5 text-[11px] text-muted-foreground">
                  {root.children.length} range{root.children.length === 1 ? "" : "s"}
                </span>
              )}
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
