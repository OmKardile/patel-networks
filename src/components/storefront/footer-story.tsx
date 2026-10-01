// FooterStory — genuine brand story (reference footer SEO block, Row 4):
// bold lead line, rest in muted ink, and a real "Read more" link to /about
// (route verified under src/app). Server component — no disclosure state.

import Link from "next/link";
import { STORE } from "@/lib/constants";

const STORY_LEAD = `Patel Networks (MegaTechzy) is a ${STORE.city}-based counter for CCTV, surveillance and networking hardware.`;

const STORY_REST = `We supply cameras, recorders, switches, cables and accessories to installers, dealers and businesses across India, with a GST tax invoice on every order. Stock comes through authorised distribution channels, and the trade desk helps you match products to the site you are wiring. Paid orders placed before ${STORE.dispatchCutoff} dispatch the same day from our ${STORE.city} hub.`;

export function FooterStory() {
  return (
    <section
      aria-label="About Patel Networks"
      className="mt-8 border-t border-black/10 pt-6"
    >
      <p className="text-sm leading-relaxed text-black/60">
        <span className="font-semibold text-[#1c1b1b]">{STORY_LEAD}</span>{" "}
        {STORY_REST}
      </p>
      <Link
        href="/about"
        className="mt-1 inline-flex min-h-11 items-center text-sm font-medium text-[#1c1b1b] underline-offset-4 transition-colors hover:underline"
      >
        Read more
      </Link>
    </section>
  );
}
