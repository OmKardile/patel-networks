import Link from "next/link";
import { MessageCircle, Smartphone, UserPlus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// TradeClubBand — reference black loyalty/app band, carrying the store's real
// trade account: OTP login at /account/login and the genuine wa.me deep link.
// The QR encodes the whatsappUrl prop (no fabricated app-store badges, no
// invented reward numbers). Stats shown are props/constants only.

export function TradeClubBand({
  whatsappUrl,
  deliveredOrders,
  dispatchCutoff,
}: {
  whatsappUrl: string;
  deliveredOrders: number;
  dispatchCutoff: string;
}) {
  const headingId = "trade-club-heading";

  const stats: string[] = [];
  if (deliveredOrders > 0) stats.push(`${deliveredOrders.toLocaleString("en-IN")} orders delivered`);
  stats.push("GST invoice on every order", `Paid orders before ${dispatchCutoff} ship same-day`);

  return (
    <div className="px-3 md:px-4">
      <section aria-labelledby={headingId} className="rounded-2xl bg-[var(--band-black)] text-white">
        <div className="container-inner">
          <div className="grid items-center gap-8 px-2 py-8 md:px-6 md:py-10 lg:grid-cols-[1.2fr_auto_1fr]">
            {/* Copy + account CTAs */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400">
                Earn the trade edge on every order
              </p>
              <h2 id={headingId} className="mt-2 text-2xl font-bold md:text-3xl">
                Join the Patel Trade Desk
              </h2>
              <p className="mt-2 text-sm text-white/70">
                One OTP account — order history, GST invoices, one-tap reorders.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/account/login"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#1c1b1b] transition-colors hover:bg-white/90"
                >
                  <UserPlus aria-hidden className="h-4 w-4" />
                  Create free account
                </Link>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  Order on WhatsApp
                </a>
              </div>
            </div>

            {/* WhatsApp QR — encodes the real wa.me deep link */}
            <div className="justify-self-center">
              <div className="rounded-xl bg-white p-3 shadow">
                <QRCodeSVG value={whatsappUrl} size={112} marginSize={0} />
              </div>
              <p className="mt-2 text-center text-[11px] text-white/60">
                Scan to WhatsApp the trade desk
              </p>
            </div>

            {/* Real-order proof panel — props/constants only */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <Smartphone aria-hidden className="h-6 text-white/80" />
              <p className="mt-3 font-semibold">Track every order</p>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {stats.map((stat) => (
                  <li key={stat} className="flex items-start gap-2">
                    <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white/50" />
                    {stat}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
