import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { ContentPageShell, ContentColumn, ContentSection } from "@/components/storefront/content-page-shell";

export const metadata: Metadata = {
  title: "Shipping Policy — Dispatch Cutoff, Zones & Carriers",
  description:
    "Orders paid before 4:00 PM IST dispatch same-day from Surat. Gujarat 1–2 days, metros 2–3, regional 3–4, special zones 5–7. Carriers: Delhivery and the Shiprocket network.",
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
    <ContentPageShell
      eyebrow="Shipping policy"
      title="Dispatched from Surat, tracked to your door"
      lede="One fulfillment hub, published transit windows and no surprise fees. This page describes how orders leave our Surat warehouse and when they should reach your pincode."
      aside="Applies to all store orders"
    >
      <ContentColumn>
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-6 py-2 shadow-whisper sm:px-10 sm:py-4">
          <ContentSection id="sp-dispatch" eyebrow="Dispatch" title="The 4:00 PM IST cutoff">
            <p>
              Orders paid before <strong className="font-semibold">{STORE.dispatchCutoff}</strong> on a working day are
              packed and handed to the carrier <em>the same working day</em> from our Surat hub (origin PIN{" "}
              {STORE.originPin}). Orders paid after the cutoff, on Sundays or on public holidays join the next working
              day&apos;s dispatch.
            </p>
            <p>
              Once the label is generated, the AWB / tracking number appears in your account and is sent to your
              WhatsApp number. Dispatch is when physical stock is decremented — reserved stock is already held against
              your order from the moment of confirmation.
            </p>
          </ContentSection>

          <ContentSection id="sp-zones" eyebrow="Transit windows" title="Delivery zones and estimates">
            <p>
              Transit estimates below are indicative working-day windows after dispatch (Sundays are excluded). The
              pincode checker on every product page returns the exact estimate for your area.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-[22%] border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Zone</th>
                    <th className="border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Typical pincodes</th>
                    <th className="w-[18%] border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Transit</th>
                    <th className="w-[14%] border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">COD</th>
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map((z) => (
                    <tr key={z.zone}>
                      <td className="border-b border-border px-4 py-2.5 text-[14px] font-medium">{z.zone}</td>
                      <td className="border-b border-border px-4 py-2.5 text-[14px] text-muted-foreground">{z.prefixes}</td>
                      <td className="border-b border-border px-4 py-2.5 text-[14px]">{z.transit}</td>
                      <td className={`border-b border-border px-4 py-2.5 text-[14px] ${z.cod === "Available" ? "text-foreground/80" : "font-medium text-destructive"}`}>
                        {z.cod}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
              <li>
                Carriers: <strong className="font-medium text-foreground">Delhivery</strong> and the{" "}
                <strong className="font-medium text-foreground">Shiprocket</strong> carrier network. Where a
                destination zone demands it, consignments are routed by air cargo at the carrier&apos;s discretion —
                this does not change your shipping fee.
              </li>
              <li>
                &ldquo;Working days&rdquo; exclude Sundays and public holidays; remote-zone weather can extend the
                window beyond our control.
              </li>
            </ul>
          </ContentSection>

          <ContentSection id="sp-fees" eyebrow="Fees & COD" title="What shipping costs">
            <ul className="list-disc space-y-3 pl-5">
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
            <p className="text-[13px] leading-relaxed text-muted-foreground">
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
          </ContentSection>
        </div>
      </ContentColumn>
    </ContentPageShell>
  );
}
