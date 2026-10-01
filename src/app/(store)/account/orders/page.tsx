import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, PackageOpen } from "lucide-react";
import { getCustomerSession } from "@/lib/session";
import { getOrdersForUser } from "@/server/services/order.service";
import { formatINR } from "@/lib/money";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PayNowButton } from "@/components/storefront/checkout-pay-now-button";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Your Patel Networks order history with invoices and tracking.",
};

// Gated server page — the session cookie is the key; unauthenticated visitors
// are sent to sign-in with a return path so the cart and intent survive.
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

  const orders = await getOrdersForUser(session.userId);

  return (
    <div className="container-inner py-10 lg:py-14">
      <header className="mb-8">
        <p className="label-caps mb-2">Your account</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invoices, tracking and live status — everything per order, in one place.</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center shadow-whisper">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sand" aria-hidden>
            <PackageOpen className="h-6 w-6 text-sand-foreground" />
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">No orders yet.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            When you place an order it appears here with its GST invoice, courier tracking and warranty serials.
          </p>
          <Button asChild className="mt-6 h-11 min-h-[44px]">
            <Link href="/products">Browse the catalogue</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-4" aria-label="Order history">
          {orders.map((order) => {
            const status = order.status as OrderStatus;
            const hasSuccessPayment = order.payments.some((p) => p.status === "SUCCESS");
            const awaitingPayment = order.paymentMethod === "RAZORPAY" && !hasSuccessPayment && status === "PENDING_PAYMENT";
            return (
              <li key={order.id} className="rounded-xl border border-border bg-card p-5 shadow-whisper transition-shadow hover:shadow-lift">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="link-underline text-lg font-semibold tracking-tight"
                      >
                        {order.orderNumber}
                      </Link>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusPillClass(order.status)}`}>
                        {ORDER_STATUS_LABELS[status] ?? order.status}
                      </span>
                      {order.isB2B && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          B2B
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Placed {formatDate(order.createdAt)} · {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
                    </p>
                    {/* item thumbnails — text tiles (order rows carry no images) */}
                    <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Items in this order">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="max-w-[16rem] truncate rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
                        >
                          {item.productName} <span className="tabular-nums">× {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-semibold tabular-nums">{formatINR(order.totalAmount)}</span>
                    <div className="flex items-center gap-3">
                      {awaitingPayment && (
                        <PayNowButton
                          orderId={order.id}
                          orderNumber={order.orderNumber}
                          amountPaise={order.totalAmount}
                          label="Pay now"
                          variant="outline"
                          className="h-9 rounded-full px-4 text-xs"
                        />
                      )}
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-foreground md:min-h-0"
                      >
                        View details <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
