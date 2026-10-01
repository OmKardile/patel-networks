import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

// CollectionSection — thin merchandising-band wrapper: SectionHeader + caller
// content (rail, grid…) inside container-inner. Keeps band spacing/headings
// consistent across the homepage.

export function CollectionSection({
  eyebrow,
  title,
  lede,
  href,
  linkLabel,
  headingId,
  className,
  contentClassName,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  href?: string;
  linkLabel?: string;
  headingId?: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={headingId} className={cn("container-inner", className)}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        lede={lede}
        href={href}
        linkLabel={linkLabel}
        headingId={headingId}
      />
      <div className={cn("mt-6", contentClassName)}>{children}</div>
    </section>
  );
}
