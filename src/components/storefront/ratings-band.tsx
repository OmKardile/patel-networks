// RatingsBand — reference "The ratings say it all" closing band. Every number
// is REAL store data (verified review aggregate, delivered order count);
// medallions render only for real figures and the band self-hides entirely
// when there is nothing true to show.

function Medallion({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-amber-500/50 bg-white/80 text-center">
      <span>
        <strong className="block text-lg font-bold leading-none text-[#1c1b1b]">
          {value}
        </strong>
        <span className="mt-1 block text-[9px] uppercase tracking-wide text-black/50">
          {label}
        </span>
      </span>
    </div>
  );
}

export function RatingsBand({
  avgRating,
  reviewCount,
  deliveredOrders,
}: {
  avgRating: number;
  reviewCount: number;
  deliveredOrders: number;
}) {
  const hasRating = reviewCount >= 5 && avgRating > 0;
  if (!(reviewCount >= 5 || deliveredOrders > 0)) return null;

  const parts: string[] = [];
  if (hasRating) parts.push(`Rated ${avgRating.toFixed(1)} by verified buyers`);
  if (deliveredOrders > 0)
    parts.push(`${deliveredOrders.toLocaleString("en-IN")} orders delivered across India`);
  if (parts.length === 0) return null;

  return (
    <section aria-label="Store ratings" className="px-3 md:px-4">
      <div className="rounded-2xl bg-[var(--band-cream)] px-6 py-8 md:px-10 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label-caps">The ratings say it all</p>
            <h2 className="mt-1 max-w-md text-xl font-semibold leading-snug tracking-tight text-[#1c1b1b] md:text-2xl">
              {parts.join(" · ")}
            </h2>
          </div>
          <div className="flex shrink-0 gap-4">
            {hasRating ? (
              <Medallion value={avgRating.toFixed(1)} label="Verified rating" />
            ) : null}
            {deliveredOrders > 0 ? (
              <Medallion
                value={deliveredOrders.toLocaleString("en-IN")}
                label="Orders"
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
