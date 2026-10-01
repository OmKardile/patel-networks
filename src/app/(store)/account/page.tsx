import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, ChevronRight, FileText, Heart, MapPin, MessageCircle, Package, Phone } from "lucide-react";
import { getCustomerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { STORE } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { AccountProfileForm, SignOutButton } from "@/components/storefront/account-profile-form";

export const metadata: Metadata = {
  title: "My Account",
  description: "Profile, orders, addresses and wishlist for Patel Networks customers.",
};

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?next=%2Faccount");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { customer: { include: { addresses: true } } },
  });
  if (!user) redirect("/account/login?next=%2Faccount");

  const [ordersCount, spendAgg] = await Promise.all([
    db.order.count({ where: { userId: user.id } }),
    db.order.aggregate({
      where: { userId: user.id, status: { not: { in: ["CANCELLED", "PENDING_PAYMENT"] } } },
      _sum: { totalAmount: true },
    }),
  ]);
  const customer = user.customer;
  const fullName = customer?.fullName ?? user.fullName ?? `Customer ${user.phone.slice(-4)}`;
  const addresses = customer?.addresses ?? [];
  const firstName = fullName.split(" ")[0];

  const quickLinks = [
    {
      href: "/account/orders",
      icon: Package,
      label: "Orders",
      value: String(ordersCount),
      sub: ordersCount === 1 ? "order placed" : "orders placed",
    },
    {
      href: "/account/wishlist",
      icon: Heart,
      label: "Wishlist",
      value: "Saved",
      sub: "gear for the next install",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      label: "Addresses",
      value: String(addresses.length),
      sub: addresses.length === 1 ? "saved address" : "saved addresses",
    },
  ];

  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Account" }]} className="mb-8" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">Your account</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Namaste, {firstName}.</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
            <span className="tabular-nums">+91 {user.phone.replace(/\D/g, "").slice(-10)}</span>
            {customer?.gstin ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2.5 py-0.5 text-xs font-medium text-primary">
                <Building2 className="h-3 w-3" aria-hidden /> B2B · {customer.gstin}
              </span>
            ) : null}
            {spendAgg._sum.totalAmount ? (
              <span className="text-xs">
                Lifetime value{" "}
                <span className="font-display text-sm font-semibold tabular-nums text-foreground">
                  {formatINR(spendAgg._sum.totalAmount)}
                </span>
              </span>
            ) : null}
          </div>
        </div>
        <SignOutButton />
      </header>

      {/* quick links */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {quickLinks.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex items-center justify-between rounded-lg border border-border bg-card p-5 shadow-whisper transition-shadow duration-300 hover:shadow-lift"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand">
                <card.icon className="h-5 w-5 text-sand-foreground" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{card.label}</p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-display text-sm font-semibold tabular-nums text-foreground">{card.value}</span> ·{" "}
                  {card.sub}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <section aria-labelledby="profile-heading" className="rounded-lg border border-border bg-card p-5 shadow-whisper sm:p-6 lg:col-span-8">
          <h2 id="profile-heading" className="label-caps mb-5">
            Profile details
          </h2>
          <AccountProfileForm />
        </section>

        <aside className="space-y-4 lg:col-span-4" aria-label="Helpful links">
          <div className="rounded-lg border border-border bg-card p-5 shadow-whisper">
            <h2 className="font-display text-base font-semibold tracking-tight">Invoices &amp; GST</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Every order carries a printable GST tax invoice with the CGST/SGST split your accountant needs. B2B
              buyers: keep your GSTIN saved so checkout prefills it.
            </p>
            <Link
              href="/account/orders"
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors hover:bg-secondary"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden /> Find an invoice
            </Link>
          </div>
          <Link
            href="/contact"
            className="block rounded-lg bg-sand p-5 text-xs leading-relaxed text-sand-foreground transition-shadow duration-300 hover:shadow-whisper"
          >
            <p className="flex items-center gap-2 font-semibold">
              <MessageCircle className="h-4 w-4" aria-hidden /> Need a bulk quote?
            </p>
            <p className="mt-2">
              Contractors and integrators get tiered pricing from the trade desk — send the site requirement and
              monthly volumes, and a quotation comes back within one working day.
            </p>
          </Link>
          <div className="rounded-lg border border-border bg-card p-5 shadow-whisper">
            <h2 className="font-display text-base font-semibold tracking-tight">Counter support</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Order questions are answered fastest by phone during business hours, before the {STORE.dispatchCutoff}{" "}
              dispatch cutoff.
            </p>
            <a
              href={`tel:${STORE.supportPhone.replace(/\s/g, "")}`}
              className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-medium hover:underline"
            >
              <Phone className="h-3.5 w-3.5" aria-hidden /> {STORE.supportPhone}
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
