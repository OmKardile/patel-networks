// Corporate band — blueprint §1.2 slot 12. The store's real B2B path: GST
// quotations, PO-backed supply and bank-transfer settlement (copy mirrors the
// contact page's institutional posture). The contact page has no dedicated
// B2B anchor id, so the CTA routes to /contact where the inquiry form lives.

import Link from "next/link";
import { ArrowRight, Landmark, ReceiptText } from "lucide-react";

export function CorporateBand() {
  return (
    <section aria-labelledby="corporate-heading" className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <p className="label-caps">Corporate &amp; bulk orders</p>
          <h2 id="corporate-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Fitting out sites, institutions or AMC fleets?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            Purchase-order backed supply, GST quotations with HSN line items and bank-transfer settlement for orders
            above online limits — the trade desk responds within one working day.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5 text-success" aria-hidden />
              NEFT / RTGS against invoice
            </li>
            <li className="flex items-center gap-1.5">
              <ReceiptText className="h-3.5 w-3.5 text-success" aria-hidden />
              Input-credit ready GST billing
            </li>
          </ul>
        </div>
        <Link
          href="/contact"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
        >
          Enquire now <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
