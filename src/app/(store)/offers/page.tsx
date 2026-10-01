import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  Percent,
  ReceiptText,
  ShieldCheck,
  Ticket,
  Timer,
  Truck,
} from "lucide-react";
import { db } from "@/lib/db";
import { STORE, COD_MAX_ORDER_VALUE_PAISE, FREE_SHIPPING_THRESHOLD_PAISE } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { ContentPageShell } from "@/components/storefront/content-page-shell";
import { buttonVariants } from "@/components/ui/button";

// /offers — brief deliverable "Offers". Everything here is real and verifiable:
// bundle discounts come from the live Bundle table (the same rows the cart
// engine evaluates), the standing mechanics come from constants. No invented
// campaigns, no fake countdowns, no coupon-code listing (admin codes may be
// private — cart/checkout redemption still works).

export const metadata: Metadata = {
  title: `Offers & Savings | ${STORE.name}`,
  description: `Genuine ongoing savings at ${STORE.name}: CCTV kit bundle discounts, free shipping over ${formatINR(
    FREE_SHIPPING_THRESHOLD_PAISE,
  )}, COD up to ${formatINR(COD_MAX_ORDER_VALUE_PAISE)}, GST invoice on every order.`,
  alternates: { canonical: "/offers" },
};

export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const bundles = await db.bundle
    .findMany({
      where: { isActive: true },
      orderBy: { discountPct: "desc" },
      include: { items: { select: { slot: true } } },
    })
    .catch(() => []);

  const mechanics = [
    {
      icon: Truck,
      title: `Free shipping over ${formatINR(FREE_SHIPPING_THRESHOLD_PAISE)}`,
      body: `Orders above ${formatINR(FREE_SHIPPING_THRESHOLD_PAISE)} ship free India-wide; below that a flat, quoted-at-checkout rate applies.`,
      href: "/shipping-policy",
      linkLabel: "Shipping policy",
    },
    {
      icon: Percent,
      title: "Kit bundle discount, applied automatically",
      body: "Build a recorder + camera kit in the Kit Builder and the bundle discount is applied in the cart — no code to remember, no minimum paperwork.",
      href: "/kit-builder",
      linkLabel: "Open Kit Builder",
    },
    {
      icon: Banknote,
      title: `Cash on Delivery up to ${formatINR(COD_MAX_ORDER_VALUE_PAISE)}`,
      body: `Pay the courier at your door on orders up to ${formatINR(
        COD_MAX_ORDER_VALUE_PAISE,
      )} (prepaid-only above that; air-cargo zones excluded).`,
      href: "/shipping-policy",
      linkLabel: "COD details",
    },
    {
      icon: ReceiptText,
      title: "GST invoice on every order",
      body: "B2B buyers get a GST invoice with the store's GSTIN on it — claim input tax credit on the hardware you install for clients.",
      href: "/corporate",
      linkLabel: "Bulk & corporate desk",
    },
    {
      icon: Timer,
      title: `Same-day dispatch from ${STORE.city}`,
      body: `Paid orders placed before ${STORE.dispatchCutoff} leave the ${STORE.city} counter the same working day.`,
      href: "/shipping-policy",
      linkLabel: "Dispatch details",
    },
    {
      icon: ShieldCheck,
      title: "Brand warranty on hardware",
      body: "Every camera, recorder and switch carries the manufacturer's India warranty — serial-matched RMA support through the trade desk.",
      href: "/return-policy",
      linkLabel: "Warranty & returns",
    },
  ];

  return (
    <ContentPageShell
      eyebrow="Offers & Savings"
      title="Real savings, no fine print"
      lede={`Standing offers you can verify at checkout — bundle discounts computed live, shipping thresholds from the shipping policy, and a GST invoice on every ${STORE.name} order.`}
    >
      {bundles.length > 0 ? (
        <section aria-labelledby="bundle-offers-heading" className="mb-10">
          <h2 id="bundle-offers-heading" className="mb-4 text-lg font-semibold tracking-tight">
            Live kit bundles
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {bundles.map((bundle) => {
              const slots = [
                ...new Set(bundle.items.map((item) => item.slot.charAt(0).toUpperCase() + item.slot.slice(1))),
              ];
              return (
                <li
                  key={bundle.id}
                  className="flex flex-col rounded-lg border bg-card p-4 sm:p-6"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-base font-semibold tracking-tight">{bundle.name}</h3>
                    <p className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-sm font-semibold text-success tabular-nums">
                      <Percent aria-hidden className="h-3.5 w-3.5" />
                      {bundle.discountPct}% off
                    </p>
                  </div>
                  {bundle.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{bundle.description}</p>
                  ) : null}
                  {slots.length > 0 ? (
                    <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                      Covers: {slots.join(" · ")}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href="/kit-builder" className={buttonVariants({ variant: "default", size: "sm" }) + " min-h-[44px]"}>
                      Build this kit
                    </Link>
                    <span className="inline-flex min-h-[44px] items-center text-sm text-muted-foreground">
                      Discount applies automatically in the cart
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="standing-offers-heading">
        <h2 id="standing-offers-heading" className="mb-4 text-lg font-semibold tracking-tight">
          Always on
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {mechanics.map((item) => (
            <li key={item.title} className="rounded-lg border bg-card p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon aria-hidden className="h-4.5 w-4.5 text-success" />
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.body}</p>
                  <Link href={item.href} className="link-underline mt-2 inline-flex min-h-[44px] items-center text-sm font-medium">
                    {item.linkLabel}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-10 flex flex-col items-start gap-3 rounded-lg border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <Ticket aria-hidden className="mt-0.5 h-5 w-5 text-success" />
          <p className="text-sm leading-6 text-foreground">
            <span className="font-semibold">Have a coupon code?</span> Apply it in the cart or at
            checkout — codes are validated against your order value in real time.
          </p>
        </div>
        <Link href="/cart" className={buttonVariants({ variant: "secondary", size: "sm" }) + " min-h-[44px]"}>
          Go to cart
        </Link>
      </aside>
    </ContentPageShell>
  );
}
