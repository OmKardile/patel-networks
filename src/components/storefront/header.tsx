"use client";

// Header — reference chrome stack, top to bottom:
//  1. AnnouncementStrip — 3 genuine messages from constants (free shipping
//     threshold, GST invoice, Surat dispatch cutoff), 4s auto-rotate with
//     prev/next arrows, pause on hover AND keyboard focus, aria-live="polite".
//  2. UtilityBar — desktop-only quiet links + WhatsApp (own file).
//  3. Navigation — sticky primary nav row + mega menu + drawers (own file).
// The mobile search sheet renders OUTSIDE <header> as a sibling: the nav
// row's backdrop-blur creates a containing block that would trap
// position:fixed children (Task 50-b gotcha).

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { UtilityBar } from "./utility-bar";
import { Navigation } from "./navigation";
import { SearchOverlay, SearchProvider } from "./search-overlay";
import { WhatsAppWidget } from "./whatsapp-widget";

const ANNOUNCEMENTS = [
  `Free shipping on orders over ${formatINR(FREE_SHIPPING_THRESHOLD_PAISE)}`,
  "GST tax invoice on every order",
  `Same-day dispatch from ${STORE.city} before ${STORE.dispatchCutoff}`,
];

const ROTATE_MS = 4000;

function AnnouncementStrip() {
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!pausedRef.current) {
        setIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
      }
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const go = (direction: 1 | -1) =>
    setIndex((i) => (i + direction + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);

  return (
    <div
      className="bg-sand text-sand-foreground"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocus={() => {
        pausedRef.current = true;
      }}
      onBlur={() => {
        pausedRef.current = false;
      }}
    >
      <div className="container-inner relative flex h-9 items-center justify-center">
        <div aria-live="polite" className="min-w-0 px-12 text-center">
          <p
            key={index}
            className="truncate animate-in fade-in text-xs font-medium duration-300"
          >
            {ANNOUNCEMENTS[index]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous announcement"
          className="absolute left-0 grid h-9 w-9 place-items-center rounded-full text-sand-foreground/70 transition-colors hover:text-sand-foreground"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next announcement"
          className="absolute right-0 grid h-9 w-9 place-items-center rounded-full text-sand-foreground/70 transition-colors hover:text-sand-foreground"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function Header() {
  return (
    <SearchProvider>
      <header>
        <AnnouncementStrip />
        <UtilityBar />
        <Navigation />
      </header>
      {/* Mobile search sheet + desktop scrim — sibling of <header>, never a
          descendant of the backdrop-blur nav row. */}
      <SearchOverlay variant="mobile" />
      <WhatsAppWidget />
    </SearchProvider>
  );
}
