import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { STORE } from "@/lib/constants";
import { FooterStory } from "@/components/storefront/footer-story";

// Storefront footer — regrouped to the reference information architecture
// (blueprint §1.2 row 15): sand trade-circle band kept as the top band, four
// link columns (Offers & Services / Help & Support / Company / Policies),
// contact + trust line, brand-story SEO block (collapsible), and the
// existing bottom bar. Real routes only; no newsletter form (the homepage
// NewsletterBand owns that job — the footer keeps a slim WhatsApp pill).

const offerServiceLinks = [
  { href: "/kit-builder", label: "Kit Builder" },
  { href: "/brands", label: "Brands" },
  { href: "/track", label: "Track Order" },
  { href: "/contact", label: "Bulk Inquiry" },
];

const helpSupportLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return & Warranty Policy" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/showcase", label: "Showcase" },
];

const policyLinks = [
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return & Warranty Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Sale" },
];

function FooterColumn({ label, links }: { label: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={label}>
      <p className="label-caps">{label}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={`${l.href}-${l.label}`}>
            <Link href={l.href} className="text-[13px] text-muted-foreground transition-colors duration-200 hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const whatsappHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — add me to the trade circle broadcast."
  )}`;
  const dealAlertsHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — send me the deal alerts and fresh stock lists."
  )}`;

  return (
    <footer className="mt-auto">
      {/* trade-circle band — WhatsApp broadcast opt-in, no fake newsletter */}
      <div className="bg-sand text-sand-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center">
          <div>
            <p className="label-caps !text-sand-foreground/70">The trade circle</p>
            <h2 className="mt-1.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Fresh stock lists, straight to your WhatsApp.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-sand-foreground/80">
              New arrivals, restocks and counter deals — broadcast-only, no spam, unsubscribe any time. The same channel
              installers across South Gujarat already use.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Join the trade circle
            </a>
            <a
              href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-sand-foreground/30 px-6 text-sm font-medium transition-colors hover:bg-sand-foreground/10"
            >
              <Phone className="h-4 w-4" aria-hidden /> Call the counter
            </a>
          </div>
        </div>
      </div>

      {/* white slab — reference IA */}
      <div className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* brand row + slim deal-alerts pill (no newsletter duplication) */}
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-foreground">Patel Networks</span>
              <span className="label-caps mt-1 !text-[9px] !tracking-[0.3em]">SURVEILLANCE · NETWORKING</span>
            </Link>
            <a
              href={dealAlertsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-full border border-border px-4 text-xs font-medium text-foreground transition-colors duration-200 hover:bg-muted"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Deal alerts on WhatsApp
            </a>
          </div>

          {/* four link columns — reference grouping */}
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            <FooterColumn label="Offers & Services" links={offerServiceLinks} />
            <FooterColumn label="Help & Support" links={helpSupportLinks} />
            <FooterColumn label="Company" links={companyLinks} />
            <FooterColumn label="Policies" links={policyLinks} />
          </div>

          {/* contact / trust line */}
          <div className="mt-10 border-t border-border pt-6">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-muted-foreground">
              <li>
                <a
                  href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden /> {STORE.supportPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${STORE.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden /> {STORE.email}
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> WhatsApp the trade desk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  Surat Central Hub, {STORE.city}, {STORE.originState} {STORE.originPin} · GSTIN {STORE.gstin}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  Counter on working days · paid orders before {STORE.dispatchCutoff} dispatch same-day
                </span>
              </li>
            </ul>
            <p className="mt-4 flex items-center gap-2 text-[12px] font-medium text-foreground/80">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
              100% Secure Transactions · Razorpay · UPI
            </p>
          </div>

          {/* brand-story SEO block (client, collapsible) */}
          <FooterStory />
        </div>
      </div>

      {/* bottom bar — trust line, copyright, developer credit, staff entrance */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-5 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <p className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-success" aria-hidden />
            GST tax invoices on every order · 100% genuine, brand-authorized stock · serial-tracked warranty
          </p>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Patel Networks</span>
            <a
              href="https://omkardile.is-a.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Built by Om Kardile
            </a>
            <Link href="/admin/login" className="text-muted-foreground/50 transition-colors hover:text-foreground">
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
