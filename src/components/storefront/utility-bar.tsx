import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";

// UtilityBar — desktop-only reference row: quiet policy/trade links on the
// left, the WhatsApp trade desk on the right. Hidden below md (the mobile
// menu sheet owns these routes on small screens).

const UTILITY_LINKS = [
  { label: "Track Order", href: "/track" },
  { label: "FAQ", href: "/faq" },
  { label: "Bulk Inquiry", href: "/contact" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Return Policy", href: "/return-policy" },
  { label: "Contact", href: "/contact" },
];

export function UtilityBar() {
  return (
    <div className="hidden h-9 items-center border-b bg-background md:flex">
      <div className="container-inner flex h-full w-full items-center justify-between">
        <nav aria-label="Utility" className="flex items-center gap-4">
          {UTILITY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href={`https://wa.me/${STORE.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          WhatsApp us
        </a>
      </div>
    </div>
  );
}
