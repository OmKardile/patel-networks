import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/lib/constants";
import { FooterStory } from "./footer-story";

// Footer — reference IA: slim sand trade band → 4 link columns
// (Offers & Services / Help & Support / Company / Policies) → contact/trust
// line → collapsible brand story → bottom bar. Server component; only the
// story disclosure is client-side (footer-story.tsx).

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Offers & Services",
    links: [
      { label: "Offers", href: "/offers" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Kit Builder", href: "/kit-builder" },
      { label: "Brands", href: "/brands" },
      { label: "Track Order", href: "/track" },
      { label: "Bulk Inquiry", href: "/corporate" },
      { label: "Store Locator", href: "/store-locator" },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Return Policy", href: "/return-policy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Showcase", href: "/showcase" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Return Policy", href: "/return-policy" },
    ],
  },
];

const WHATSAPP_URL = `https://wa.me/${STORE.whatsapp}`;
const TEL_HREF = `tel:${STORE.supportPhone.replace(/\s+/g, "")}`;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      {/* Slim sand trade band */}
      <div className="bg-sand text-sand-foreground">
        <div className="container-inner flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">
            Surat's security &amp; networking counter — same-day dispatch on paid orders before{" "}
            {STORE.dispatchCutoff}.
          </p>
          <Button asChild size="sm" className="h-9 w-fit shrink-0">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp us
            </a>
          </Button>
        </div>
      </div>

      <div className="container-inner">
        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 md:grid-cols-4">
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="label-caps">{column.title}</h3>
              <ul className="mt-2">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Contact / trust line */}
        <div className="border-t py-5">
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <a
                href={TEL_HREF}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {STORE.supportPhone}
              </a>
              <a
                href={`mailto:${STORE.email}`}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {STORE.email}
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                WhatsApp the trade desk
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              {STORE.city} · {STORE.originState} {STORE.originPin} · GSTIN {STORE.gstin}
            </p>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              Counter on working days · paid orders before {STORE.dispatchCutoff} dispatch
              same-day
            </p>
            <p>100% Secure Transactions · Razorpay · UPI</p>
          </div>
        </div>

        <FooterStory />

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 border-t py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {STORE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p>Built by Om Kardile</p>
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
