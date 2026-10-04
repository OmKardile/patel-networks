// Featured in — blueprint §1.2 slot 13 (press-band analog, made GENUINE):
// no fake press logos or awards — this is the authorised distribution &
// service partner wall, real brand rows from getBrands() linking to filtered
// catalog pages.

import Link from "next/link";
import { SectionHead } from "./section-head";

interface PartnerBrand {
  id: string;
  name: string;
  slug: string;
}

export function FeaturedIn({ brands }: { brands: PartnerBrand[] }) {
  if (brands.length === 0) return null;

  return (
    <section aria-labelledby="partners-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
      <SectionHead
        headingId="partners-heading"
        eyebrow="Featured in"
        title="Authorised distribution & service partners."
        lede="Direct-authorised lines with brand warranty backing — the brands we buy from, stock and service."
        href="/brands"
        linkLabel="All brands"
      />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {brands.slice(0, 10).map((brand) => (
          <Link
            key={brand.id}
            href={`/products?brand=${brand.slug}`}
            className="flex h-16 items-center justify-center rounded-xl border border-border bg-card px-4 text-center text-sm font-semibold tracking-tight shadow-whisper transition-all duration-200 hover:shadow-lift"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
