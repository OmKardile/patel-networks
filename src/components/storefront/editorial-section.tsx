import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// EditorialSection — reference "brand story" band: sand or brand-toned
// full-bleed band with eyebrow/title/body, optional category imagery and a
// primary + secondary CTA. Copy is owned by the page; nothing invented here.
// variant="statement" renders the reference's centered white statement band
// (icon chip + green heading + muted body) instead.

export function EditorialSection({
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
  variant,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaHref?: string;
  ctaLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  tone?: "sand" | "brand";
  headingId?: string;
  variant?: "default" | "statement";
}) {
  if (variant === "statement") {
    return (
      <section aria-labelledby={headingId} className="bg-white py-12 text-center md:py-16">
        <div className="container-inner">
          <span
            aria-hidden
            className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-white"
          >
            <Leaf className="h-5 text-green-700" />
          </span>
          {eyebrow ? (
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="mt-2 text-2xl font-semibold tracking-tight text-green-800 md:text-3xl"
          >
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-black/60">{body}</p>
          {ctaHref && ctaLabel ? (
            <div className="mt-6 flex justify-center">
              <Link
                href={ctaHref}
                className="inline-flex h-11 items-center rounded-md border border-black/15 bg-white px-6 text-sm font-semibold text-[#1c1b1b] transition-colors hover:bg-black/5"
              >
                {ctaLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  const onBrand = tone === "brand";

  return (
    <section
      aria-labelledby={headingId}
      className={cn(onBrand ? "bg-brand text-brand-foreground" : "bg-sand text-sand-foreground")}
    >
      <div
        className={cn(
          "container-inner py-12 md:py-16",
          imageUrl && "grid items-center gap-8 md:grid-cols-2",
        )}
      >
        <div>
          {eyebrow ? (
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", onBrand ? "text-brand-foreground/70" : "text-muted-foreground")}>
              {eyebrow}
            </p>
          ) : null}
          <h2 id={headingId} className="mt-1 max-w-xl text-xl font-semibold tracking-tight sm:text-2xl">
            {title}
          </h2>
          <p className={cn("mt-3 max-w-xl text-sm leading-relaxed", onBrand ? "text-brand-foreground/85" : "text-foreground/80")}>
            {body}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {ctaHref && ctaLabel ? (
              <Link href={ctaHref} className={buttonVariants({ size: "lg" })}>
                {ctaLabel}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="link-underline inline-flex min-h-[44px] items-center text-sm font-medium"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border shadow-whisper">
            <Image
              src={imageUrl}
              alt={imageAlt ?? ""}
              fill
              sizes="(min-width:768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
