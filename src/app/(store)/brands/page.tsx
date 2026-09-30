import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getBrands } from "@/server/services/catalog.service";
import { CtaBand } from "@/components/storefront/content-page-shell";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Brands — Surveillance & Networking Hardware",
  description:
    "Hikvision, Dahua, CP Plus, D-Link, Optilink and more — the brands we stock, warrant and support from our Surat hub.",
  robots: { index: true, follow: true },
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="max-w-2xl">
          <p className="label-caps">Brands</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Hardware we stand behind
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Every brand on this wall is stocked genuine, warranted by its manufacturer and
            supported by our counter engineers in Surat.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {brands.map((brand, i) => (
            <Reveal key={brand.id} delay={(i % 3) * 60} className="h-full">
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-whisper transition-shadow duration-300 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{brand.name}</h2>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                {brand.description && (
                  <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{brand.description}</p>
                )}
                <p className="label-caps mt-auto pt-6 !text-[10px]">
                  {brand._count.products} product{brand._count.products === 1 ? "" : "s"}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <CtaBand
        variant="sand"
        title="Missing a brand from your bill of quantities?"
        body="The trade desk sources against authorized supply where Indian warranty service exists — send the brand and line items and we will confirm stocking or lead time."
        href="/contact"
        ctaLabel="Ask the trade desk"
        secondaryHref="/products"
        secondaryLabel="Browse the catalog"
      />
    </>
  );
}
