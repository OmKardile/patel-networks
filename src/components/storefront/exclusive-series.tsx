import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ExclusiveSeries — reference "Our Exclusive Series": centered heading over a
// 4-up row of large editorial collection tiles (image with title overlaid on a
// bottom gradient), 2-up on mobile, closing with a centered pill "View all".
// Tiles are REAL destinations: the kit-builder bundle and the store's root
// collections. Self-hides when fewer than two tiles exist.

export type SeriesTile = {
  title: string;
  caption: string;
  href: string;
  imageUrl?: string;
};

const VIEW_ALL_HREF = "/products?featured=1";

export function ExclusiveSeries({ tiles }: { tiles: SeriesTile[] }) {
  if (tiles.length < 2) return null;
  const headingId = "exclusive-series-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Exclusive series
          </p>
          <h2 id={headingId} className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">
            Our Exclusive Series
          </h2>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {tiles.map((tile) => (
            <li key={tile.href + tile.title}>
              <Link href={tile.href} className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
                  {tile.imageUrl ? (
                    <Image
                      src={tile.imageUrl}
                      alt={tile.title}
                      fill
                      sizes="(min-width:1024px) 25vw, 50vw"
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
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent"
                  />
                  <span className="absolute inset-x-3 bottom-3 block">
                    <span className="block text-base font-bold uppercase tracking-wide text-white md:text-lg">
                      {tile.title}
                    </span>
                    {tile.caption ? (
                      <span className="mt-0.5 block text-[11px] leading-snug text-white/75">
                        {tile.caption}
                      </span>
                    ) : null}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-center md:mt-8">
          <Link
            href={VIEW_ALL_HREF}
            className="relative inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 bg-white px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary after:absolute after:-inset-0.5 after:rounded-full after:content-['']"
          >
            View all
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
