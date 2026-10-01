import { ShieldCheck, Star, Truck, Users } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

// TrustStrip — reference 4-stat density band: real social proof from
// getHomeSocialProof + the store's constant commitments (₹500 free shipping,
// GST invoice, brand warranty, Surat same-day dispatch). Real-stat items
// self-hide when the counters are zero — nothing is fabricated.

type TrustStats = {
  deliveredOrders: number;
  customers: number;
  reviewCount: number;
  avgRating: number;
};

const GRID_CLASS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function TrustStrip({ stats }: { stats: TrustStats }) {
  const items: { icon: typeof Users; title: string; sub: string }[] = [];

  if (stats.customers > 0 || stats.deliveredOrders > 0) {
    items.push({
      icon: Users,
      title: stats.customers > 0 ? `${stats.customers.toLocaleString("en-IN")}+ customers` : "Orders delivered India-wide",
      sub: stats.deliveredOrders > 0 ? `${stats.deliveredOrders.toLocaleString("en-IN")} orders delivered` : STORE.tagline,
    });
  }

  if (stats.reviewCount > 0) {
    items.push({
      icon: Star,
      title: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}★ average rating` : "Verified product reviews",
      sub: `${stats.reviewCount.toLocaleString("en-IN")} verified reviews`,
    });
  }

  items.push(
    {
      icon: Truck,
      title: `Free shipping over ${formatINR(FREE_SHIPPING_THRESHOLD_PAISE)}`,
      sub: `India-wide delivery from ${STORE.city}`,
    },
    {
      icon: ShieldCheck,
      title: "GST invoice · brand warranty",
      sub: `Same-day dispatch before ${STORE.dispatchCutoff}`,
    },
  );

  return (
    <section aria-label="Store commitments" className="border-y bg-card">
      <div className="container-inner">
        <ul className={cn("grid grid-cols-1 gap-x-6 gap-y-4 py-6 md:py-8", GRID_CLASS[items.length] ?? "sm:grid-cols-2 lg:grid-cols-4")}>
          {items.map((item) => (
            <li
              key={item.title}
              className="flex items-start gap-3 lg:border-l lg:border-border lg:px-6 lg:first:border-l-0 lg:first:pl-0"
            >
              <item.icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="label-caps">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
