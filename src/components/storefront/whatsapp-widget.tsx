"use client";

// WhatsAppWidget — reference floating chat FAB: brand-green circle pinned
// bottom-LEFT so it never collides with right-anchored chrome (compare tray /
// cart drawer). Hidden on /checkout where the checkout flow owns the screen.

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";

export function WhatsAppWidget() {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return null;

  return (
    <a
      href={`https://wa.me/${STORE.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 left-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-opacity hover:opacity-90"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}
