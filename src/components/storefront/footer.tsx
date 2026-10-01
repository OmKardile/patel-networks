import Link from "next/link";
import { Bell, Lock, Mail, MapPin, MapPinned, MessageCircle, Phone } from "lucide-react";
import { STORE } from "@/lib/constants";
import { FooterStory } from "./footer-story";
import { NewsletterForm } from "./newsletter-form";

// Footer — reference stack, fixed-light (bg #f7f6f2) so it reads the same in
// light and dark mode:
//   Row 1  Shop By Category (real root slugs) · Shop By Use (real search
//          queries) · sage deal-alerts card (NewsletterForm)
//   Row 2  Offers & Services / Help & Support / About Us / Policies / Contact
//          cards (WhatsApp · Call · registered address)
//   Row 3  Social icon buttons (real destinations) · secure-payments chips
//   Row 4  FooterStory
//   Row 5  Popular searches (real catalog terms)
//   Row 6  bottom bar
// Every href below is a verified route under src/app (see worklog Task 55-d).

const REGISTERED_ADDRESS =
  "Surat Central Logistics Node, Ring Road, Surat, Gujarat 395003";

// Verified root-category slugs (prisma/seed.ts + mega-menu contract).
const CATEGORY_LINKS = [
  { label: "CCTV & Surveillance", href: "/products?category=cctv-surveillance" },
  { label: "Displays & Screens", href: "/products?category=displays-screens" },
  { label: "Cables & Wiring", href: "/products?category=cables-wiring" },
  { label: "Connectors & Accessories", href: "/products?category=connectors-accessories" },
  { label: "Media Converters & Optical", href: "/products?category=media-converters-optical" },
];

// Real search links — the PLP supports the q facet.
const USE_LINKS = [
  { label: "Home security", href: "/products?q=home" },
  { label: "Shop & retail", href: "/products?q=shop" },
  { label: "Office", href: "/products?q=office" },
  { label: "Warehouse", href: "/products?q=warehouse" },
  { label: "Apartment", href: "/products?q=apartment" },
  { label: "Outdoor", href: "/products?q=outdoor" },
];

const NAV_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
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
    title: "About Us",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Showcase", href: "/showcase" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const PAYMENT_CHIPS = ["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "Wallets", "COD"];

const POPULAR_SEARCHES = [
  "IP camera",
  "DVR",
  "NVR",
  "PoE switch",
  "Cat6 cable",
  "Coaxial cable",
  "Monitor",
  "Hard drive",
];

const WHATSAPP_URL = `https://wa.me/${STORE.whatsapp}`;
const TEL_HREF = `tel:${STORE.supportPhone.replace(/\s+/g, "")}`;
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Patel+Networks+Surat";

const SOCIAL_LINKS = [
  { label: "Chat on WhatsApp", href: WHATSAPP_URL, external: true, Icon: MessageCircle },
  { label: `Email ${STORE.email}`, href: `mailto:${STORE.email}`, external: false, Icon: Mail },
  { label: "Find us on Google Maps", href: MAPS_URL, external: true, Icon: MapPinned },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#f7f6f2] text-[#1c1b1b]">
      <div className="container-inner pt-10">
        {/* Row 1 — category · use-case · deal alerts */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1.15fr]">
          <nav aria-label="Shop by category">
            <h3 className="w-fit border-b border-black/10 pb-2 text-sm font-semibold">
              Shop By Category
            </h3>
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
              {CATEGORY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-black/60 transition-colors hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Shop by use">
            <h3 className="w-fit border-b border-black/10 pb-2 text-sm font-semibold">
              Shop By Use
            </h3>
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
              {USE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-black/60 transition-colors hover:text-black"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="rounded-2xl bg-[var(--band-sage)] p-6 text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white">
              <Bell aria-hidden className="h-5 w-5 text-[#1c1b1b]" />
            </span>
            <h3 className="mt-3 text-lg font-semibold">
              Deal alerts, straight from the counter.
            </h3>
            <p className="mt-1 text-xs text-black/60">
              New arrivals and genuine savings from the {STORE.city} trade desk — one short note
              when something lands, nothing else.
            </p>
            <div className="mt-4">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>

        {/* Row 2 — nav columns + contact cards */}
        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-black/10 pt-8 md:grid-cols-3 lg:grid-cols-5">
          {NAV_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide">{column.title}</h3>
              <ul className="mt-2 space-y-1">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-sm text-black/60 transition-colors hover:text-black"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide">Contact Us</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-black/5 bg-white p-3 text-center transition-colors hover:border-black/15"
              >
                <MessageCircle aria-hidden className="mx-auto h-4 w-4" />
                <span className="mt-1 block text-xs font-medium">WhatsApp</span>
                <span className="block text-[10px] text-black/50">Chat now</span>
              </a>
              <a
                href={TEL_HREF}
                className="rounded-xl border border-black/5 bg-white p-3 text-center transition-colors hover:border-black/15"
              >
                <Phone aria-hidden className="mx-auto h-4 w-4" />
                <span className="mt-1 block text-xs font-medium">Call</span>
                <span className="block text-[10px] text-black/50">{STORE.supportPhone}</span>
              </a>
            </div>
            <div className="mt-2 rounded-xl border border-black/5 bg-white p-3 text-center">
              <MapPin aria-hidden className="mx-auto h-4 w-4" />
              <span className="mt-1 block text-[10px] uppercase tracking-wide text-black/50">
                Registered Address
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-black/70">
                {REGISTERED_ADDRESS}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3 — social + payments */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold">Social</p>
            <div className="mt-2 flex gap-2">
              {SOCIAL_LINKS.map(({ label, href, external, Icon }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white transition-colors hover:border-black/25"
                >
                  <Icon aria-hidden className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold">
              <Lock aria-hidden className="h-3.5 w-3.5" />
              Secure payments via Razorpay
            </p>
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {PAYMENT_CHIPS.map((chip) => (
                <li
                  key={chip}
                  className="rounded-md border border-black/10 bg-white px-2 py-1 text-[10px] font-medium text-black/60"
                >
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Row 4 — brand story */}
        <FooterStory />

        {/* Row 5 — popular searches */}
        <div className="py-5">
          <p className="label-caps">Popular searches</p>
          <ul className="mt-1 flex flex-wrap gap-x-4">
            {POPULAR_SEARCHES.map((term) => (
              <li key={term}>
                <Link
                  href={`/products?q=${encodeURIComponent(term)}`}
                  className="inline-flex min-h-9 items-center text-xs text-black/50 underline underline-offset-2 transition-colors hover:text-black"
                >
                  {term}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Row 6 — bottom bar */}
        <div className="flex flex-col justify-between gap-2 border-t border-black/10 py-5 text-xs text-black/50 sm:flex-row sm:items-center">
          <p>
            © {year} {STORE.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p>Built by Om Kardile</p>
            <Link href="/admin" className="transition-colors hover:text-black">
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
