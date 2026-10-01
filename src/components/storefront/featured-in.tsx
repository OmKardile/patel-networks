import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SectionHeader } from "./section-header";

// FeaturedIn — reference press band repurposed honestly: NO fake press logos.
// The strip lists the store's real active brands as authorised distribution &
// service partners, each linking its PLP facet. Monogram tiles when no logo
// asset exists. Self-hides when the brand table is empty.

export function FeaturedIn({
  brands,
}: {
  brands: { id: string; name: string; slug: string; logoUrl?: string }[];
}) {
  if (!brands.length) return null;
  const headingId = "authorised-partners-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <SectionHeader
          eyebrow="Authorised distribution"
          title="Authorised Distribution & Service Partners"
          headingId={headingId}
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/products?brand=${brand.slug}`}
                className="group flex h-full items-center gap-3 rounded-lg border bg-card p-4 shadow-whisper transition-colors duration-200 hover:border-primary/40"
              >
                <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {brand.logoUrl ? (
                    <Image
                      src={brand.logoUrl}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-contain p-1.5"
                    />
                  ) : (
                    brand.name.slice(0, 2).toUpperCase()
                  )}
                </span>
                <span className="text-sm font-medium leading-tight group-hover:underline">
                  {brand.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-success" />
          Genuine stock sourced through official channels — GST invoice &amp; brand warranty on every order.
        </p>
      </div>
    </section>
  );
}
