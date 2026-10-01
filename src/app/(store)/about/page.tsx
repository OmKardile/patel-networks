import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HardHat, MapPin, MessageCircle, Phone, ReceiptText, ShieldCheck } from "lucide-react";
import { getBrands, getCategoryTree } from "@/server/services/catalog.service";
import { STORE } from "@/lib/constants";
import { Breadcrumb } from "@/components/storefront/breadcrumb";

export const metadata: Metadata = {
  title: "About Patel Networks — Surveillance & Networking Hardware from Surat | MegaTechzy",
  description:
    "Patel Networks (MegaTechzy) is a Surat-based distributor of CCTV, surveillance and networking hardware — authorized Hikvision, Dahua, CP Plus, WD and D-Link stock with GST invoicing and serial-tracked warranty.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/about" },
};

const COMMITMENTS = [
  {
    icon: ShieldCheck,
    title: "Authorized, genuine hardware",
    body: "We stock through authorized supply. Every recorder, camera and drive carries the manufacturer's India warranty, and serial numbers are recorded at dispatch so a warranty claim never depends on a paper trail you have lost.",
  },
  {
    icon: HardHat,
    title: "SKU-level inventory discipline",
    body: "Stock is tracked per SKU, not per shelf. Available quantity is the difference between received stock and live reservations, and every movement — purchase receipt, order reservation, dispatch, return restock — is written to an immutable movement log.",
  },
  {
    icon: ReceiptText,
    title: "GST-first commerce",
    body: "Prices are GST-inclusive and every order gets a proper tax invoice: CGST and SGST for Gujarat deliveries, IGST for the rest of India, HSN codes per line. Business buyers add a GSTIN at checkout and the same invoice feeds their input tax credit.",
  },
  {
    icon: MessageCircle,
    title: "A trade desk for installers",
    body: "Contractors, system integrators and electrical consultants get a dedicated consultation desk: specification help, kit pricing with the bundle discount, and bank-transfer settlement for institutional orders above online limits.",
  },
] as const;

export default async function AboutPage() {
  const [categories, brands] = await Promise.all([getCategoryTree(), getBrands()]);

  return (
    <div className="pb-0">
      {/* Hero */}
      <section className="bg-hero-ivory">
        <div className="container-inner pb-10 pt-12 md:pb-12 md:pt-16">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About" }]} className="mb-6" />
          <div className="max-w-3xl">
            <p className="label-caps">About Patel Networks</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              A counter, a warehouse, and a ledger that adds up
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {STORE.legalName} supplies CCTV, surveillance and structured networking hardware to retail buyers,
              installers and system integrators across India, from a single fulfillment hub in Surat, Gujarat.
            </p>
            <p className="label-caps mt-6 !text-[10px]">
              Surat, Gujarat · Origin PIN {STORE.originPin}
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container-inner py-12 md:py-16" aria-labelledby="about-story">
        <div className="rounded-lg border border-border bg-card p-6 shadow-whisper sm:p-10">
          <p className="label-caps">The business</p>
          <h2 id="about-story" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Surveillance hardware, specified right
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p>
              Patel Networks began as a trade counter serving electricians and security contractors in Surat&apos;s
              commercial hardware market, and grew into a focused distribution business under the MegaTechzy name. The
              trade is specific: cameras, recorders, surveillance-rated storage, cable, connectors and the networking
              hardware that ties a site together. We do not sell general electronics — depth in one category is the
              service.
            </p>
            <p>
              Customers are of two kinds. Walk-in and online retail buyers fitting a shop, office, home or farm need a
              working kit at a fair price — recorder, cameras, drive, cable — which is why the site offers a guided{" "}
              <Link href="/kit-builder" className="underline underline-offset-2 hover:text-foreground">
                kit builder
              </Link>{" "}
              that assembles a compatible set in five steps. Installers and system integrators buying for client sites
              need repeatable SKUs, GST invoices that survive an accountant&apos;s review, and stock positions they can
              trust.
            </p>
            <p>
              Both kinds of customer get the same operating standard: genuine goods from authorized supply, honest
              stock numbers, same-day carrier handover for paid orders before the {STORE.dispatchCutoff} cutoff, and a
              warranty process built on serial numbers rather than goodwill.
            </p>
          </div>
        </div>
      </section>

      {/* What we stock — category discovery */}
      <section className="container-inner pb-12 md:pb-16" aria-labelledby="about-stock">
        <p className="label-caps">What we stock</p>
        <h2 id="about-stock" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Depth before breadth
        </h2>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-whisper transition-shadow duration-300 hover:shadow-lift"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{cat.name}</h3>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </div>
                {cat.children.length > 0 ? (
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                    {cat.children.map((c) => c.name).join(" · ")}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* How we operate */}
      <section className="container-inner pb-12 md:pb-16" aria-labelledby="about-operate">
        <p className="label-caps">How we operate</p>
        <h2 id="about-operate" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Four commitments behind every order
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {COMMITMENTS.map((block) => (
            <div key={block.title} className="rounded-lg border border-border bg-card p-6 shadow-whisper">
              <block.icon className="h-5 w-5 text-primary" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-tight">{block.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{block.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands strip */}
      <section className="container-inner pb-12 md:pb-16" aria-labelledby="about-brands">
        <p className="label-caps">Brands we carry</p>
        <h2 id="about-brands" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Authorized distribution across the stack
        </h2>
        <ul className="mt-7 grid gap-x-10 gap-y-5 rounded-lg border border-border bg-card p-6 shadow-whisper sm:grid-cols-2 sm:p-8">
          {brands.map((brand) => (
            <li
              key={brand.id}
              className="border-t border-border pt-4 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0"
            >
              <Link href={`/brands/${brand.slug}`} className="group flex items-baseline justify-between gap-4">
                <span className="font-display text-lg font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                  {brand.name}
                </span>
                <span className="label-caps shrink-0 !text-[10px]">
                  {brand._count.products} product{brand._count.products === 1 ? "" : "s"}
                </span>
              </Link>
              {brand.description ? (
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{brand.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* Visit the counter band */}
      <section className="bg-brand text-brand-foreground">
        <div className="container-inner py-12 md:py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">
                The trade counter
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight lg:text-[1.7rem]">
                Specification questions deserve a phone call, not a form
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-brand-foreground/80">
                The Surat hub counter answers stock checks, cable-run planning and GST questions during business
                hours — or send the requirement ahead and a quotation meets you at the counter.
              </p>
              <p className="mt-4 flex items-center gap-2 text-[13px] text-brand-foreground/80">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {STORE.legalName} · Surat, Gujarat {STORE.originPin} · GSTIN {STORE.gstin}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="press inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-foreground px-6 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-background"
              >
                Plan a visit or a call
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
                className="link-underline inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-foreground/90 hover:text-brand-foreground"
              >
                <Phone className="h-4 w-4" aria-hidden /> {STORE.supportPhone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
