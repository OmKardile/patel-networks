"use client";

// WhatsAppWidget — floating circular trade-desk chat button (brand green).
// Hidden on /checkout where the checkout flow owns the screen.

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
      aria-label="Chat with the trade desk on WhatsApp"
      className="fixed bottom-4 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-brand text-brand-foreground shadow-whisper transition-colors hover:bg-brand/90"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
    </a>
  );
}
