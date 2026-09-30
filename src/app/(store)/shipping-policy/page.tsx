import type { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, Plane } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STORE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shipping Policy — Dispatch Cutoff, Zones & Carriers",
  description:
    "Orders paid before 4:00 PM IST dispatch same-day from Surat. Gujarat 1–2 days, metros 2–3, regional 3–4, special zones 5–7. Carriers: Delhivery, Shiprocket network, BlueDart air.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/shipping-policy" },
};

const ZONES = [
  {
    zone: "Gujarat — home zone",
    prefixes: "36x, 37x, 38x, 39x",
    transit: "1–2 working days",
    cod: "Available",
  },
  {
    zone: "Major metros",
    prefixes: "11 (Delhi), 12, 20 (Pune), 40/41 (Hyderabad), 50/56 (Bengaluru), 60 (Chennai), 70 (Kolkata)",
    transit: "2–3 working days",
    cod: "Available",
  },
  {
    zone: "Regional hubs & tier-2/3",
    prefixes: "Most other series",
    transit: "3–4 working days",
    cod: "Available",
  },
  {
    zone: "Special / remote zones",
    prefixes: "78x, 79x (North-East), 19x (J&K), 744 (A&N)",
    transit: "5–7 working days",
    cod: "Blocked",
  },
] as const;

export default function ShippingPolicyPage() {
  return (
    <div className="pb-0">
      {/* Header */}
      <header className="mx-auto max-w-3xl px-4 pt-14 text-center sm:px-6 lg:pt-20">
        <p className="label-caps">Shipping policy</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          Dispatched from Surat, tracked to your door
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          One fulfillment hub, published transit windows and no surprise fees. This page describes how orders leave our
          Surat warehouse and when they should reach your pincode.
        </p>
        <p className="label-caps mt-6 !text-[10px]">Applies to all store orders</p>
      </header>

      {/* Policy sheet — one white card, hairline-divided sections */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <div className="rounded-xl border border-border bg-card px-6 py-2 shadow-whisper sm:px-10 sm:py-4">
          {/* Dispatch */}
          <section className="border-b border-border py-8" aria-labelledby="sp-dispatch">
            <p className="label-caps">Dispatch</p>
            <h2 id="sp-dispatch" className="mt-1.5 font-display text-xl tracking-tight">The 4:00 PM IST cutoff</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Orders paid before <strong className="font-semibold">{STORE.dispatchCutoff}</strong> on a working day
                are packed and handed to the carrier <em>the same working day</em> from our Surat hub (origin PIN{" "}
                {STORE.originPin}). Orders paid after the cutoff, on Sundays or on public holidays join the next
                working day&apos;s dispatch.
              </p>
              <p>
                Once the label is generated, the AWB / tracking number appears in your account and is sent to your
                WhatsApp number. Dispatch is when physical stock is decremented — reserved stock is already held
                against your order from the moment of confirmation.
              </p>
            </div>
          </section>

          {/* Zones */}
          <section className="border-b border-border py-8" aria-labelledby="sp-zones">
            <p className="label-caps">Transit windows</p>
            <h2 id="sp-zones" className="mt-1.5 font-display text-xl tracking-tight">Delivery zones and estimates</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
              Transit estimates below are indicative working-day windows after dispatch. The pincode checker on every
              product page returns the exact estimate for your area.
            </p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[22%]">Zone</TableHead>
                    <TableHead>Typical pincodes</TableHead>
                    <TableHead className="w-[18%]">Transit</TableHead>
                    <TableHead className="w-[14%]">COD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ZONES.map((z) => (
                    <TableRow key={z.zone}>
                      <TableCell className="font-medium">{z.zone}</TableCell>
                      <TableCell className="text-muted-foreground">{z.prefixes}</TableCell>
                      <TableCell>{z.transit}</TableCell>
                      <TableCell>
                        {z.cod === "Available" ? (
                          <span className="text-foreground/80">{z.cod}</span>
                        ) : (
                          <span className="font-medium text-destructive">{z.cod}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="mt-5 space-y-2 text-[13px] leading-relaxed text-muted-foreground">
              <li className="flex gap-2">
                <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Carriers: <strong className="font-medium text-foreground">Delhivery</strong> and the{" "}
                  <strong className="font-medium text-foreground">Shiprocket</strong> carrier network, with{" "}
                  <strong className="font-medium text-foreground">BlueDart</strong> for air consignments.
                </span>
              </li>
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  &ldquo;Working days&rdquo; exclude Sundays and public holidays; remote-zone weather can extend the
                  window beyond our control.
                </span>
              </li>
            </ul>
          </section>

          {/* Air */}
          <section className="border-b border-border py-8" aria-labelledby="sp-air">
            <p className="label-caps">Air consignments</p>
            <h2 id="sp-air" className="mt-1.5 font-display text-xl tracking-tight">Lithium and heavy items fly</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                <Plane className="mb-0.5 mr-1 inline h-4 w-4 text-primary" aria-hidden />
                Some items — cameras with fitted lithium cells, and heavier multi-unit consignments — move by air
                cargo rather than surface linehaul where the destination zone demands it. This keeps the published
                transit window honest for distant pincodes. Air routing is chosen at dispatch by the carrier network;
                it does not change your shipping fee.
              </p>
            </div>
          </section>

          {/* Fees */}
          <section className="py-8" aria-labelledby="sp-fees">
            <p className="label-caps">Fees &amp; COD</p>
            <h2 id="sp-fees" className="mt-1.5 font-display text-xl tracking-tight">What shipping costs</h2>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/90">
              <li>
                <strong className="font-semibold">Standard shipping:</strong> ₹99 per order, free on orders of ₹500 and
                above. The fee is shown at checkout before payment.
              </li>
              <li>
                <strong className="font-semibold">Cash on delivery:</strong> available selectively — per product and
                per zone — on orders up to ₹15,000. A ₹49 COD handling fee applies. COD is blocked for special/remote
                zones and for prepaid-only products.
              </li>
              <li>
                <strong className="font-semibold">Institutional orders:</strong> bank transfer details are shared on
                request for orders above online limits; freight for bulk consignments is quoted by the trade desk.
              </li>
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Undelivered parcels return to the Surat hub after repeated carrier attempts; prepaid amounts are then
              refunded per the{" "}
              <Link href="/return-policy" className="underline underline-offset-2 hover:text-foreground">
                return policy
              </Link>
              . Questions about a shipment in transit? Use{" "}
              <Link href="/track" className="underline underline-offset-2 hover:text-foreground">
                track order
              </Link>{" "}
              or WhatsApp the desk.
            </p>
          </section>
        </div>
      </div>

      {/* CTA band — full-bleed deep green */}
      <section className="mt-16 bg-brand text-brand-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">
              Before you order
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              Delivery question about a specific pincode?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-foreground/75">
              Check serviceability, transit window and COD availability for any Indian pincode before you order.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center rounded-full bg-brand-foreground px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-foreground/90"
              >
                Use the pincode checker
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-brand-foreground/35 px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-foreground/10"
              >
                Contact the trade desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
