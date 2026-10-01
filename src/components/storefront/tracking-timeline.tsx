"use client";

// TrackingTimeline — vertical delivery timeline driven by the order's real
// statusHistory (label + comment + timestamp), with the current status
// emphasized, plus the shipment card (courier, AWB, tracking link, scan
// events) when a shipment exists. Presentational: shared by order-success,
// the account order detail and the public /track lookup.

import { Check, Copy, PackageCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";

export interface TimelineStatusEvent {
  status: string;
  comment?: string | null;
  at: string;
}

export interface TimelineShipment {
  courier?: string | null;
  awb?: string | null;
  trackingUrl?: string | null;
  status?: string | null;
  events: { status: string; location?: string | null; occurredAt: string }[];
}

export interface TimelineOrder {
  status: string;
  statusHistory: TimelineStatusEvent[];
  estimatedDeliveryAt?: string | null;
  shipments?: TimelineShipment[] | null;
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status.replaceAll("_", " ").toLowerCase();
}

export function TrackingTimeline({ order }: { order: TimelineOrder }) {
  const [copied, setCopied] = useState(false);
  const history = order.statusHistory ?? [];
  const current = history[history.length - 1] ?? null;
  const isCancelled = order.status === "CANCELLED";
  const shipment = order.shipments?.[0] ?? null;
  const awaitingPayment = order.status === "PENDING_PAYMENT" || order.status === "COD_PENDING";

  async function copyAwb(awb: string) {
    try {
      await navigator.clipboard.writeText(awb);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore silently
    }
  }

  return (
    <section aria-label="Delivery progress" className="rounded-xl border border-border bg-card p-5 shadow-whisper sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className="text-lg font-semibold tracking-tight">Delivery progress</h3>
        {/* current status chip */}
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
            isCancelled
              ? "bg-destructive/10 text-destructive"
              : order.status === "DELIVERED"
                ? "bg-success/10 text-success"
                : "bg-sand text-sand-foreground",
          )}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      {order.estimatedDeliveryAt && !isCancelled && (
        <p className="-mt-3 mb-4 text-xs text-muted-foreground">
          Estimated delivery{" "}
          <span className="font-medium text-foreground">
            {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(order.estimatedDeliveryAt))}
          </span>
        </p>
      )}

      {isCancelled && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          This order was cancelled. Reserved stock has been released and any captured payment is refunded to source.
        </div>
      )}

      {/* vertical timeline — one entry per real status change */}
      {history.length > 0 ? (
        <ol className="relative" role="list">
          {history.map((event, i) => {
            const isCurrent = i === history.length - 1;
            return (
              <li key={`${event.status}-${event.at}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                {i < history.length - 1 && (
                  <span
                    aria-hidden
                    className={cn("absolute left-[15px] top-8 h-[calc(100%-1.75rem)] w-px", isCancelled ? "bg-border" : "bg-success/40")}
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    isCancelled
                      ? "border-destructive/40 bg-destructive/5 text-destructive"
                      : isCurrent
                        ? "border-success bg-success text-background"
                        : "border-success/40 bg-background text-success",
                  )}
                >
                  <Check className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    {/* current status emphasized */}
                    <p className={cn("text-sm", isCurrent ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                      {statusLabel(event.status)}
                      {isCurrent && !isCancelled && (
                        <span className="ml-2 rounded-full bg-sand px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-sand-foreground">
                          Current
                        </span>
                      )}
                    </p>
                    <time className="text-xs tabular-nums text-muted-foreground">{formatDateTime(event.at)}</time>
                  </div>
                  {event.comment && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{event.comment}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">Status updates will appear here as the order moves through the hub.</p>
      )}

      {awaitingPayment && !isCancelled && (
        <p className="mt-2 text-sm text-muted-foreground">
          {order.status === "PENDING_PAYMENT"
            ? "Awaiting payment confirmation — the order is confirmed automatically once the payment is captured."
            : "Cash on Delivery order placed — our team verifies the order before dispatch."}
        </p>
      )}

      {/* shipment card — courier, AWB, tracking link + scan events */}
      {shipment && shipment.awb && (
        <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-background" aria-hidden>
                <Truck className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-sm font-medium">{shipment.courier ?? "Courier partner"}</p>
                <p className="text-xs text-muted-foreground">
                  AWB <span className="font-mono text-foreground">{shipment.awb}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" className="h-8 rounded-full" onClick={() => void copyAwb(shipment.awb!)}>
                <Copy className="h-3.5 w-3.5" aria-hidden /> {copied ? "Copied" : "Copy AWB"}
              </Button>
              {shipment.trackingUrl && (
                <a
                  href={shipment.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center rounded-full border border-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted md:min-h-0"
                >
                  Track on courier site
                </a>
              )}
            </div>
          </div>
          {shipment.events.length > 0 && (
            <div className="thin-scrollbar mt-3 max-h-48 overflow-y-auto rounded-md border border-border bg-card">
              <ul className="divide-y divide-border/70">
                {[...shipment.events].reverse().map((ev, i) => (
                  <li key={`${ev.status}-${ev.occurredAt}-${i}`} className="flex items-start justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{statusLabel(ev.status)}</p>
                      {ev.location && <p className="text-xs text-muted-foreground">{ev.location}</p>}
                    </div>
                    <time className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{formatDateTime(ev.occurredAt)}</time>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shipment.status === "DELIVERED" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <PackageCheck className="h-3.5 w-3.5 text-success" aria-hidden /> Shipment delivered. Serial-tracked warranty is now active.
            </p>
          )}
        </div>
      )}

      {!isCancelled && order.status === "DELIVERED" && (
        <p className="mt-4 inline-flex rounded-full bg-success/10 px-3.5 py-1.5 text-xs font-medium text-success">
          Delivered — thank you for building with Patel Networks
        </p>
      )}
    </section>
  );
}
