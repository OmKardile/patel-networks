import type { Metadata } from "next";
import Link from "next/link";
import { HardHat, MapPin, MessageCircle, Phone, Boxes, ReceiptText, ShieldCheck } from "lucide-react";
import { getBrands } from "@/server/services/catalog.service";
import { STORE } from "@/lib/constants";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "About Patel Networks — Surveillance & Networking Hardware from Surat | MegaTechzy",
  description:
    "Patel Networks (MegaTechzy) is a Surat-based distributor of CCTV, surveillance and networking hardware — authorized Hikvision, Dahua, CP Plus, WD and D-Link stock with GST invoicing and serial-tracked warranty.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/about" },
};

const VALUE_BLOCKS = [
  {
    icon: ShieldCheck,
    title: "Authorized, genuine hardware",
    body: "We stock Hikvision, Dahua, CP Plus, WD and D-Link through authorized supply. Every recorder, camera and drive carries the manufacturer's India warranty, and serial numbers are recorded at dispatch so a warranty claim never depends on a paper trail you have lost.",
  },
  {
    icon: Boxes,
    title: "SKU-level inventory discipline",
    body: "Stock is tracked per SKU, not per shelf. Available quantity is the difference between received stock and live reservations, and every movement — purchase receipt, order reservation, dispatch, return restock — is written to an immutable movement log.",
  },
  {
    icon: ReceiptText,
    title: "GST-first commerce",
    body: "Prices are GST-inclusive and every order gets a proper tax invoice: CGST and SGST for Gujarat deliveries, IGST for the rest of India, HSN codes per line. Business buyers add a GSTIN at checkout and the same invoice feeds their input tax credit.",
  },
  {
    icon: HardHat,
    title: "A trade desk for installers",
    body: "Contractors, system integrators and electrical consultants get a dedicated consultation desk: specification help, kit pricing with a 5% bundle discount, and bank-transfer settlement for institutional orders above online limits.",
  },
] as const;

const STATS = [
  { value: "4:00 PM", label: "same-day dispatch cutoff" },
  { value: "5%", label: "kit bundle discount" },
  { value: "7 days", label: "DOA replacement window" },
  { value: "2–3 yrs", label: "manufacturer warranties" },
] as const;

export default async function AboutPage() {
  const brands = await getBrands();

  return (
    <div className="pb-0">
      {/* Hero */}
      <section className="bg-hero-ivory">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="max-w-3xl">
            <p className="label-caps">About Patel Networks</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              A counter, a warehouse, and a ledger that adds up
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              Patel Networks — trading as MegaTechzy — supplies CCTV, surveillance and structured networking hardware
              to retail buyers, installers and system integrators across India, from a single fulfillment hub in
              Surat, Gujarat.
            </p>
            <p className="label-caps mt-6 !text-[10px]">Surat, Gujarat · Origin PIN {STORE.originPin}</p>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        {/* Stats strip — every figure is an operating fact from this store */}
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-whisper lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="bg-card px-6 py-7">
                <dd className="font-display text-3xl leading-none tracking-tight">{s.value}</dd>
                <dt className="label-caps mt-2.5 !text-[10px]">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Story — white card on greige */}
        <Reveal>
          <section className="mt-12 rounded-xl border border-border bg-card p-6 shadow-whisper sm:p-10">
            <p className="label-caps">The business</p>
            <h2 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">Surveillance hardware, specified right</h2>
            <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Patel Networks began as a trade counter serving electricians and security contractors in Surat&apos;s
                commercial hardware market, and grew into a focused distribution business under the MegaTechzy name.
                The trade is specific: cameras, recorders, surveillance-rated storage, cable, connectors and the
                networking hardware that ties a site together. We do not sell general electronics — depth in one
                category is the service.
              </p>
              <p>
                Customers are of two kinds. Walk-in and online retail buyers fitting a shop, office, home or farm need
                a working kit at a fair price — recorder, cameras, drive, cable — which is why the site offers a
                guided{" "}
                <Link href="/kit-builder" className="underline underline-offset-2 hover:text-foreground">
                  kit builder
                </Link>{" "}
                that assembles a compatible set in five steps. Installers and system integrators buying for client
                sites need repeatable SKUs, GST invoices that survive an accountant&apos;s review, and stock positions
                they can trust.
              </p>
              <p>
                Both kinds of customer get the same operating standard: genuine goods from authorized supply, honest
                stock numbers, same-day carrier handover for paid orders before the {STORE.dispatchCutoff} cutoff, and
                a warranty process built on serial numbers rather than goodwill.
              </p>
            </div>
          </section>
        </Reveal>

        {/* How we operate — four commitment cards */}
        <section className="mt-14" aria-labelledby="how-we-operate">
          <p className="label-caps">How we operate</p>
          <h2 id="how-we-operate" className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
            Four commitments behind every order
          </h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {VALUE_BLOCKS.map((block, i) => (
              <Reveal key={block.title} delay={(i % 2) * 60}>
                <div className="h-full rounded-xl border border-border bg-card p-6 shadow-whisper">
                  <block.icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-4 font-display text-lg leading-snug tracking-tight">{block.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{block.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Warranty discipline */}
        <Reveal>
          <section className="mt-14 rounded-xl border border-border bg-card p-6 shadow-whisper sm:p-10" aria-labelledby="warranty">
            <p className="label-caps">Warranty discipline</p>
            <h2 id="warranty" className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">Serial numbers, not goodwill</h2>
            <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Surveillance hardware is warranted by its manufacturer, and manufacturers settle claims by serial
                number. So serials are captured for warranty-bearing items at the moment of dispatch and stored against
                the order line. When something fails inside the warranty window, the replacement claim is matched to
                the exact unit that shipped — which is also what our{" "}
                <Link href="/return-policy" className="underline underline-offset-2 hover:text-foreground">
                  return and warranty policy
                </Link>{" "}
                requires for a fast RMA.
              </p>
            </div>
            <div className="mt-6 rounded-xl border border-border bg-muted/50 p-5">
              <p className="label-caps !text-[10px]">Typical manufacturer warranty periods</p>
              <ul className="mt-3 space-y-1.5 text-[13px] text-foreground/90">
                <li>CP Plus, Hikvision and Dahua cameras and recorders — 2 years</li>
                <li>WD Purple surveillance drives — 3 years</li>
                <li>The exact period for each product is printed on its product page and invoice</li>
              </ul>
            </div>
          </section>
        </Reveal>

        {/* Brands we carry */}
        <section className="mt-14" aria-labelledby="brands">
          <p className="label-caps">Brands we carry</p>
          <h2 id="brands" className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
            Authorized distribution across the stack
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-foreground/90">
            The catalog concentrates on brands with Indian service networks and documented warranty terms — the names
            an installer can put in a client bill of quantities without hesitation.
          </p>
          <ul className="mt-7 grid gap-x-10 gap-y-5 rounded-xl border border-border bg-card p-6 shadow-whisper sm:grid-cols-2 sm:p-8">
            {brands.map((brand) => (
              <li key={brand.id} className="border-t border-border pt-4 first:border-t-0 first:pt-0 sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:pt-0">
                <Link href={`/brands/${brand.slug}`} className="group flex items-baseline justify-between gap-4">
                  <span className="font-display text-lg tracking-tight group-hover:underline group-hover:underline-offset-4">
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

        {/* The hub */}
        <section className="mt-14" aria-labelledby="hub">
          <p className="label-caps">The hub</p>
          <h2 id="hub" className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">Everything ships from Surat</h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-xl border border-border bg-card p-6 shadow-whisper">
                <MapPin className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-lg tracking-tight">One warehouse, every order</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Fulfillment runs from the Surat Central hub (origin PIN {STORE.originPin}, state code{" "}
                  {STORE.originStateCode}). Orders paid before {STORE.dispatchCutoff} are handed to the carrier the
                  same working day; Gujarat deliveries typically arrive in 1–2 days, metros in 2–3.
                </p>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="h-full rounded-xl border border-border bg-card p-6 shadow-whisper">
                <Phone className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-lg tracking-tight">Reachable by phone, not just forms</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Specification questions are answered by counter engineers — call{" "}
                  <a
                    href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
                    className="text-foreground underline underline-offset-2"
                  >
                    {STORE.supportPhone}
                  </a>{" "}
                  during business hours, or message the trade desk on WhatsApp. B2B pricing and institutional orders go
                  through the{" "}
                  <Link href="/contact" className="text-foreground underline underline-offset-2">
                    consultation desk
                  </Link>
                  .
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* Closing band — the WhatsApp trade circle (same deep link the footer uses);
          catalog browse kept as the quiet secondary. */}
      <section className="mt-16 bg-brand text-brand-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">
              The trade circle
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              Join the Patel trade circle
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-foreground/75">
              Installers, contractors and resellers get stock arrivals, kit pricing and scheme notes from the trade
              desk on WhatsApp — retail buyers fitting their own sites are welcome too.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
                  "Hello Patel Networks — please add me to the trade circle updates."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-brand-foreground px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-foreground/90"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Message on WhatsApp
              </a>
              <Link
                href="/products"
                className="inline-flex items-center rounded-full border border-brand-foreground/35 px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-foreground/10"
              >
                Browse the catalog
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
