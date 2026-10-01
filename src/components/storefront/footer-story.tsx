"use client";

// FooterStory — genuine 4-sentence brand story (reference footer SEO block):
// collapsed by default with a Read more/less disclosure (aria-expanded).

import { useState } from "react";
import { cn } from "@/lib/utils";
import { STORE } from "@/lib/constants";

const STORY = [
  "Patel Networks (MegaTechzy) is a Surat-based counter for CCTV, surveillance and networking hardware.",
  "We supply cameras, recorders, switches, cables and accessories to installers, dealers and businesses across India, with a GST tax invoice on every order.",
  "Stock comes through authorised distribution channels, and the trade desk helps you match products to the site you are wiring.",
  `Paid orders placed before ${STORE.dispatchCutoff} dispatch the same day from our Surat hub.`,
].join(" ");

export function FooterStory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-label="About Patel Networks" className="border-t py-6">
      <h3 className="label-caps">About Patel Networks</h3>
      <p
        className={cn(
          "mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground",
          !expanded && "line-clamp-2",
        )}
      >
        {STORY}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="mt-0.5 inline-flex min-h-11 items-center text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </section>
  );
}
