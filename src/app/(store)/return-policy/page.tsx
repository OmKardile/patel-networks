import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCcw, FileSearch, PackageCheck, ScrollText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STORE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Return & Warranty Policy — 7-Day DOA, RMA Process",
  description:
    "7-day dead-on-arrival replacement with serial-number matched RMA, manufacturer warranty periods (CP Plus/Hikvision/Dahua 2 years, WD Purple 3 years) and the non-returnable categories.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/return-policy" },
};

const WARRANTY_TABLE = [
  { brand: "CP Plus", items: "Cameras, DVRs and accessories", period: "2 years" },
  { brand: "Hikvision", items: "Cameras, NVRs/DVRs", period: "2 years" },
  { brand: "Dahua", items: "Cameras, recorders", period: "2 years" },
  { brand: "WD (Purple)", items: "Surveillance hard drives", period: "3 years" },
  { brand: "Cables, connectors, SMPS", items: "Installed consumables", period: "Manufacturer-stated period on the product page" },
] as const;

const PROCESS_STEPS = [
  {
    icon: FileSearch,
    title: "1 · Raise it within 7 days",
    body: "For a dead or damaged-on-arrival unit, contact the trade desk within 7 days of delivery — order number, item, and a photo or short video of the fault. WhatsApp is the fastest channel.",
  },
  {
    icon: ScrollText,
    title: "2 · Serial matched to your invoice",
    body: "We read the serial number on the unit and match it to the one recorded at dispatch. If they agree, the RMA is opened immediately — this is why serials are captured when every order leaves Surat.",
  },
  {
    icon: RefreshCcw,
    title: "3 · Carrier pickup, then replacement",
    body: "The original packaging travels back by our carrier arrangement. Once the unit is received and checked, a replacement ships from the Surat hub — a swap, not a repair queue.",
  },
  {
    icon: PackageCheck,
    title: "4 · Outside the 7-day window: manufacturer warranty",
    body: "Faults reported after 7 days go through the brand's warranty process at their service centre, with our desk coordinating the paperwork against your invoice.",
  },
] as const;

export default function ReturnPolicyPage() {
  return (
    <div className="pb-0">
      {/* Header */}
      <header className="mx-auto max-w-3xl px-4 pt-14 text-center sm:px-6 lg:pt-20">
        <p className="label-caps">Return &amp; warranty policy</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          Replacements built on serial numbers
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Surveillance hardware is warranted by its manufacturer — our job is to make the claim traceable and fast.
          This page explains the 7-day DOA window, how an RMA is matched, and what cannot come back.
        </p>
        <p className="label-caps mt-6 !text-[10px]">Last reviewed: Feb 2026</p>
      </header>

      {/* Policy sheet — one white card, hairline-divided sections */}
      <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <div className="rounded-xl border border-border bg-card px-6 py-2 shadow-whisper sm:px-10 sm:py-4">
          {/* DOA */}
          <section className="border-b border-border py-8" aria-labelledby="rp-doa">
            <p className="label-caps">Dead on arrival</p>
            <h2 id="rp-doa" className="mt-1.5 font-display text-xl tracking-tight">The 7-day replacement window</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">
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
            </div>
          </section>

          {/* RMA discipline */}
          <section className="border-b border-border py-8" aria-labelledby="rp-rma">
            <p className="label-caps">RMA discipline</p>
            <h2 id="rp-rma" className="mt-1.5 font-display text-xl tracking-tight">Serial number, invoice, one unit</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">
              <p>
                Every warranty-bearing item is serial-scanned at dispatch and the serials are stored against your order
                lines. An RMA is accepted when the serial on the returned unit matches the serial on your tax invoice —
                this protects honest buyers: it is what stops a claim from being tangled with someone else&apos;s unit
                or a grey-market import.
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>Keep the GST invoice — it is the purchase proof for the brand&apos;s service centre too.</li>
                <li>Do not remove serial stickers or open sealed housings; that voids the manufacturer warranty.</li>
                <li>Physical damage, power surges and lightning strikes are not manufacturing defects.</li>
              </ul>
            </div>
          </section>

          {/* Coverage */}
          <section className="border-b border-border py-8" aria-labelledby="rp-coverage">
            <p className="label-caps">Coverage</p>
            <h2 id="rp-coverage" className="mt-1.5 font-display text-xl tracking-tight">Manufacturer warranty periods</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">
              Warranty is provided by the manufacturer and honoured through their India service network. The periods we
              publish and print on invoices:
            </p>
            <div className="mt-6 overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[26%]">Brand / line</TableHead>
                    <TableHead>Covers</TableHead>
                    <TableHead className="w-[28%]">Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WARRANTY_TABLE.map((row) => (
                    <TableRow key={row.brand}>
                      <TableCell className="font-medium">{row.brand}</TableCell>
                      <TableCell className="text-muted-foreground">{row.items}</TableCell>
                      <TableCell>{row.period}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              The binding period for any SKU is the one printed on its product page and your invoice. Consumables such
              as connectors and cut cable carry no return rights; manufacturing defects in them are assessed case by
              case.
            </p>
          </section>

          {/* Not eligible */}
          <section className="border-b border-border py-8" aria-labelledby="rp-not-eligible">
            <p className="label-caps">Not eligible</p>
            <h2 id="rp-not-eligible" className="mt-1.5 font-display text-xl tracking-tight">What cannot be returned</h2>
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-foreground/90">
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
          </section>

          {/* Process */}
          <section className="py-8" aria-labelledby="rp-process">
            <p className="label-caps">The process</p>
            <h2 id="rp-process" className="mt-1.5 font-display text-xl tracking-tight">Four steps, in order</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {PROCESS_STEPS.map((step) => (
                <div key={step.title} className="rounded-xl border border-border bg-muted/50 p-5">
                  <step.icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3.5 font-display text-base leading-snug tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
              Refunds, where an order is cancelled before dispatch or a DOA cannot be replaced, are returned to the
              original payment method (Razorpay) or by bank transfer for COD/NEFT orders. Questions:{" "}
              {STORE.supportPhone} or the{" "}
              <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
                trade desk
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      {/* CTA band — full-bleed deep green */}
      <section className="mt-16 bg-brand text-brand-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">
              RMA desk
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              A unit on site is misbehaving?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-foreground/75">
              Send the order number, the serial on the unit and what you are seeing — the desk takes it from there.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full bg-brand-foreground px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-foreground/90"
              >
                Raise an RMA
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center rounded-full border border-brand-foreground/35 px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-foreground/10"
              >
                Read the FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
