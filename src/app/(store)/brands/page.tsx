import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getBrands } from "@/server/services/catalog.service";
import { Breadcrumb } from "@/components/storefront/breadcrumb";

export const metadata: Metadata = {
  title: "Brands — Surveillance & Networking Hardware",
  description:
    "Hikvision, Dahua, CP Plus, D-Link, Optilink and more — the brands we stock, warrant and support from our Surat hub.",
  robots: { index: true, follow: true },
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands" }]} className="mb-8" />

      <header className="max-w-2xl">
        <p className="label-caps">Brands</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Hardware we stand behind
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Every brand on this wall is stocked genuine, warranted by its manufacturer and supported by our counter
          engineers in Surat.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            href={`/brands/${brand.slug}`}
            className="group flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-whisper transition-shadow duration-300 hover:shadow-lift"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight">{brand.name}</h2>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </div>
            {brand.description ? (
              <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{brand.description}</p>
            ) : null}
            <p className="label-caps mt-auto pt-6 !text-[10px]">
              {brand._count.products} product{brand._count.products === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-lg bg-sand p-6 text-sand-foreground sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight">
              Missing a brand from your bill of quantities?
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-sand-foreground/85">
              The trade desk sources against authorized supply where Indian warranty service exists — send the brand
              and line items and we will confirm stocking or lead time.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="press inline-flex min-h-[44px] items-center gap-2 rounded-full bg-sand-foreground px-6 py-2.5 text-sm font-medium text-sand transition-opacity hover:opacity-90"
            >
              Ask the trade desk
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/products" className="link-underline text-sm font-medium text-sand-foreground/90 hover:text-sand-foreground">
              Browse the catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
