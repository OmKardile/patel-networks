import Link from "next/link";
import { ArrowRight, Gift, Package } from "lucide-react";
import { STORE } from "@/lib/constants";

// CorporateSection — reference corporate/bulk band, 2-up: left = cream panel
// with the genuine trade-desk offer (bulk pricing, GST invoices, single Surat
// dispatch point) and one CTA to the dedicated /corporate landing (Task 52),
// which embeds the real B2B enquiry form. Right = clearly decorative dark
// Package-icon composition — no fabricated photography.

export function CorporateSection() {
  const headingId = "corporate-bulk-orders-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
          <div className="grid place-items-center rounded-2xl bg-[var(--band-cream)] px-8 py-12 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white">
                <Gift aria-hidden className="h-5 w-5 text-[#8a6142]" />
              </span>
              <h2
                id={headingId}
                className="mt-4 text-xl font-semibold tracking-tight md:text-2xl"
              >
                Corporate &amp; bulk orders
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-black/60">
                Bulk pricing on project quantities, GST invoices for input credit, and a single
                dispatch point — every order leaves our {STORE.city} hub.
              </p>
              <Link
                href="/corporate"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--band-ink-on)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Enquire now
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Decorative composition — repeating package pattern, no fake asset */}
          <div
            aria-hidden
            className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[var(--band-ink)]"
          >
            <div className="absolute inset-0 grid grid-cols-4 place-items-center gap-6 p-8">
              {Array.from({ length: 12 }).map((_, index) => (
                <Package key={index} className="h-8 w-8 text-white/15" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
