import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PackageSearch, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Looking for your order confirmation? Track your Patel Networks order by number and mobile.",
  robots: { index: false, follow: true },
};

// Rescue page for bare /order-success hits (the real confirmation screen lives at
// /order-success/[orderNumber] — checkout always links there with the number filled in).
export default function OrderSuccessIndexPage() {
  return (
    <div className="container-inner py-16 sm:py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-xl border border-border bg-card px-6 py-12 text-center shadow-whisper sm:px-12">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sand" aria-hidden>
          <PackageSearch className="h-8 w-8 text-sand-foreground" />
        </span>
        <p className="label-caps mt-5">Order confirmation</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Looking for your order confirmation?
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Confirmation pages open with the order number in the link (like{" "}
          <span className="rounded-full border border-border bg-background px-2.5 py-0.5 font-mono text-[13px]">/order-success/PN-2026-000123</span>
          ). If you just placed an order and landed here, your order is still safe — track it with the number and the mobile on the order.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="h-11 min-h-[44px] px-6">
            <Link href="/track">
              <PackageSearch className="h-4 w-4" aria-hidden />
              Track an order
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 min-h-[44px] px-6">
            <Link href="/account/orders">
              <ReceiptText className="h-4 w-4" aria-hidden />
              Your orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
