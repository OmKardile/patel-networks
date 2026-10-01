import Link from "next/link";
import { ArrowRight, MapPin, Store } from "lucide-react";
import { STORE } from "@/lib/constants";

// StoreSection — reference 2-up store band: left = neutral dark composition
// (no fabricated imagery) carrying the real origin data; right = gray panel
// with the genuine registered address line and a CTA to the real
// /store-locator page.

const REGISTERED_ADDRESS =
  "Surat Central Logistics Node, Ring Road, Surat, Gujarat 395003";

export function StoreSection() {
  const headingId = "your-nearest-counter-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <div className="grid gap-3 md:gap-4 lg:grid-cols-2">
          {/* Visual panel — decorative pin pattern + real origin data */}
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[var(--band-ink)]">
            <div
              aria-hidden
              className="absolute inset-0 grid grid-cols-4 place-items-center gap-6 p-8"
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <MapPin key={index} className="h-8 w-8 text-white/10" />
              ))}
            </div>
            <div className="relative grid min-h-[280px] place-items-center px-6 py-12 text-center">
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-white/10">
                  <MapPin aria-hidden className="h-5 w-5 text-white" />
                </span>
                <p className="mt-4 text-lg font-semibold text-white">
                  {STORE.city}, {STORE.originState} {STORE.originPin}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  Trade counter &amp; dispatch hub
                </p>
              </div>
            </div>
          </div>

          {/* Gray panel — real address + locator CTA */}
          <div className="grid place-items-center rounded-2xl bg-[var(--band-gray)] px-8 py-12 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white">
                <Store aria-hidden className="h-5 w-5 text-[#1c1b1b]" />
              </span>
              <h2
                id={headingId}
                className="mt-4 text-xl font-semibold tracking-tight md:text-2xl"
              >
                Your nearest counter
              </h2>
              <p className="mt-1 text-sm text-black/60">{REGISTERED_ADDRESS}</p>
              <p className="mt-1 text-xs text-black/50">
                Counter on working days · paid orders before {STORE.dispatchCutoff} dispatch
                same-day
              </p>
              <Link
                href="/store-locator"
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[var(--band-ink-on)] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Find nearest store
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
