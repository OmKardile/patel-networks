// Ratings band — blueprint §1.2 slot 9 ("The Ratings Say It All" analog).
// Genuine posture badges only — no marketplace logos, no invented ratings.
// White band, label-caps, the store's actual operating promises.

import { BadgeCheck, Lock, MessageCircle, Receipt, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const POSTURES: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "100% Genuine Hardware" },
  { icon: Receipt, label: "GST Invoice" },
  { icon: ShieldCheck, label: "Brand Warranty" },
  { icon: Lock, label: "Secure Razorpay Checkout" },
  { icon: MessageCircle, label: "WhatsApp Support" },
];

export function RatingsBand() {
  return (
    <section aria-label="Store assurances" className="border-y border-border bg-card">
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 py-6 sm:justify-between sm:px-6 sm:py-7 lg:gap-x-10">
        {POSTURES.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon className="h-[18px] w-[18px] shrink-0 text-success" aria-hidden />
            <span className="label-caps !tracking-[0.14em]">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
