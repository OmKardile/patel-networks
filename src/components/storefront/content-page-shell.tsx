import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";

// Neeman's-era chrome for content surfaces (about, contact, faq, brands, blog,
// policies). Shared contract: hero opener on the warm greige canvas (eyebrow →
// display heading → one-line lede, no heavy banner), white rounded-xl cards on
// hairlines, deep-green / sand closing bands, motion via the IO-based Reveal.
// All colour comes from tokens — dark mode is handled by the palette itself.

const CONTAINER = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

/** Eyebrow in small caps with a hairline rule — used above section titles. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`label-caps flex items-center gap-3 ${className}`}>
      <span aria-hidden className="h-px w-8 bg-border" />
      {children}
    </p>
  );
}

/**
 * PageShell — hero opener on the bare canvas: eyebrow, display headline, lede
 * and an optional right-aligned meta line ("Last reviewed …"), separated from
 * the body by a hairline. Wraps everything in a semantic <article>.
 */
export function PageShell({
  eyebrow,
  title,
  lede,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional right-aligned meta (e.g. "Last reviewed …") in the hero opener. */
  aside?: string;
  children: ReactNode;
}) {
  return (
    <article className="flex-1">
      <header className="border-b border-border">
        <div className={`${CONTAINER} py-12 lg:py-16`}>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="max-w-3xl">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h1>
              {lede ? (
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
              ) : null}
            </div>
            {aside ? <p className="pb-1 text-xs text-muted-foreground/90">{aside}</p> : null}
          </div>
        </div>
      </header>
      {children}
    </article>
  );
}

/**
 * ContentSection — editorial two-column layout: eyebrow + display title on the
 * left, prose/children on the right, separated by a hairline top rule.
 */
export function ContentSection({
  id,
  eyebrow,
  title,
  children,
  className = "",
  first = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
  first?: boolean;
}) {
  return (
    <Reveal>
      <section
        id={id}
        aria-labelledby={id ? `${id}-heading` : undefined}
        className={`${first ? "" : "border-t border-border"} py-10 lg:py-14 ${className}`}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4 min-w-0">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h2
              id={id ? `${id}-heading` : undefined}
              className="mt-3 font-display text-2xl font-semibold leading-snug tracking-tight lg:text-[1.7rem]"
            >
              {title}
            </h2>
          </div>
          <div className="lg:col-span-8 min-w-0">{children}</div>
        </div>
      </section>
    </Reveal>
  );
}

/**
 * CtaBand — closing call-to-action as a full-bleed band (deep green trust band
 * by default, warm sand promo band via variant) with an inner max-w-7xl frame,
 * display headline and a single pill action plus optional quiet secondary link.
 */
export function CtaBand({
  title,
  body,
  href,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  variant = "brand",
}: {
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  /** "brand" = deep-green trust band · "sand" = warm promo band. */
  variant?: "brand" | "sand";
}) {
  const isBrand = variant === "brand";
  return (
    <Reveal>
      <div className={`${isBrand ? "bg-brand text-brand-foreground" : "bg-sand text-sand-foreground"}`}>
        <div className={`${CONTAINER} py-12 sm:py-16`}>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold leading-snug tracking-tight lg:text-[1.7rem]">
                {title}
              </h2>
              <p className={`mt-3 text-[14px] leading-relaxed ${isBrand ? "text-brand-foreground/80" : "text-sand-foreground/85"}`}>
                {body}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-4">
              <Link
                href={href}
                className={`press group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isBrand
                    ? "bg-brand-foreground text-brand hover:bg-background"
                    : "bg-sand-foreground text-sand hover:opacity-90"
                }`}
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
              {secondaryHref && secondaryLabel ? (
                <Link
                  href={secondaryHref}
                  className={`link-underline text-sm font-medium ${isBrand ? "text-brand-foreground/90 hover:text-brand-foreground" : "text-sand-foreground/90 hover:text-sand-foreground"}`}
                >
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/** Standard content container — every page body section sits inside one. */
export function ContentContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${CONTAINER} py-10 lg:py-14 ${className}`}>{children}</div>;
}

/**
 * PolicySheet — the unified "policy sheet": one narrow white card (max-w-3xl)
 * with hairline-divided sections. Children are <PolicySection> items.
 */
export function PolicySheet({ children }: { children: ReactNode }) {
  return (
    <div className={`${CONTAINER} py-10 lg:py-14`}>
      <Reveal>
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card shadow-whisper">
          {children}
        </div>
      </Reveal>
    </div>
  );
}

/** A hairline-divided section inside a PolicySheet: eyebrow → display heading → prose. */
export function PolicySection({
  eyebrow,
  title,
  first = false,
  children,
}: {
  eyebrow?: string;
  title: string;
  first?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`${first ? "" : "border-t border-border"} px-6 py-8 sm:px-10 sm:py-10`}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 font-display text-xl font-semibold leading-snug tracking-tight sm:text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
