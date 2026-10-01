import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// PromoBanner — in-page slim promo strip (reference's "Buy 2 Get 7%" role),
// always a genuine offer with a real destination.

export function PromoBanner({
  message,
  href,
  linkLabel,
  tone = "sand",
  className,
}: {
  message: string;
  href?: string;
  linkLabel?: string;
  tone?: "sand" | "brand" | "outline";
  className?: string;
}) {
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
