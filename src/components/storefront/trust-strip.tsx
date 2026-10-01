import { LockKeyhole, ShieldCheck, Star, Truck, Users } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD_PAISE, STORE } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

// TrustStrip — reference dark rounded commitments band: real social proof from
// getHomeSocialProof + the store's constant commitments (₹500 free shipping,
// GST invoice + brand warranty + same-day dispatch, secure Razorpay payments).
// Real-stat items self-hide when the counters are zero — nothing is fabricated.

type TrustStats = {
  deliveredOrders: number;
  customers: number;
  reviewCount: number;
  avgRating: number;
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
    {
      icon: LockKeyhole,
      title: "Secure Razorpay payments",
      sub: "Razorpay checkout · COD available",
    },
  );

  // Keep the band balanced at every count: on mobile (2 cols) an odd tail item
  // spans the full row and centers itself; from lg up the grid matches the item
  // count exactly so everything sits in ONE row (5 items → 5 cols, etc.).
  const orphanClass =
    items.length % 2 === 1 && items.length > 2 ? "col-span-2 lg:col-span-1" : "";

  const colsClass =
    items.length >= 5
      ? "lg:grid-cols-5"
      : items.length === 3
        ? "lg:grid-cols-3"
        : items.length === 2
          ? "lg:grid-cols-2"
          : "lg:grid-cols-4";

  return (
    <div className="px-3 md:px-4">
      <section aria-label="Store commitments" className="rounded-2xl bg-[var(--band-ink)] text-white">
        <div className="container-inner">
          <ul className={cn("grid grid-cols-2 gap-y-6 py-8 md:py-10", colsClass)}>
            {items.map((item, index) => (
              <li
                key={item.title}
                className={cn(
                  "px-3 text-center md:px-4",
                  items.length >= 5 && "md:px-2 lg:px-3",
                  index === items.length - 1 && orphanClass,
                )}
              >
                <item.icon aria-hidden className="mx-auto h-6 w-6 text-white/90" />
                <p className="mt-2 text-xs font-semibold text-white/85 md:text-sm">{item.title}</p>
                <p className="mt-1 text-xs text-white/55">{item.sub}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
