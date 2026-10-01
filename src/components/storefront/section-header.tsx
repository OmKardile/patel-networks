import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// SectionHeader — reference pattern: label-caps eyebrow + section heading,
// optional supporting line, optional right-aligned "View all" control.

export function SectionHeader({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  headingId,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="label-caps">{eyebrow}</p> : null}
        <h2
          id={headingId}
          className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl"
        >
          {title}
        </h2>
        {lede ? <p className="mt-1.5 text-sm text-muted-foreground">{lede}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="link-underline inline-flex min-h-[44px] items-center gap-1 text-sm font-medium"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
