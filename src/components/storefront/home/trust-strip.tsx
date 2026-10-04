// Trust strip — blueprint §1.2 slot 2. Compact 5-pill white band directly under
// the hero: shipping promise from the frozen threshold constant, GST/warranty/
// dispatch facts from the store's own posture, and ONE pill of real catalog
// numbers from getHomeSocialProof(). Nothing invented — the stats pill simply
// disappears if the counters are at zero.

import { BadgeCheck, PackageCheck, Receipt, Star, Truck } from "lucide-react";
import { formatINR } from "@/lib/money";
import { FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

interface TrustStripProps {
  deliveredOrders: number;
  customers: number;
  reviewCount: number;
  avgRating: number;
}

interface Pill {
  icon: LucideIcon;
  headline: string;
  caption: string;
}

export function TrustStrip({ deliveredOrders, customers, reviewCount, avgRating }: TrustStripProps) {
  const pills: Pill[] = [
    {
      icon: Truck,
      headline: `${formatINR(FREE_SHIPPING_THRESHOLD_PAISE)}+ ships free`,
      caption: "Pan-India, on every order",
    },
    { icon: Receipt, headline: "GST invoice", caption: "Input-credit ready, every order" },
    { icon: BadgeCheck, headline: "Brand warranty", caption: "Authorized, serial-tracked stock" },
    {
      icon: PackageCheck,
      headline: `Dispatched from ${STORE.city}`,
      caption: `Same day before ${STORE.dispatchCutoff}`,
    },
  ];

  if (deliveredOrders > 0) {
    pills.push({
      icon: Star,
      headline: `${deliveredOrders} orders delivered`,
      caption: `${customers} customers${reviewCount > 0 ? ` · ${avgRating.toFixed(1)}/5 rated` : ""}`,
    });
  } else if (reviewCount > 0) {
    pills.push({ icon: Star, headline: `${reviewCount} verified reviews`, caption: `${avgRating.toFixed(1)}/5 average` });
  }

  return (
    <section aria-label="What every order includes" className="border-b border-border bg-card">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-4 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-5">
        {pills.map(({ icon: Icon, headline, caption }) => (
          <li key={headline} className="flex items-center gap-3 py-1">
            <Icon className="h-5 w-5 shrink-0 text-success" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold leading-tight">{headline}</p>
              <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">{caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
