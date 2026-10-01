import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";

// NewsletterBand — reference app-download band slot. NO app and NO newsletter
// backend exist, so the band offers the genuine alternative: WhatsApp deal
// alerts (wa.me deep link with prefilled text) + browse-new-arrivals secondary.

export function NewsletterBand() {
  const headingId = "deal-alerts-heading";
  const waHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — please send me new-arrival and deal alerts.",
  )}`;

  return (
    <section aria-labelledby={headingId} className="bg-sand text-sand-foreground">
      <div className="container-inner flex flex-col items-center gap-5 py-12 text-center md:py-16">
        <p className="label-caps">Deal alerts</p>
        <h2 id={headingId} className="max-w-xl text-xl font-semibold tracking-tight sm:text-2xl">
          Deal alerts, zero spam.
        </h2>
        <p className="max-w-md text-sm text-foreground/80">
          Message the trade desk once and we&apos;ll keep you posted on new arrivals and restocks —
          no email list, no noise.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ size: "lg" })}
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            Get alerts on WhatsApp
          </a>
          <Link
            href="/products?sort=newest"
            className="link-underline inline-flex min-h-[44px] items-center text-sm font-medium"
          >
            Browse new arrivals
          </Link>
        </div>
      </div>
    </section>
  );
}
