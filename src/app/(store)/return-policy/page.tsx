import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/constants";
import { ContentPageShell, ContentColumn, ContentSection } from "@/components/storefront/content-page-shell";

export const metadata: Metadata = {
  title: "Return & Warranty Policy — 7-Day DOA, RMA Process",
  description:
    "7-day dead-on-arrival replacement with serial-number matched RMA, manufacturer warranty periods (CP Plus/Hikvision/Dahua 2 years, WD Purple 3 years) and the non-returnable categories.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/return-policy" },
};

const WARRANTY_ROWS = [
  { brand: "CP Plus", items: "Cameras, DVRs and accessories", period: "2 years" },
  { brand: "Hikvision", items: "Cameras, NVRs/DVRs", period: "2 years" },
  { brand: "Dahua", items: "Cameras, recorders", period: "2 years" },
  { brand: "WD (Purple)", items: "Surveillance hard drives", period: "3 years" },
  { brand: "Cables, connectors, SMPS", items: "Installed consumables", period: "Manufacturer-stated period on the product page" },
] as const;

const PROCESS_STEPS = [
  {
    title: "1 · Raise it within 7 days",
    body: "For a dead or damaged-on-arrival unit, contact the trade desk within 7 days of delivery — order number, item, and a photo or short video of the fault. WhatsApp is the fastest channel.",
  },
  {
    title: "2 · Serial matched to your invoice",
    body: "We read the serial number on the unit and match it to the one recorded at dispatch. If they agree, the RMA is opened immediately — this is why serials are captured when every order leaves Surat.",
  },
  {
    title: "3 · Carrier pickup, then replacement",
    body: "The original packaging travels back by our carrier arrangement. Once the unit is received and checked, a replacement ships from the Surat hub — a swap, not a repair queue.",
  },
  {
    title: "4 · Outside the 7-day window: manufacturer warranty",
    body: "Faults reported after 7 days go through the brand's warranty process at their service centre, with our desk coordinating the paperwork against your invoice.",
  },
] as const;

export default function ReturnPolicyPage() {
  return (
    <ContentPageShell
      eyebrow="Return & warranty policy"
      title="Replacements built on serial numbers"
      lede="Surveillance hardware is warranted by its manufacturer — our job is to make the claim traceable and fast. This page explains the 7-day DOA window, how an RMA is matched, and what cannot come back."
      aside="Last reviewed: Feb 2026"
    >
      <ContentColumn>
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-6 py-2 shadow-whisper sm:px-10 sm:py-4">
          <ContentSection id="rp-doa" eyebrow="Dead on arrival" title="The 7-day replacement window">
            <p>
              If a product arrives dead, damaged in transit, or fails immediately on first power-up, report it within{" "}
              <strong className="font-semibold">7 days of delivery</strong>. After the serial and fault are verified,
              the unit is replaced from stock — you are not asked to wait out a repair cycle for a unit that never
              worked.
            </p>
            <p>
              The 7-day clock starts on the delivery date recorded by the carrier. Keep the original packaging until
              the system has run for a few days; DOA pickups travel in it.
            </p>
          </ContentSection>

          <ContentSection id="rp-rma" eyebrow="RMA discipline" title="Serial number, invoice, one unit">
            <p>
              Every warranty-bearing item is serial-scanned at dispatch and the serials are stored against your order
              lines. An RMA is accepted when the serial on the returned unit matches the serial on your tax invoice —
              this protects honest buyers: it is what stops a claim from being tangled with someone else&apos;s unit or
              a grey-market import.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Keep the GST invoice — it is the purchase proof for the brand&apos;s service centre too.</li>
              <li>Do not remove serial stickers or open sealed housings; that voids the manufacturer warranty.</li>
              <li>Physical damage, power surges and lightning strikes are not manufacturing defects.</li>
            </ul>
          </ContentSection>

          <ContentSection id="rp-coverage" eyebrow="Coverage" title="Manufacturer warranty periods">
            <p>
              Warranty is provided by the manufacturer and honoured through their India service network. The periods we
              publish and print on invoices:
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="w-[26%] border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Brand / line
                    </th>
                    <th className="border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Covers
                    </th>
                    <th className="w-[28%] border-b border-border px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {WARRANTY_ROWS.map((row) => (
                    <tr key={row.brand}>
                      <td className="border-b border-border px-4 py-2.5 text-[14px] font-medium">{row.brand}</td>
                      <td className="border-b border-border px-4 py-2.5 text-[14px] text-muted-foreground">{row.items}</td>
                      <td className="border-b border-border px-4 py-2.5 text-[14px]">{row.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              The binding period for any SKU is the one printed on its product page and your invoice. Consumables such
              as connectors and cut cable carry no return rights; manufacturing defects in them are assessed case by
              case.
            </p>
          </ContentSection>

          <ContentSection id="rp-not-eligible" eyebrow="Not eligible" title="What cannot be returned">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="font-semibold">Installed or commissioned items</strong> — once a camera, recorder or
                drive has been mounted, wired and powered on site, it leaves the return path and continues under the
                manufacturer warranty instead.
              </li>
              <li>
                <strong className="font-semibold">Cable cut to length</strong> — coax and ethernet cable cut from the
                roll to your measurement is non-resalable.
              </li>
              <li>
                <strong className="font-semibold">Units without matching serials</strong>, or with missing, damaged or
                tampered serial labels.
              </li>
              <li>
                <strong className="font-semibold">Damage from installation error</strong> — reversed polarity SMPS
                wiring, PoE into non-PoE ports, water ingress into non-weather-rated housings.
              </li>
            </ul>
          </ContentSection>

          <ContentSection id="rp-process" eyebrow="The process" title="Four steps, in order">
            <div className="grid gap-4 sm:grid-cols-2">
              {PROCESS_STEPS.map((step) => (
                <div key={step.title} className="rounded-lg border border-border bg-muted/50 p-5">
                  <h3 className="font-display text-base font-semibold leading-snug tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Raise a claim from the order page in your{" "}
              <Link href="/account/orders" className="underline underline-offset-2 hover:text-foreground">
                account
              </Link>
              , on WhatsApp, or via the{" "}
              <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
                trade desk
              </Link>
              . Refunds for prepaid amounts go back to the original payment method; COD replacements dispatch as fresh
              consignments.
            </p>
          </ContentSection>
        </div>
      </ContentColumn>
    </ContentPageShell>
  );
}
