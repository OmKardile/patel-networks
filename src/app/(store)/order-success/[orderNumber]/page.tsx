import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText, Package, PackageSearch } from "lucide-react";
import { getOrderByNumber } from "@/server/services/order.service";
import { getCustomerSession, getAdminSession } from "@/lib/session";
import { formatINR } from "@/lib/money";
import { ORDER_STATUS_LABELS, STORE, type OrderStatus } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  return { title: `Order ${orderNumber} confirmed` };
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date(date));
}

export default async function OrderSuccessPage({ params }: OrderSuccessProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(decodeURIComponent(orderNumber));
  if (!order) notFound();

  const [session, admin] = await Promise.all([getCustomerSession(), getAdminSession()]);
  const isOwner = session && order.userId === session.userId;
  if (!isOwner && !admin) notFound();

  const status = order.status as OrderStatus;
  const payment = order.payments[order.payments.length - 1];
  const paymentPaid = payment?.status === "SUCCESS" || (status !== "PENDING_PAYMENT" && status !== "COD_PENDING" && status !== "CANCELLED");
  const shipment = order.shipments[0] ?? null;
  const awaitingPayment = status === "PENDING_PAYMENT" && order.paymentMethod === "RAZORPAY";
  const codPending = status === "COD_PENDING";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      {/* hero — the confirmation moment */}
      <header className="flex flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 shadow-whisper">
          {status === "CANCELLED" ? <Package className="h-8 w-8 text-muted-foreground" aria-hidden /> : <CheckCircle2 className="h-8 w-8 text-success" aria-hidden />}
        </span>
        <p className="label-caps mt-5">
          {status === "CANCELLED" ? "Order cancelled" : awaitingPayment ? "Order reserved — payment pending" : "Order confirmed"}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {status === "CANCELLED"
            ? "This order was cancelled."
            : awaitingPayment
              ? "Almost there — complete your payment."
              : codPending
                ? "COD order received."
                : "Thank you — your order is in."}
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            Order
            <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-xs font-medium text-foreground">{order.orderNumber}</span>
          </span>
          <span>
            Estimated delivery <span className="font-medium text-foreground">{formatDate(order.estimatedDeliveryAt)}</span>
          </span>
          <span>
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"} ·{" "}
            <Badge variant={paymentPaid ? "default" : status === "CANCELLED" ? "destructive" : "outline"} className="align-middle">
              {paymentPaid ? "Paid" : ORDER_STATUS_LABELS[status] ?? status}
            </Badge>
          </span>
        </div>
        {status !== "CANCELLED" && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-sand px-3.5 py-1.5 text-xs font-medium text-sand-foreground">GST invoice on every order</span>
            <span className="rounded-full bg-sand px-3.5 py-1.5 text-xs font-medium text-sand-foreground">Same-day dispatch before 4:00 PM IST</span>
            <span className="rounded-full bg-sand px-3.5 py-1.5 text-xs font-medium text-sand-foreground">7-day DOA replacement</span>
          </div>
        )}
      </header>

      {awaitingPayment && (
        <div className="mt-8 rounded-xl border border-border bg-card shadow-whisper p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium">Complete the payment to confirm dispatch.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sandbox hint — the payment gateway runs in simulation mode here. You can also pay later from Account → Orders.
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

      {CUSTOMER_CANCELLABLE.includes(status) && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 shadow-whisper">
          <p className="text-xs text-muted-foreground">Change of mind? You can cancel online while the order is still at the hub — stock is released instantly.</p>
          <CancelOrderButton orderNumber={order.orderNumber} canCancel />
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* left: timeline + items */}
        <div className="space-y-6 lg:col-span-7">
          <TrackingTimeline
            status={order.status}
            statusHistory={order.statusHistory.map((h) => ({ status: h.status, comment: h.comment, at: h.createdAt.toISOString() }))}
            estimatedDeliveryAt={order.estimatedDeliveryAt ? order.estimatedDeliveryAt.toISOString() : null}
            shipment={
              shipment
                ? {
                    courierName: shipment.courierName,
                    awb: shipment.awb,
                    trackingUrl: shipment.trackingUrl,
                    status: shipment.status,
                    events: shipment.events.map((e) => ({ status: e.status, location: e.location, occurredAt: e.occurredAt.toISOString() })),
                  }
                : null
            }
          />

          <section aria-label="Items in this order" className="rounded-xl border border-border bg-card shadow-whisper p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold tracking-tight">Items ({order.items.length})</h3>
            <ul className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.variantName} · SKU <span className="font-mono">{item.skuCode}</span> · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-medium tabular-nums">{formatINR(item.totalPrice)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* right: totals + actions */}
        <div className="space-y-6 lg:col-span-5">
          <section aria-label="Payment summary" className="rounded-xl border border-border bg-card shadow-whisper p-5 sm:p-6">
            <h3 className="font-display text-lg font-semibold tracking-tight">Payment summary</h3>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatINR(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Coupon {order.couponCode ?? ""}</span>
                  <span className="font-medium tabular-nums">− {formatINR(order.discountAmount)}</span>
                </div>
              )}
              {order.bundleDiscount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Kit bundle {order.bundleName ? `· ${order.bundleName}` : ""}</span>
                  <span className="font-medium tabular-nums">− {formatINR(order.bundleDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium tabular-nums">{order.shippingAmount === 0 ? "FREE" : formatINR(order.shippingAmount)}</span>
              </div>
              {order.codFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD fee</span>
                  <span className="font-medium tabular-nums">{formatINR(order.codFee)}</span>
                </div>
              )}
              {order.cgstAmount > 0 && (
                <>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>CGST (incl.)</span>
                    <span>{formatINR(order.cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>SGST (incl.)</span>
                    <span>{formatINR(order.sgstAmount)}</span>
                  </div>
                </>
              )}
              {order.igstAmount > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>IGST (incl.)</span>
                  <span>{formatINR(order.igstAmount)}</span>
                </div>
              )}
              <Separator className="my-3" />
              <div className="flex items-baseline justify-between">
                <span className="font-medium">Total {paymentPaid ? "paid" : "payable"}</span>
                <span className="font-display text-2xl tabular-nums">{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          <section aria-label="Delivery address" className="rounded-xl border border-border bg-card shadow-whisper p-5 sm:p-6 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-semibold tracking-tight">Delivering to</h3>
              {isOwner && (
                <EditAddressButton
                  orderNumber={order.orderNumber}
                  canEdit={CUSTOMER_CANCELLABLE.includes(status)}
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
              )}
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

          <div className="flex flex-col gap-3">
            <Button asChild className="h-11">
              <Link href="/track">
                <PackageSearch className="h-4 w-4" aria-hidden /> Track this order
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/products">
                Continue shopping <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Link href={`/account/orders/${order.orderNumber}/invoice`} className="link-underline inline-flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <FileText className="h-3.5 w-3.5" aria-hidden /> View the GST invoice
            </Link>
            <Link href={`/account/orders/${order.orderNumber}`} className="link-underline text-center text-xs text-muted-foreground">
              Track this order from your account
            </Link>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Questions? Call {STORE.supportPhone} or WhatsApp us — quote order {order.orderNumber}.
          </p>
        </div>
      </div>
    </div>
  );
}
