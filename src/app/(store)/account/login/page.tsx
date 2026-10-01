"use client";

// OTP sign-in surface. Client component: checks for an existing session via
// /api/auth/me, then hands off to the shared OTPLogin. The ?next= param is
// honored only when it is a local path (same sanitization as the /login alias).

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FileText, ShieldCheck, Truck } from "lucide-react";
import { OTPLogin } from "@/components/storefront/otp-login";
import { Breadcrumb } from "@/components/storefront/breadcrumb";

function LoginInner() {
  const params = useSearchParams();
  const router = useRouter();
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!cancelled && res.ok) setHasSession(true);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hasSession) {
      router.replace(next.startsWith("/") ? next : "/account");
    }
  }, [hasSession, next, router]);

  if (checkingSession) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-10" aria-busy="true">
        <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (hasSession) {
    return (
      <div className="mx-auto max-w-md py-10 text-center text-sm text-muted-foreground" aria-busy="true">
        You are already signed in — taking you to your account…
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <header className="mb-8">
          <p className="label-caps mb-2">Account access</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Sign in or create your account</h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            One account for the counter and the site: orders with GST invoices, saved delivery addresses, live
            shipment tracking and a wishlist that watches prices for you.
          </p>
        </header>
        <ul className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <li className="flex gap-3">
            <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              <strong className="font-medium text-foreground">Track every consignment.</strong> Dispatch, transit and
              out-for-delivery updates land in your account and on WhatsApp.
            </span>
          </li>
          <li className="flex gap-3">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              <strong className="font-medium text-foreground">GST-ready invoices.</strong> Printable tax invoices with
              CGST/SGST or IGST — save your GSTIN once and checkout prefills it.
            </span>
          </li>
          <li className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              <strong className="font-medium text-foreground">No passwords to leak.</strong> Sign-in is a 6-digit
              one-time code on your own mobile; guest carts merge automatically.
            </span>
          </li>
        </ul>
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          Buying for a business? The trade desk answers bulk quotations within one working day —{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
            send the requirement
          </Link>
          .
        </p>
      </div>
      <div className="lg:col-span-5">
        <OTPLogin redirectTo={next} />
      </div>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Sign in" }]} className="mb-8" />
      <Suspense
        fallback={
          <div className="mx-auto max-w-md space-y-4 py-10" aria-busy="true">
            <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>
        }
      >
        <LoginInner />
      </Suspense>
    </div>
  );
}
