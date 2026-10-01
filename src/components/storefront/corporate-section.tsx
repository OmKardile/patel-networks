import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// CorporateSection — reference corporate/bulk band: genuine trade-desk offer
// (bulk quoting, GST invoicing, Surat dispatch) with one CTA to the dedicated
// /corporate landing (Task 52), which embeds the real B2B enquiry form.

export function CorporateSection() {
  const headingId = "corporate-bulk-orders-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <div className="mx-auto max-w-2xl rounded-lg border bg-card p-6 text-center shadow-whisper sm:p-10">
          <Building2 aria-hidden className="mx-auto h-6 w-6 text-primary" />
          <h2 id={headingId} className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
            Corporate &amp; Bulk Orders
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Outfitting a site, office or multi-location project? Send your bill of quantities to the
            trade desk — we quote in bulk, invoice with GST and dispatch from Surat with brand
            warranty on every serial.
          </p>
          <Link href="/corporate" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
            Enquire now
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
