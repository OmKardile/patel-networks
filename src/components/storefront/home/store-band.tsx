// Store band — blueprint §1.2 slot 11 (store-locator analog, same visual
// weight): the physical Surat trade desk. Address, phone, hours and WhatsApp
// all come from the STORE constants — the store's real presence, no invented
// outlets. Sand band per the token system.

import Link from "next/link";
import { ArrowRight, Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { STORE } from "@/lib/constants";

export function StoreBand() {
  const whatsappHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hello Patel Networks — I'd like to check stock at the Surat trade desk."
  )}`;

  return (
    <section aria-labelledby="store-band-heading" className="border-y border-border bg-sand text-sand-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div className="max-w-xl">
          {/* sand-safe head — same SectionHead rhythm, inverted-palette colors */}
          <p className="label-caps !text-sand-foreground/70">The counter, in person</p>
          <h2 id="store-band-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Visit the Surat Trade Desk.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-sand-foreground/80 sm:text-[15px]">
            Walk in with a site plan or a channel count — walk out with the bill of materials specified, stock-checked
            and ready to dispatch.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp the desk
            </a>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-sand-foreground/40 px-6 text-sm font-medium transition-colors duration-200 hover:bg-sand-foreground/10"
            >
              Contact the trade desk <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>

        {/* the desk's card — genuine constants only */}
        <div className="rounded-xl border border-sand-foreground/15 bg-card p-6 text-foreground shadow-whisper sm:p-8">
          <MapPin className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="mt-3 font-display text-lg tracking-tight">{STORE.legalName}</h3>
          <address className="mt-2 text-[13px] not-italic leading-relaxed text-muted-foreground">
            Surat Central Hub
            <br />
            {STORE.city}, {STORE.originState} {STORE.originPin}
            <br />
            State code {STORE.originStateCode} · GSTIN {STORE.gstin}
          </address>
          <dl className="mt-5 space-y-3 text-[13px]">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <dt className="sr-only">Phone</dt>
              <dd>
                <a
                  href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
                  className="link-underline font-medium text-foreground"
                >
                  {STORE.supportPhone}
                </a>
              </dd>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <dt className="sr-only">Dispatch window</dt>
              <dd className="text-muted-foreground">
                Orders confirmed before {STORE.dispatchCutoff} dispatch same day
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
