import type { Metadata } from "next";
import Link from "next/link";
import { Building2, FileText, Percent, Truck } from "lucide-react";
import { STORE } from "@/lib/constants";
import { ContentPageShell } from "@/components/storefront/content-page-shell";
import { B2BInquiryForm } from "@/components/content/b2b-inquiry-form";

// /corporate — brief deliverable "Corporate/Bulk Inquiry". A dedicated landing
// for the trade desk's bulk business: the same genuine claims used on the
// homepage band and /contact (bulk quoting, GST invoicing, Surat dispatch,
// brand warranty), with the real B2B enquiry form embedded (→ /api/contact →
// the admin Trade Desk pipeline). No invented SLAs, clients or pricing.

export const metadata: Metadata = {
  title: `Bulk & Corporate Orders | ${STORE.name}`,
  description: `Site projects, installer quantities and institutional orders: get a bill of materials with GST pricing from the ${STORE.city} trade desk — one working day to a quotation.`,
  alternates: { canonical: "/corporate" },
};

const PILLARS = [
  {
    icon: FileText,
    title: "Bill of materials, quoted",
    body: "Send what the site needs — camera count, recorder channels, cable runs — and receive an itemised BOM with stock position and delivery estimate included.",
  },
  {
    icon: Percent,
    title: "GST invoicing, input credit",
    body: `Every quotation is priced with GST and invoiced against ${STORE.legalName}'s registered GSTIN — claim input tax credit on hardware you install for clients.`,
  },
  {
    icon: Truck,
    title: `${STORE.city} dispatch, brand warranty`,
    body: `Bulk consignments leave the ${STORE.city} counter with brand warranty on every serial — the same pipeline that packs retail orders.`,
  },
] as const;

export default function CorporatePage() {
  return (
    <ContentPageShell
      eyebrow="Corporate & bulk"
      title="Outfit the whole site in one order"
      lede={`Installers, contractors and institutions order through the ${STORE.name} trade desk: bulk quantities, honest stock positions and GST paperwork that survives your auditor.`}
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Pillars + reassurance */}
        <div className="lg:col-span-5">
          <ul className="space-y-6">
            {PILLARS.map((pillar) => (
              <li key={pillar.title} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <pillar.icon aria-hidden className="h-4.5 w-4.5 text-success" />
                </span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">{pillar.title}</h2>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{pillar.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-lg border bg-muted/40 p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <Building2 aria-hidden className="h-4 w-4 text-success" />
              How it works
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1.</span> Send the requirement — a
                rough quantity list is enough to start.
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> The trade desk reviews it
                and prepares the quotation.
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span> You receive pricing with
                stock and delivery estimates — one working day.
              </li>
            </ol>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Need it faster? Call the desk directly or use the{" "}
              <Link href="/contact" className="link-underline font-medium text-foreground">
                general contact page
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="lg:col-span-7">
          <div className="rounded-lg border bg-card p-4 shadow-whisper sm:p-6">
            <p className="label-caps">Bulk enquiry</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Send the requirement</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              One working day to a quotation, with stock position and delivery estimate included.
            </p>
            <div className="mt-6">
              <B2BInquiryForm />
            </div>
          </div>
        </div>
      </div>
    </ContentPageShell>
  );
}
