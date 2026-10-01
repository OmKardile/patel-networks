import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText, Package } from "lucide-react";
import { getOrderByNumber } from "@/server/services/order.service";
import { getCustomerSession, getAdminSession } from "@/lib/session";
import { formatINR } from "@/lib/money";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { TrackingTimeline } from "@/components/storefront/tracking-timeline";
import { PayNowButton } from "@/components/storefront/checkout-pay-now-button";
import { CancelOrderButton, EditAddressButton } from "@/components/storefront/order-actions";

/** Statuses the customer may self-cancel — mirrors order.service (pre-pack only). */
const CUSTOMER_CANCELLABLE: OrderStatus[] = ["PENDING_PAYMENT", "COD_PENDING", "PAID", "CONFIRMED", "PROCESSING"];

interface OrderSuccessProps {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: OrderSuccessProps): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${decodeURIComponent(orderNumber)} confirmed`, robots: { index: false, follow: true } };
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date(date));
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));
  if (!order) notFound();

  // Confirmation carries order data — owner or back-office only.
  const [session, admin] = await Promise.all([getCustomerSession(), getAdminSession()]);
  const isOwner = session && order.userId === session.userId;
  if (!isOwner && !admin) notFound();

  const status = order.status as OrderStatus;
  const payment = order.payments[order.payments.length - 1];
  const paymentPaid = payment?.status === "SUCCESS" || (status !== "PENDING_PAYMENT" && status !== "COD_PENDING" && status !== "CANCELLED");
  const shipment = order.shipments[0] ?? null;
  const awaitingPayment = status === "PENDING_PAYMENT" && order.paymentMethod === "RAZORPAY";
  const codPending = status === "COD_PENDING";

  // self-service eligibility (mirrors order.service rules)
  const canCancel = CUSTOMER_CANCELLABLE.includes(status);
  const canEditAddress = CUSTOMER_CANCELLABLE.includes(status);
  const openReturn = order.returns.find((r) => r.status === "REQUESTED" || r.status === "APPROVED") ?? null;

  return (
    <div className="container-inner py-10 lg:py-14">
      {/* hero — the confirmation moment */}
      <header className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 shadow-whisper">
          {status === "CANCELLED" ? (
            <Package className="h-8 w-8 text-muted-foreground" aria-hidden />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden />
          )}
        </span>
        <p className="label-caps mt-5">
          {status === "CANCELLED" ? "Order cancelled" : awaitingPayment ? "Order reserved — payment pending" : "Order confirmed"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {status === "CANCELLED"
            ? "This order was cancelled."
            : awaitingPayment
              ? "Almost there — complete your payment."
              : codPending
                ? "COD order received."
                : "Thank you — your order is in."}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs font-medium text-foreground">{order.orderNumber}</span>
          {" · "}Estimated delivery <span className="font-medium text-foreground">{formatDate(order.estimatedDeliveryAt)}</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}</span>
          <span
            className={`font-semibold ${
              paymentPaid ? "text-success" : status === "CANCELLED" ? "text-destructive" : "text-accent"
            }`}
          >
            {paymentPaid ? "Paid" : ORDER_STATUS_LABELS[status] ?? status}
          </span>
        </div>
      </header>

      {awaitingPayment && (
        <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-border bg-card shadow-whisper">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <p className="font-medium">Complete the payment to confirm dispatch.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Stock is reserved but the order is not confirmed until the payment is captured. You can also pay later from Account → Orders.
              </p>
            </div>
            <PayNowButton
              orderId={order.id}
              orderNumber={order.orderNumber}
              amountPaise={order.totalAmount}
              label={`Pay ${formatINR(order.totalAmount)} now`}
            />
          </div>
        </div>
      )}

      {openReturn && (
        <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-border bg-card p-5 shadow-whisper" role="status">
          <p className="label-caps mb-1 text-success">Return request {openReturn.status === "REQUESTED" ? "received" : "approved"}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Our trade desk reviews return requests within one working day. Keep the unit boxed with its accessories until pickup is scheduled.
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-10">
        {/* left: timeline + items */}
        <div className="space-y-6 lg:col-span-7">
          <TrackingTimeline
            order={{
              status: order.status,
              statusHistory: order.statusHistory.map((h) => ({ status: h.status, comment: h.comment, at: h.createdAt.toISOString() })),
              estimatedDeliveryAt: order.estimatedDeliveryAt ? order.estimatedDeliveryAt.toISOString() : null,
              shipments: shipment
                ? [
                    {
                      courier: shipment.courierName,
                      awb: shipment.awb,
                      trackingUrl: shipment.trackingUrl,
                      status: shipment.status,
                      events: shipment.events.map((e) => ({ status: e.status, location: e.location, occurredAt: e.occurredAt.toISOString() })),
                    },
                  ]
                : [],
            }}
          />

          <section aria-label="Items" className="rounded-xl border border-border bg-card p-5 shadow-whisper sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">Items ({order.items.length})</h3>
            <ul className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{item.productName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.variantName} · SKU <span className="font-mono">{item.skuCode}</span>
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-medium tabular-nums">
                      {item.quantity} × {formatINR(item.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* right: address + totals + actions */}
        <div className="space-y-6 lg:col-span-5">
          <section aria-label="Delivery address" className="rounded-xl border border-border bg-card p-5 text-sm shadow-whisper sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Delivery address</h3>
              <EditAddressButton
                orderNumber={order.orderNumber}
                canEdit={canEditAddress}
                initial={{
                  recipientName: order.deliveryName,
                  phone: order.deliveryPhone,
                  addressLine1: order.deliveryLine1,
                  addressLine2: order.deliveryLine2 ?? "",
                  landmark: order.deliveryLandmark ?? "",
                  city: order.deliveryCity,
                  state: order.deliveryState,
                  pincode: order.deliveryPincode,
                }}
              />
            </div>
            <address className="mt-3 not-italic leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{order.deliveryName}</span>
              <br />
              {order.deliveryLine1}
              {order.deliveryLine2 ? <>, {order.deliveryLine2}</> : null}
              {order.deliveryLandmark ? <>, {order.deliveryLandmark}</> : null}
              <br />
              {order.deliveryCity}, {order.deliveryState} — {order.deliveryPincode}
              <br />
              +91 {order.deliveryPhone.replace(/\D/g, "").slice(-10)}
            </address>
          </section>

          <section aria-label="Order total" className="rounded-xl border border-border bg-card p-5 shadow-whisper sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">Order total</h3>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex items-baseline justify-between text-success">
                  <span>Coupon {order.couponCode}</span>
                  <span className="font-medium tabular-nums">− {formatINR(order.discountAmount)}</span>
                </div>
              )}
              {order.bundleDiscount > 0 && (
                <div className="flex items-baseline justify-between text-success">
                  <span>Kit bundle {order.bundleName ? `· ${order.bundleName}` : ""}</span>
                  <span className="font-medium tabular-nums">− {formatINR(order.bundleDiscount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium tabular-nums">{order.shippingAmount === 0 ? "FREE" : formatINR(order.shippingAmount)}</span>
              </div>
              {order.codFee > 0 && (
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground">COD fee</span>
                  <span className="font-medium tabular-nums">{formatINR(order.codFee)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-semibold tabular-nums">{formatINR(order.totalAmount)}</span>
              </div>
              <p className="text-right text-[11px] text-muted-foreground">incl. {formatINR(order.gstAmount)} GST</p>
            </div>
          </section>

          {/* actions + next steps */}
          <div className="flex flex-col gap-3">
            {canCancel && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-whisper">
                <p className="text-xs text-muted-foreground">Change of mind? Cancel online while the order is still at the hub — stock is released instantly.</p>
                <CancelOrderButton orderNumber={order.orderNumber} canCancel />
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-11 min-h-[44px] flex-1 px-6">
                <Link href="/products">
                  Continue shopping <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 min-h-[44px] flex-1 px-6">
                <Link href="/account/orders">View all orders</Link>
              </Button>
            </div>
            <Button asChild variant="ghost" className="min-h-[44px] text-muted-foreground">
              <Link href={`/account/orders/${order.orderNumber}`}>
                <FileText className="h-4 w-4" aria-hidden /> Order details &amp; invoice
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
