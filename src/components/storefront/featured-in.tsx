import Image from "next/image";
import Link from "next/link";
import { Medal } from "lucide-react";

// FeaturedIn — reference black press band repurposed honestly: NO fake press
// logos or awards. The right grid chips the store's REAL active brands
// (authorised distribution & service partners), each linking its PLP facet;
// brand logos render only when a real logo asset exists. Self-hides when the
// brand table is empty.

export function FeaturedIn({
  brands,
}: {
  brands: { id: string; name: string; slug: string; logoUrl?: string }[];
}) {
  if (!brands.length) return null;
  const headingId = "authorised-partners-heading";
  const chips = brands.slice(0, 6);

  return (
    <section aria-labelledby={headingId} className="px-3 py-12 md:px-4 md:py-16">
      <div className="rounded-2xl bg-[var(--band-black)] px-6 py-8 text-white md:px-10 md:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white">
              <Medal aria-hidden className="h-5 w-5 text-[#1c1b1b]" />
            </span>
            <h2
              id={headingId}
              className="mt-3 text-xl font-semibold tracking-tight md:text-2xl"
            >
              Authorised &amp; in stock
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Genuine stock sourced through official channels — GST invoice and brand warranty on
              every order.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {chips.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={`/products?brand=${brand.slug}`}
                  className="relative grid h-14 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.07] px-3 transition-colors hover:bg-white/[0.12]"
                >
                  {brand.logoUrl ? (
                    <>
                      <Image
                        src={brand.logoUrl}
                        alt=""
                        fill
                        sizes="(min-width:640px) 30vw, 45vw"
                        className="object-contain p-3"
                      />
                      <span className="sr-only">{brand.name}</span>
                    </>
                  ) : (
                    <span className="truncate text-sm font-semibold tracking-wide text-white/90">
                      {brand.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
