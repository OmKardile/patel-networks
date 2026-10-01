import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// PromoBanner — two modes, both genuine offers with real destinations:
//
// 1. Reference mode (pass imageUrl + title): full-bleed editorial promo —
//    edge-to-edge image, tone scrim + localized panel gradient behind the
//    copy block, uppercase display title, rectangular CTA. No side margins.
// 2. Slim mode (legacy, message + href): in-page promo strip (the reference's
//    "Buy 2 Get 7%" role) — kept byte-compatible for existing call sites.

type SlimTone = "sand" | "brand" | "outline";
type ReferenceTone = "dark" | "light";

export function PromoBanner({
  message,
  href,
  linkLabel,
  tone = "sand",
  className,
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  ctaHref,
  ctaLabel = "Shop now",
  align = "right",
}: {
  message?: string;
  href?: string;
  linkLabel?: string;
  tone?: SlimTone | ReferenceTone;
  className?: string;
  imageUrl?: string;
  imageAlt?: string;
  eyebrow?: string;
  title?: string;
  ctaHref?: string;
  ctaLabel?: string;
  align?: "left" | "right";
}) {
  // Reference full-bleed editorial promo
  if (imageUrl && title) {
    const referenceTone: ReferenceTone = tone === "light" ? "light" : "dark";
    const dark = referenceTone === "dark";

    return (
      <section
        aria-label={title}
        className={cn("relative min-h-[280px] w-full overflow-hidden md:min-h-[420px]", className)}
      >
        <Image
          src={imageUrl}
          alt={imageAlt ?? title}
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Tone scrim */}
        <div
          aria-hidden
          className={cn("absolute inset-0", dark ? "bg-black/45" : "bg-white/35")}
        />
        {/* Localized panel gradient behind the copy block */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-y-0 w-full md:w-2/3",
            align === "right"
              ? cn("right-0 bg-gradient-to-l", dark ? "from-black/55" : "from-white/60")
              : cn("left-0 bg-gradient-to-r", dark ? "from-black/55" : "from-white/60"),
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 flex max-w-md items-center px-6 md:px-14",
            align === "right" ? "right-0 text-right" : "left-0 text-left",
            dark ? "text-white" : "text-[#1c1b1b]",
          )}
        >
          <div>
            {eyebrow ? (
              <p className={cn("text-[11px] font-semibold uppercase tracking-[0.2em]", dark ? "text-white opacity-80" : "text-[#1c1b1b] opacity-80")}>
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-2xl font-extrabold uppercase leading-tight md:text-4xl">
              {title}
            </h2>
            {ctaHref ? (
              <Link
                href={ctaHref}
                className={cn(
                  "mt-5 inline-flex h-11 items-center rounded-md px-6 text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-90",
                  dark ? "bg-white text-[#1c1b1b]" : "bg-[#8a6142] text-white",
                )}
              >
                {ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // Legacy slim promo strip — unchanged behavior for existing call sites
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm sm:px-6",
        tone === "sand" && "bg-sand text-sand-foreground",
        tone === "brand" && "bg-brand text-brand-foreground",
        tone === "outline" && "border bg-card",
        className,
      )}
    >
      <p className="font-medium">{message}</p>
      {href && linkLabel ? (
        <Link
          href={href}
          className="link-underline inline-flex min-h-[44px] items-center gap-1 font-semibold"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
