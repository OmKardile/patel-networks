import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ContentPageShell — shared chrome for the calm editorial content surfaces
// (policies, FAQ, about). Contract: container-inner frame, label-caps eyebrow,
// display heading, optional one-line lede, then the body in a narrow prose
// column. No banners, no heavy motion — hairlines and tokens only.

export function ContentPageShell({
  eyebrow,
  title,
  lede,
  aside,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Optional right-aligned meta line (e.g. "Last reviewed …"). */
  aside?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("flex-1", className)}>
      <header className="border-b border-border">
        <div className="container-inner py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="max-w-3xl">
              <p className="label-caps">{eyebrow}</p>
              <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
                {title}
              </h1>
              {lede ? (
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{lede}</p>
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

/** Narrow prose column inside the shell — where a page's body sections sit. */
export function ContentColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="container-inner py-12 md:py-16">
      <div className={cn("mx-auto max-w-3xl", className)}>{children}</div>
    </div>
  );
}

/** Hairline-divided section inside a narrow policy/content column. */
export function ContentSection({
  id,
  eyebrow,
  title,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn("py-8 first:pt-0", className)}
    >
      {eyebrow ? <p className="label-caps">{eyebrow}</p> : null}
      <h2
        id={id ? `${id}-heading` : undefined}
        className="mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}
