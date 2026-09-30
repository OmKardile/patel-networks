import Link from "next/link";

// Section head — extracted verbatim from the Task-48 homepage inline component
// so every home section speaks the same eyebrow → heading → lede → link rhythm.
// `headingId` is additive: when set, the h2 carries the id that the wrapping
// <section aria-labelledby> points at (no duplicate sr-only headings).

interface SectionHeadProps {
  eyebrow: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId?: string;
}

export function SectionHead({ eyebrow, title, lede, href, linkLabel, headingId }: SectionHeadProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="label-caps">{eyebrow}</p>
        <h2 id={headingId} className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        {lede && <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{lede}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="link-underline hidden shrink-0 text-sm font-medium sm:block">
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
