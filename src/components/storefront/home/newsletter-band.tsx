// Newsletter band — blueprint §1.2 slot 14, the prominent closing band. GENUINE
// CTAs only: the store's real WhatsApp deep link for deal alerts plus a catalog
// link. No email capture, no fake subscribe endpoint.

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";

export function NewsletterBand() {
  const alertsHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — add me to the deal alerts list for new arrivals and stock offers."
  )}`;

  return (
    <section aria-labelledby="newsletter-heading" className="border-t border-border bg-brand text-brand-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <p className="label-caps !text-brand-foreground/70">Deal alerts, zero spam.</p>
        <h2 id="newsletter-heading" className="mx-auto mt-2 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          New arrivals and stock deals, straight to your WhatsApp.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-foreground/80">
          No forms, no inbox clutter — message the desk once and it keeps your number on the list for new-arrival
          and deal announcements.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={alertsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Get WhatsApp alerts
          </a>
          <Link
            href="/products?sort=newest"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-brand-foreground/40 px-7 text-sm font-medium transition-colors duration-200 hover:bg-brand-foreground/10"
          >
            Browse new arrivals <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
