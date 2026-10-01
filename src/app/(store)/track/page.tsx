"use client";

// Track order — public lookup, no sign-in. The mobile number is the shared secret.
// Two modes (server-decided):
//   1. order number + phone → full tracking projection (privacy-preserving)
//   2. phone only           → minimal order index; pick one to drill into detail
// The detail projection is reshaped into TimelineOrder and rendered by the
// shared TrackingTimeline.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Loader2,
  PackageSearch,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrackingTimeline, type TimelineOrder } from "@/components/storefront/tracking-timeline";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

interface TrackDetail {
  mode: "detail";
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string | null;
  placedAt: string;
  estimatedDeliveryAt: string | null;
  contactPhone: string;
  items: { name: string; variant: string; quantity: number }[];
  return: { status: string; createdAt: string } | null;
  shipment: {
    courier: string | null;
    awb: string | null;
    trackingUrl: string | null;
    status: string | null;
    events: { status: string; location: string | null; occurredAt: string }[];
  } | null;
  statusHistory: { status: string; comment: string | null; at: string }[];
}

interface TrackListItem {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  placedAt: string;
  estimatedDeliveryAt: string | null;
  itemCount: number;
  returnStatus: string | null;
}

const RETURN_STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Return requested",
  APPROVED: "Return approved — ship it back",
  REJECTED: "Return request declined",
  RESTOCKED: "Return received & restocked",
  REFUNDED: "Refund completed",
};

// Single tone map shared by list chips + detail badge so a status reads the same everywhere.
const STATUS_TONE: Record<string, string> = {
  PENDING_PAYMENT: "bg-sand text-sand-foreground",
  COD_PENDING: "bg-sand text-sand-foreground",
  PAID: "bg-primary/10 text-primary",
  CONFIRMED: "bg-primary/10 text-primary",
  PROCESSING: "bg-primary/10 text-primary",
  PACKED: "bg-primary/10 text-primary",
  SHIPPED: "bg-accent/15 text-accent-foreground",
  OUT_FOR_DELIVERY: "bg-accent/15 text-accent-foreground",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
  RETURN_REQUESTED: "bg-muted text-foreground",
  RETURNED: "bg-muted text-foreground",
  REFUNDED: "bg-muted text-foreground",
};

function StatusChip({ status, className }: { status: string; className?: string }) {
  const label = ORDER_STATUS_LABELS[status as OrderStatus] ?? status.replaceAll("_", " ").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        STATUS_TONE[status] ?? "bg-muted text-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}

function ReturnChip({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-medium text-foreground">
      <RotateCcw className="h-3 w-3" aria-hidden />
      {RETURN_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function isPhoneUsable(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  // 10-digit local number, optionally prefixed with 91
  return /^\d{10}$/.test(digits) || /^91\d{10}$/.test(digits);
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<TrackDetail | null>(null);
  const [list, setList] = useState<TrackListItem[] | null>(null);
  const drillRef = useRef<HTMLInputElement>(null);

  // Deep-link support: /track?order=PN-2026-000123 prefills the order field
  // (used by the /order-success rescue page and account order links).
  useEffect(() => {
    const pre = new URLSearchParams(window.location.search).get("order");
    if (pre) setOrderNumber(pre.trim().toUpperCase());
  }, []);

  async function lookup(overrideOrderNumber?: string) {
    if (loading) return;
    const num = (overrideOrderNumber ?? orderNumber).trim().toUpperCase();
    if (!isPhoneUsable(phone)) {
      setError("Enter the 10-digit mobile number used on the order.");
      return;
    }
    setLoading(true);
    setError(null);
    setDetail(null);
    setList(null);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: num, phone }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: (TrackDetail & { mode: string }) | { mode: "list"; orders: TrackListItem[] };
      };
      if (json.ok && json.data) {
        if (json.data.mode === "list") {
          const l = json.data as { mode: "list"; orders: TrackListItem[] };
          if (l.orders.length === 0) {
            setError("No orders found for that mobile in the last 6 months. Placed the order with a different number?");
          } else {
            setList(l.orders);
          }
        } else {
          setDetail(json.data as TrackDetail);
        }
      } else {
        const friendly =
          res.status === 404
            ? "We could not find an order with that number. Double-check it — the format is PN-YYYY-NNNNNN."
            : res.status === 403
              ? "That mobile number does not match this order. Try the number the order was placed with."
              : json.error ?? "Lookup failed — try again in a moment.";
        setError(friendly);
      }
    } catch {
      setError("Network error — please retry.");
      toast({ title: "Lookup failed", description: "Network error, please retry.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function drillInto(num: string) {
    setOrderNumber(num);
    void lookup(num);
    // bring the fresh detail into view
    window.setTimeout(() => drillRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  // reshape the /api/track detail projection into the shared timeline contract
  const timelineOrder: TimelineOrder | null = detail
    ? {
        status: detail.status,
        statusHistory: detail.statusHistory.map((h) => ({ status: h.status, comment: h.comment, at: h.at })),
        estimatedDeliveryAt: detail.estimatedDeliveryAt,
        shipments: detail.shipment
          ? [
              {
                courier: detail.shipment.courier,
                awb: detail.shipment.awb,
                trackingUrl: detail.shipment.trackingUrl,
                status: detail.shipment.status,
                events: detail.shipment.events,
              },
            ]
          : [],
      }
    : null;

  return (
    <div className="container-inner pb-24 pt-12 lg:pt-16">
      <header>
        <p className="label-caps">Order tracking</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Where is my hardware?</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Track by order number and the mobile on the order — or leave the order number empty to list everything booked on that mobile.
          Signed-in customers can also track from{" "}
          <Link href="/account/orders" className="link-underline text-foreground">
            Account → Orders
          </Link>
          .
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookup();
        }}
        className="mt-8 rounded-xl border border-border bg-card p-5 shadow-whisper sm:p-7"
        aria-label="Track an order"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="tr-order" className="label-caps mb-1.5 block">
              Order number <span className="normal-case tracking-normal text-muted-foreground">· optional</span>
            </Label>
            <Input
              id="tr-order"
              ref={drillRef}
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="PN-2026-000123"
              className="h-10 font-mono"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="tr-phone" className="label-caps mb-1.5 block">Mobile on the order</Label>
            <Input
              id="tr-phone"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 12))}
              placeholder="98765 43210"
              className="h-10"
              autoComplete="tel-national"
              required
              aria-describedby={error ? "track-error" : undefined}
            />
          </div>
        </div>
        {error && (
          <p id="track-error" role="alert" className="mt-3 flex items-start gap-1.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="mt-5 h-11 min-h-[44px] w-full sm:w-auto sm:px-8">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <PackageSearch className="h-4 w-4" aria-hidden />}
          {loading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {/* list mode — minimal index for the phone, pick one to drill in */}
      {list && (
        <section aria-label="Orders on this number" className="mt-8">
          <h2 className="label-caps mb-3">Orders on {phone.replace(/\D/g, "").replace(/^91/, "").replace(/(\d{5})(\d{5})/, "$1 $2")}</h2>
          <ul className="space-y-3">
            {list.map((o) => (
              <li key={o.orderNumber} className="rounded-xl border border-border bg-card p-4 shadow-whisper">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold">{o.orderNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(o.placedAt))} · {o.itemCount} item
                      {o.itemCount === 1 ? "" : "s"}
                      {o.estimatedDeliveryAt
                        ? ` · ETA ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(o.estimatedDeliveryAt))}`
                        : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <StatusChip status={o.status} />
                      {o.returnStatus && <ReturnChip status={o.returnStatus} />}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-[44px] rounded-full px-4 text-xs"
                    onClick={() => drillInto(o.orderNumber)}
                  >
                    Track this order <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* detail mode — full projection through the shared timeline */}
      {detail && timelineOrder && (
        <section ref={drillRef} aria-label={`Tracking for ${detail.orderNumber}`} className="mt-8 scroll-mt-24 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-whisper sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="label-caps">Order</p>
                <p className="mt-1 font-mono text-xl font-semibold tracking-tight">{detail.orderNumber}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Placed {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(detail.placedAt))} ·{" "}
                  {detail.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
                  {detail.paymentStatus ? ` · payment ${detail.paymentStatus.toLowerCase()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusChip status={detail.status} className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wide" />
                {detail.return && <ReturnChip status={detail.return.status} />}
              </div>
            </div>
            {detail.estimatedDeliveryAt && (
              <p className="mt-3 text-sm text-muted-foreground">
                Estimated delivery{" "}
                <span className="font-medium text-foreground">
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "full" }).format(new Date(detail.estimatedDeliveryAt))}
                </span>
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Contact on the waybill: <span className="font-medium text-foreground">{detail.contactPhone}</span>
            </p>
          </div>

          <TrackingTimeline order={timelineOrder} />

          <section aria-label="Items on this order" className="rounded-xl border border-border bg-card p-5 shadow-whisper sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">Items ({detail.items.length})</h3>
            <ul className="mt-4 divide-y divide-border">
              {detail.items.map((item, i) => (
                <li key={`${item.name}-${i}`} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.variant}</p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-medium tabular-nums">× {item.quantity}</p>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-center text-xs text-muted-foreground">
            Wrong order?{" "}
            <button
              type="button"
              className="link-underline inline-flex min-h-[44px] items-center font-medium text-foreground md:min-h-0"
              onClick={() => {
                setDetail(null);
                setList(null);
                setError(null);
              }}
            >
              Look up another order <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden />
            </button>
          </p>
        </section>
      )}
    </div>
  );
}
