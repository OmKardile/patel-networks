import type { Metadata } from "next";
import {
  BadgeCheck,
  BellRing,
  ClipboardCheck,
  Database,
  GitCompare,
  PackageSearch,
  Receipt,
  Search,
  ShieldCheck,
  Store,
  Truck,
  Warehouse,
  Wrench,
} from "lucide-react";
import { DEVELOPER } from "@/lib/constants";
import { PlatformEnquiryForm } from "@/components/content/platform-enquiry-form";
import { Breadcrumb } from "@/components/storefront/breadcrumb";

export const metadata: Metadata = {
  title: "The Platform — a project by Omkar Kardile",
  description:
    "One system, three faces: a customer storefront, a staff operations console and an owner's cockpit — designed end-to-end for a Surat CCTV & networking hardware trade. Take the tour, then enquire.",
};

/* Static, honest content — every number below maps to a real surface:
   39 Prisma domain models, a 13-state order lifecycle (ORDER_STATUSES),
   two complete themes (globals.css :root/.dark), paise-integer money (ADR-008). */

const STATS = [
  { value: "39", label: "domain data models" },
  { value: "13", label: "state order lifecycle" },
  { value: "2", label: "complete themes" },
  { value: "100%", label: "paise-exact billing" },
] as const;

const FACES = [
  {
    icon: Store,
    kicker: "For the customer",
    title: "The storefront",
    body: "A warm, editorial shopping experience for cameras, recorders, cables and networking gear — built to make a first-time visitor trust the shop before they ever call it.",
    href: "/products",
    cta: "See it live",
  },
  {
    icon: Warehouse,
    kicker: "For the team",
    title: "The operations console",
    body: "Fulfillment, inventory, returns, trade desk and moderation — every order state is server-enforced, every stock move is reasoned and logged. Staff see only what they're granted.",
    href: "#enquire",
    cta: "Request a walkthrough",
  },
  {
    icon: ClipboardCheck,
    kicker: "For the owner",
    title: "The cockpit",
    body: "Sales, GST collections, order pipeline and low stock on one dashboard; GSTR-1-ready CSVs, staff scopes, coupons, banners and store rules — no developer required.",
    href: "#enquire",
    cta: "Request a walkthrough",
  },
] as const;

const POWERS = [
  {
    icon: Search,
    title: "Catalog that answers back",
    body: "Facet filters across category, brand, price, resolution, rating and availability — plus debounced autocomplete in the header.",
  },
  {
    icon: Wrench,
    title: "5-step CCTV kit builder",
    body: "Recorder → cameras bounded by its channels → storage with a retention estimate → power & cable. Compatibility is enforced, the bundle discount applies itself.",
  },
  {
    icon: GitCompare,
    title: "Side-by-side compare",
    body: "Specs, prices and badges in one honest table — the lowest price is marked, not hidden.",
  },
  {
    icon: ShieldCheck,
    title: "OTP sign-in, no passwords",
    body: "Customers sign in with a phone and a one-time code. Guest carts merge automatically when they do.",
  },
  {
    icon: BellRing,
    title: "Wishlist with price-drop alerts",
    body: "Saved items watch their own prices and tell the customer when to come back — a quiet re-marketing engine.",
  },
  {
    icon: PackageSearch,
    title: "Tracking without an account",
    body: "Any customer can follow an order with just the order number and phone — rate-limited and sanitized.",
  },
  {
    icon: Receipt,
    title: "GST-native checkout",
    body: "B2B buyers drop a GSTIN and get input-tax-credit invoices; everyone gets CGST/SGST or IGST computed correctly by state.",
  },
  {
    icon: BadgeCheck,
    title: "Reviews that earn trust",
    body: "Nothing publishes unapproved. Moderation happens in the console; credibility happens on the page.",
  },
] as const;

const PIPELINE = ["CART", "PAID", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT FOR DELIVERY", "DELIVERED"] as const;

const OPS = [
  {
    icon: Truck,
    title: "Fulfillment console",
    body: "Legal-move-only buttons, serial numbers captured at pack, AWB booking and carrier-scan events — then a CSV when the accountant asks.",
  },
  {
    icon: Warehouse,
    title: "Stock Monitor & inventory",
    body: "A state-tile stock wall with kiosk mode. Staff observe, count and propose; managers approve and apply. Every adjustment carries a reason code and a ledger line.",
  },
  {
    icon: Receipt,
    title: "Books & taxes",
    body: "A sales chart, tax summary and a GSTR-1 schedule with CSV export — filing stops being a month-end crisis.",
  },
] as const;

const CRAFT = [
  {
    icon: Database,
    title: "Paise-exact by design",
    body: "Every rupee in the system is an integer of paise — rounding drift is structurally impossible.",
  },
  {
    icon: ShieldCheck,
    title: "Accessibility in the base",
    body: "Skip links, focus-visible rings, semantic landmarks and 44px touch targets, swept at 375 / 768 / 1280.",
  },
] as const;

export default function ShowcasePage() {
  return (
    <div className="pb-0">
      {/* hero */}
      <section className="bg-hero-ivory">
        <div className="container-inner py-12 md:py-16">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "The platform" }]} className="mb-6" />
          <div className="max-w-3xl">
            <a
              href={DEVELOPER.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="label-caps inline-flex min-h-[44px] items-center transition-colors hover:text-foreground"
            >
              A project by {DEVELOPER.name} ↗
            </a>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              A shop counter, a stockroom and a back office —
              <span className="block text-primary">designed as one system.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              Most local trade businesses run on three disconnected tools: a website, a notebook and hope. This
              platform is one designed whole — a storefront customers enjoy, a console the staff can actually run, and
              a cockpit where the owner sees the truth. Take the tour below — every number on this page is real — and
              send the developer an enquiry at the end when it fits your business.
            </p>

            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border shadow-whisper lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-card px-6 py-6">
                  <dd className="font-display text-2xl leading-none tracking-tight lg:text-3xl">{s.value}</dd>
                  <dt className="label-caps mt-2.5 !text-[10px]">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* three faces */}
      <section className="container-inner py-12 md:py-16" aria-labelledby="faces">
        <p className="label-caps">Three faces</p>
        <h2 id="faces" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          One platform, three seats
        </h2>
        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {FACES.map((face) => (
            <div key={face.title} className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-whisper">
              <face.icon className="h-5 w-5 text-primary" aria-hidden />
              <p className="label-caps mt-4 !text-[10px]">{face.kicker}</p>
              <h3 className="mt-1.5 font-display text-xl font-semibold tracking-tight">{face.title}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-muted-foreground">{face.body}</p>
              <a
                href={face.href}
                className="press mt-5 inline-flex min-h-[44px] w-fit items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {face.cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* powers */}
      <section className="container-inner pb-12 md:pb-16" aria-labelledby="powers">
        <p className="label-caps">What it does</p>
        <h2 id="powers" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Commerce features that carry their weight
        </h2>
        <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POWERS.map((p) => (
            <li key={p.title} className="rounded-lg border border-border bg-card p-5 shadow-whisper">
              <p.icon className="h-4 w-4 text-primary" aria-hidden />
              <h3 className="mt-3 font-display text-[15px] font-semibold leading-snug tracking-tight">{p.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* pipeline */}
      <section className="container-inner pb-12 md:pb-16" aria-labelledby="pipeline">
        <p className="label-caps">Server-enforced lifecycle</p>
        <h2 id="pipeline" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          An order can only move where the state machine allows
        </h2>
        <ol className="mt-7 flex flex-wrap items-center gap-2" aria-label="Order pipeline">
          {PIPELINE.map((state, i) => (
            <li key={state} className="flex items-center gap-2">
              <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-semibold tracking-[0.06em] text-foreground shadow-whisper">
                {state}
              </span>
              {i < PIPELINE.length - 1 ? <span aria-hidden className="text-muted-foreground">→</span> : null}
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {OPS.map((op) => (
            <div key={op.title} className="rounded-lg border border-border bg-card p-5 shadow-whisper">
              <op.icon className="h-4 w-4 text-primary" aria-hidden />
              <h3 className="mt-3 font-display text-[15px] font-semibold leading-snug tracking-tight">{op.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{op.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* craft + enquiry */}
      <section id="enquire" className="scroll-mt-16 border-t border-border">
        <div className="container-inner py-12 md:py-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="label-caps">Enquire</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Want a platform like this for your trade?
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                This system was designed and built end-to-end by {DEVELOPER.name} for the hardware trade. If your
                business runs on disconnected tools, the same approach — one data core, three seats, honest numbers —
                can be yours. Send an enquiry and it goes directly to the developer, not the store&apos;s trade desk.
              </p>
              <ul className="mt-6 space-y-3">
                {CRAFT.map((c) => (
                  <li key={c.title} className="flex gap-3 text-[13px] leading-relaxed text-muted-foreground">
                    <c.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <strong className="font-medium text-foreground">{c.title}.</strong> {c.body}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground">
                Prefer email?{" "}
                <a href={`mailto:${DEVELOPER.email}`} className="underline underline-offset-2 hover:text-foreground">
                  {DEVELOPER.email}
                </a>
              </p>
            </div>
            <div className="lg:col-span-7">
              <PlatformEnquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
