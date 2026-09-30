import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, PackageOpen } from "lucide-react";
import { getCustomerSession } from "@/lib/session";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/money";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Your Patel Networks order history with invoices and tracking.",
};

function statusPillClass(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "border-success/30 bg-success/10 text-success";
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "PENDING_PAYMENT":
      return "border-accent/50 bg-accent/10 text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export default async function AccountOrdersPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/account/login?next=%2Faccount%2Forders");

  const orders = await db.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: { take: 2 }, payments: true, _count: { select: { items: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8">
        <p className="label-caps mb-2">Your account</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invoices, tracking and live status — everything per order, in one place.</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-whisper">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand" aria-hidden>
            <PackageOpen className="h-6 w-6 text-sand-foreground" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">No orders yet.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            When you place an order it appears here with its GST invoice, courier tracking and warranty serials.
          </p>
          <Button asChild className="mt-6 h-10">
            <Link href="/products">Browse the catalogue</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4" aria-label="Order history">
          {orders.map((order) => {
            const payment = order.payments[order.payments.length - 1];
            const paid = payment?.status === "SUCCESS" || ["PAID", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
            return (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="group flex flex-wrap items-start justify-between gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-5 shadow-whisper transition-shadow hover:shadow-lift"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span className="font-display text-lg font-semibold tracking-tight">{order.orderNumber}</span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusPillClass(order.status)}`}>
                        {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
                      </span>
                      {order.isB2B && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          B2B
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} · {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"} ·{" "}
                      {paid ? "paid" : "payment pending"}
                    </p>
                    <p className="mt-2 truncate text-sm text-muted-foreground">
                      {order.items.map((i) => `${i.productName} × ${i.quantity}`).join(", ")}
                      {order._count.items > order.items.length ? `, +${order._count.items - order.items.length} more` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display text-xl font-semibold tabular-nums">{formatINR(order.totalAmount)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
