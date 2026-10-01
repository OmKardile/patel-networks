// MarqueeBand — reference outline-text marquee: a single decorative track of
// real store highlights scrolling seamlessly (two identical spans so the
// shared .animate-marquee 0→-50% translate loops without a jump). The
// accessible string is the sr-only paragraph; the visible track is aria-hidden.
// Reduced-motion users get a static line (handled inside globals.css).
//
// NOTE: exported for the homepage owner to wire into (store)/page.tsx, e.g.
//   <MarqueeBand items={["Same-day dispatch", "GST invoice", ...]} />

export function MarqueeBand({ items }: { items: string[] }) {
  if (!items.length) return null;

  const line = `${items.join(" · ")} · `;

  return (
    <section aria-label="Store highlights" className="overflow-hidden bg-transparent py-8 md:py-10">
      <p className="sr-only">{items.join(" · ")}</p>
      <div aria-hidden className="animate-marquee flex w-max whitespace-nowrap">
        <span className="pr-4 text-4xl font-black uppercase tracking-tight text-outline md:text-6xl">
          {line}
        </span>
        <span className="pr-4 text-4xl font-black uppercase tracking-tight text-outline md:text-6xl">
          {line}
        </span>
      </div>
    </section>
  );
}
