import Image from "next/image";
import Link from "next/link";
import { SectionHeader } from "./section-header";

// ExclusiveSeries — reference "Our Exclusive Series": a 4-up row of large
// editorial collection tiles (image + series name), 2x2 on mobile, closing
// with a View-all link. Tiles are REAL destinations: the kit-builder bundle
// and the store's root collections.

export type SeriesTile = {
  title: string;
  caption: string;
  href: string;
  imageUrl?: string;
};

export function ExclusiveSeries({ tiles }: { tiles: SeriesTile[] }) {
  if (tiles.length < 2) return null;
  const headingId = "exclusive-series-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <SectionHeader
          eyebrow="Exclusive series"
          title="Trade Desk Picks"
          href="/products?featured=1"
          linkLabel="View all"
          headingId={headingId}
        />
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {tiles.map((tile) => (
            <li key={tile.href + tile.title}>
              <Link href={tile.href} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-lg border bg-secondary">
                  {tile.imageUrl ? (
                    <Image
                      src={tile.imageUrl}
                      alt={tile.title}
                      fill
                      sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="grid h-full w-full place-items-center text-3xl font-semibold text-muted-foreground"
                    >
                      {tile.title.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="mt-3 block">
                  <span className="block text-base font-semibold tracking-tight group-hover:underline">
                    {tile.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">{tile.caption}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 lg:hidden">
          <Link href="/products?featured=1" className="link-underline inline-flex min-h-[44px] items-center text-sm font-medium">
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
