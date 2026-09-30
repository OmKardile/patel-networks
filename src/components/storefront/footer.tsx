import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { STORE } from "@/lib/constants";

// Storefront footer — rebuilt from zero: sand trade-circle band (real WhatsApp
// deep link — no unbacked newsletter form), white slab with link columns,
// GST/trust line, bottom bar with the developer credit and staff entrance.

const shopLinks = [
  { href: "/products?category=cctv-surveillance", label: "CCTV & Surveillance" },
  { href: "/products?category=displays-screens", label: "Displays & Screens" },
  { href: "/products?category=cables-wiring", label: "Cables & Wiring" },
  { href: "/products?category=connectors-accessories", label: "Connectors & Accessories" },
  { href: "/products?category=media-converters-optical", label: "Media Converters & Optical" },
  { href: "/kit-builder", label: "CCTV Kit Builder" },
  { href: "/brands", label: "All Brands" },
];

const accountLinks = [
  { href: "/account", label: "My Account" },
  { href: "/account/orders", label: "Orders & Tracking" },
  { href: "/account/addresses", label: "Address Book" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/track", label: "Track Order" },
  { href: "/contact", label: "B2B / Wholesale Desk" },
];

const policyLinks = [
  { href: "/about", label: "About Us" },
  { href: "/showcase", label: "Our Platform" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return & Warranty Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Sale" },
];

export function Footer() {
  const whatsappHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — add me to the trade circle broadcast."
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

      {/* white slab */}
      <div className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8">
          {/* brand + contact */}
          <div>
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-foreground">Patel Networks</span>
              <span className="label-caps mt-1 !text-[9px] !tracking-[0.3em]">SURVEILLANCE · NETWORKING</span>
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
              Authorized distribution and counter expertise for CCTV, surveillance and networking hardware — serving
              homes, installers and system integrators from Surat, Gujarat.
            </p>
            <ul className="mt-5 space-y-2.5 text-[13px] text-muted-foreground">
              <li>
                <a href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`} className="flex items-center gap-2 transition-colors hover:text-foreground">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden /> {STORE.supportPhone}
                </a>
              </li>
              <li>
                <a href={`mailto:${STORE.email}`} className="flex items-center gap-2 transition-colors hover:text-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden /> {STORE.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>
                  The counter, {STORE.city} — {STORE.originPin}, {STORE.originState} · dispatch cut-off{" "}
                  {STORE.dispatchCutoff}
                </span>
              </li>
            </ul>
          </div>

          {/* link columns */}
          <nav aria-label="Shop">
            <p className="label-caps">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <p className="label-caps">Your account</p>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Explore">
            <p className="label-caps">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {policyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* trust + bottom bar */}
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
      </div>
    </footer>
  );
}
