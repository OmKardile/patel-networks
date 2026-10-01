import Link from "next/link";
import { Clock, MapPin, MessageCircle, Phone, ReceiptText } from "lucide-react";
import { STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// StoreSection — reference store-locator band, inverted (bg-brand): the real
// Surat trade desk — legal name, address (origin pin), GSTIN, support phone,
// counter hours + dispatch cutoff — with WhatsApp pill and directions CTA.

export function StoreSection() {
  const headingId = "surat-trade-desk-heading";
  const waHref = `https://wa.me/${STORE.whatsapp}`;

  return (
    <section aria-labelledby={headingId} className="bg-brand text-brand-foreground">
      <div className="container-inner grid gap-10 py-12 md:py-16 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/70">
            Visit the counter
          </p>
          <h2 id={headingId} className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
            Surat Trade Desk
          </h2>
          <address className="mt-4 space-y-2.5 text-sm not-italic">
            <p className="font-medium">{STORE.legalName}</p>
            <p className="flex items-start gap-2 text-brand-foreground/85">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              {STORE.city}, {STORE.originState} {STORE.originPin}
            </p>
            <p className="flex items-start gap-2 text-brand-foreground/85">
              <ReceiptText aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              GSTIN {STORE.gstin}
            </p>
            <p className="flex items-start gap-2 text-brand-foreground/85">
              <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`tel:${STORE.supportPhone.replace(/\s+/g, "")}`} className="link-underline">
                {STORE.supportPhone}
              </a>
            </p>
            <p className="flex items-start gap-2 text-brand-foreground/85">
              <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              Counter on working days · paid orders before {STORE.dispatchCutoff} dispatch same-day
            </p>
          </address>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            WhatsApp the trade desk
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-foreground/30 px-6 text-sm font-medium transition-colors duration-200 hover:bg-brand-foreground/10"
          >
            <MapPin aria-hidden className="h-4 w-4" />
            Get directions
          </Link>
        </div>
      </div>
    </section>
  );
}
