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

  // Keep the band balanced: a lone item in the final row centers itself
  // (5 items → 4 + 1 centered on desktop; 3 items → centered on mobile).
  const orphanClass =
    items.length === 5
      ? "col-span-2 lg:col-span-2 lg:col-start-2"
      : items.length === 3
        ? "col-span-2 lg:col-span-1"
        : "";

  return (
    <div className="px-3 md:px-4">
      <section aria-label="Store commitments" className="rounded-2xl bg-[var(--band-ink)] text-white">
        <div className="container-inner">
          <ul className="grid grid-cols-2 gap-y-6 py-8 md:py-10 lg:grid-cols-4">
            {items.map((item, index) => (
              <li
                key={item.title}
                className={cn("px-3 text-center md:px-4", index === items.length - 1 && orphanClass)}
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
