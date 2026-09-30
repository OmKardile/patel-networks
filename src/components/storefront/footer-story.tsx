"use client";

// Brand-story SEO block for the footer — reference pattern: label-caps
// eyebrow, genuine 4-sentence story, collapsible with Read more/less.
// Content is drawn from the same copy the store already publishes (contact
// page, trust rows, dispatch promise) — no invented years, stats or claims.

import { useState } from "react";
import { STORE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STORY = `Patel Networks (MegaTechzy) is a Surat-based trade desk for CCTV, surveillance and networking hardware — serving homes, installers, contractors and system integrators across India from our Gujarat counter. Every item we ship is brand-authorized, serial-tracked stock, invoiced with a GST tax invoice so your input tax credit is protected. Orders confirmed before ${STORE.dispatchCutoff} dispatch the same working day from our Surat hub, with pan-India delivery and 7-day DOA cover. Wholesale buyers can request a full bill of materials with GST quotation through the B2B trade desk, and retail buyers get the same counter expertise over phone and WhatsApp.`;

export function FooterStory() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-10 border-t border-border pt-6">
      <p className="label-caps">About Patel Networks</p>
      <p
        className={cn(
          "mt-3 max-w-3xl text-[13px] leading-relaxed text-muted-foreground",
          !expanded && "line-clamp-2"
        )}
      >
        {STORY}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-foreground underline underline-offset-4 transition-colors duration-200 hover:text-primary"
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </div>
  );
}
