import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone, ReceiptText } from "lucide-react";
import { STORE } from "@/lib/constants";
import { ContentPageShell } from "@/components/storefront/content-page-shell";
import { buttonVariants } from "@/components/ui/button";

// /store-locator — brief deliverable "Store Locator". Rendered because the
// client genuinely operates a physical trade desk. Every fact below comes from
// client-owned constants and the production checklist (fulfilment hub address);
// nothing is fabricated. The map embed is a keyless Google Maps SEARCH for the
// documented address text — it locates the area, it does not invent a pin.

export const metadata: Metadata = {
  title: `Store Locator — ${STORE.city} Trade Desk | ${STORE.name}`,
  description: `Visit the ${STORE.name} trade desk in ${STORE.city}: address, counter hours, phone and WhatsApp. India-wide shipping on every catalogue item.`,
  alternates: { canonical: "/store-locator" },
};

const ADDRESS_LINE_1 = "Surat Central Logistics Node, Ring Road";
const ADDRESS_LINE_2 = `${STORE.city}, ${STORE.originState} ${STORE.originPin}`;
const MAPS_QUERY = encodeURIComponent(`${STORE.name}, ${ADDRESS_LINE_1}, ${ADDRESS_LINE_2}`);
const DIRECTIONS_HREF = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${MAPS_QUERY}&z=12&output=embed`;

export default function StoreLocatorPage() {
  const waHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — I'd like to check stock availability before visiting.",
  )}`;

  return (
    <ContentPageShell
      eyebrow="Store locator"
      title={`${STORE.city} trade desk`}
      lede={`One counter, honest stock: the ${STORE.name} trade desk in ${STORE.city} is where every order is packed, dispatched and supported. India-wide shipping covers everything on this site.`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Details card */}
        <section aria-labelledby="desk-details-heading" className="lg:col-span-2">
          <h2 id="desk-details-heading" className="sr-only">
            Trade desk details
          </h2>
          <div className="flex h-full flex-col gap-5 rounded-lg border bg-card p-4 sm:p-6">
            <div className="flex items-start gap-3">
              <MapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Address</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {STORE.legalName}
                  <br />
                  {ADDRESS_LINE_1}
                  <br />
                  {ADDRESS_LINE_2}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  GSTIN {STORE.gstin} · Fulfilment hub (PIN {STORE.originPin})
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Counter hours</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Open on working days.
                  <br />
                  Paid orders before {STORE.dispatchCutoff} dispatch the same day.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <h3 className="text-base font-semibold tracking-tight">Phone</h3>
                <a
                  href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
                  className="link-underline mt-1 inline-flex min-h-[44px] items-center text-sm font-medium"
                >
                  {STORE.supportPhone}
                </a>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-2">
              <a
                href={DIRECTIONS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ size: "lg" }) + " min-h-[44px]"}
              >
                <MapPin aria-hidden className="h-4 w-4" />
                Get directions
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "lg" }) + " min-h-[44px]"}
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                Check stock on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Map */}
        <section aria-labelledby="desk-map-heading" className="lg:col-span-3">
          <h2 id="desk-map-heading" className="sr-only">
            Map
          </h2>
          <div className="h-full min-h-[320px] overflow-hidden rounded-lg border bg-muted sm:min-h-[400px]">
            <iframe
              src={MAP_EMBED_SRC}
              title={`Map showing the ${STORE.name} trade desk area in ${STORE.city}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-[320px] w-full border-0 sm:min-h-[400px]"
            />
          </div>
        </section>
      </div>

      {/* What the desk handles — verifiable functions only */}
      <section aria-labelledby="desk-services-heading" className="mt-10">
        <h2 id="desk-services-heading" className="mb-4 text-lg font-semibold tracking-tight">
          What the trade desk handles
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <li className="rounded-lg border bg-card p-4 sm:p-6">
            <h3 className="text-base font-semibold tracking-tight">Dispatch point</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Every courier pickup starts here — the same PIN ({STORE.originPin}) that quotes your
              shipping rate at checkout.
            </p>
          </li>
          <li className="rounded-lg border bg-card p-4 sm:p-6">
            <h3 className="text-base font-semibold tracking-tight">B2B &amp; bulk desk</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Contractor pricing, project bills of materials and GST invoicing are worked out with
              the trade desk.
            </p>
            <Link href="/corporate" className="link-underline mt-2 inline-flex min-h-[44px] items-center text-sm font-medium">
              Bulk &amp; corporate desk
            </Link>
          </li>
          <li className="rounded-lg border bg-card p-4 sm:p-6">
            <h3 className="text-base font-semibold tracking-tight">GST documentation</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              <ReceiptText aria-hidden className="mr-1 inline h-4 w-4 text-success" />
              A GST invoice with our registered GSTIN ships with every order — retail or bulk.
            </p>
            <Link href="/contact" className="link-underline mt-2 inline-flex min-h-[44px] items-center text-sm font-medium">
              Contact the desk
            </Link>
          </li>
        </ul>
      </section>
    </ContentPageShell>
  );
}
