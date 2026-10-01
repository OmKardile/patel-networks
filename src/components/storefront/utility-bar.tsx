import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";

// UtilityBar — dark quiet strip between the teal countdown and the sticky nav
// (reference chrome). Desktop-only: the mobile menu sheet owns these routes
// below md. Left = store/WhatsApp entry points, right = support links, and the
// same-day-dispatch strap sits absolute-centered.
// Every link is a 44px-tall hit area (h-11 row centered inside the h-9 bar).
// The strap is ~480px at text-[10px]/0.14em tracking, so it is shown from lg
// up — at md it would collide with both side groups.

const SUPPORT_LINKS = [
  { label: "Track Order", href: "/track" },
  { label: "About", href: "/about" },
  { label: "Help", href: "/faq" },
];

const linkClass =
  "inline-flex h-11 items-center gap-1.5 whitespace-nowrap text-xs text-white/85 transition-colors hover:text-white";

export function UtilityBar() {
  return (
    <div className="hidden h-9 bg-[#1c1c1c] text-white/85 md:block">
      <div className="container-inner relative flex h-full w-full items-center justify-between">
        <nav aria-label="Utility" className="flex items-center gap-1">
          <Link href="/store-locator" className={linkClass}>
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Surat Store
          </Link>
          <a
            href={`https://wa.me/${STORE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            WhatsApp Orders
          </a>
        </nav>

        <p className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.14em] text-white/70 lg:block">
          Same-day dispatch before {STORE.dispatchCutoff} · GST invoice on every order
        </p>

        <nav aria-label="Support" className="flex items-center gap-5">
          {SUPPORT_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
