"use client";

// Header — reference chrome stack, top to bottom:
//  1. AnnouncementBar — teal "Trade Desk Deals End In:" countdown to the next
//     4:00 PM IST dispatch cutoff (own file, hydration-safe).
//  2. UtilityBar — dark quiet strip: store/WhatsApp links, dispatch strap,
//     support links (own file).
//  3. Navigation — sticky primary nav row + mega menu + drawers (own file).
// The announcement + utility rows are OUTSIDE the sticky wrapper: they scroll
// away and only Navigation sticks. The mobile search sheet renders OUTSIDE
// <header> as a sibling: the nav row's backdrop-blur creates a containing
// block that would trap position:fixed children (Task 50-b gotcha).

import { AnnouncementBar } from "./announcement-bar";
import { UtilityBar } from "./utility-bar";
import { Navigation } from "./navigation";
import { SearchOverlay, SearchProvider } from "./search-overlay";
import { WhatsAppWidget } from "./whatsapp-widget";

export function Header() {
  return (
    <SearchProvider>
      <header>
        <AnnouncementBar />
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
