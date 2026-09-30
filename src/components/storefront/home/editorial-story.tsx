// Editorial story band — blueprint §1.2 slot 4 ("Brogues Reborn" analog):
// one full-width story about a real part of the catalog — large image side,
// text side, pill CTA. Tone is swappable between the two brand surfaces
// (sand promo band / deep-green brand band) from the same tokens.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorialStoryProps {
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tone?: "sand" | "brand";
  headingId?: string;
}

export function EditorialStory({
  eyebrow,
  title,
  body,
  imageUrl,
  imageAlt,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  tone = "sand",
  headingId,
}: EditorialStoryProps) {
  const onBrand = tone === "brand";
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "border-y",
        onBrand ? "border-brand-foreground/10 bg-brand text-brand-foreground" : "border-border bg-sand text-sand-foreground"
      )}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-14 lg:py-20">
        {/* image side */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-whisper lg:aspect-[5/4]">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* text side */}
        <div className="max-w-xl">
          <p className={cn("label-caps", onBrand && "!text-brand-foreground/70")}>{eyebrow}</p>
          <h2 id={headingId} className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className={cn("mt-4 text-sm leading-relaxed sm:text-[15px]", onBrand ? "text-brand-foreground/85" : "text-sand-foreground/85")}>
            {body}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              {ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className={cn(
                  "inline-flex h-11 items-center rounded-full border px-6 text-sm font-medium transition-colors duration-200",
                  onBrand
                    ? "border-brand-foreground/40 text-brand-foreground hover:bg-brand-foreground/10"
                    : "border-sand-foreground/40 text-sand-foreground hover:bg-sand-foreground/10"
                )}
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
