"use client";

// Coupon box — shared between /cart and /checkout.
// The applied coupon lives in sessionStorage under COUPON_STORAGE_KEY ("pn_coupon",
// frozen contract) so the checkout step can pick it up without another round-trip,
// and re-validates silently whenever the subtotal moves (qty edits, bundle changes…).
// Server is the only calculator: POST /api/coupon/validate → CouponEvaluation.

import { useEffect, useState } from "react";
import { BadgePercent, Check, Loader2, TicketX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/lib/money";
import { toast } from "@/hooks/use-toast";

export const COUPON_STORAGE_KEY = "pn_coupon";

export interface AppliedCoupon {
  code: string;
  discountPaise: number;
  validatedAtSubtotalPaise: number;
}

export function readAppliedCoupon(): AppliedCoupon | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppliedCoupon;
    if (!parsed?.code || typeof parsed.discountPaise !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAppliedCoupon(coupon: AppliedCoupon): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
}

export function clearAppliedCoupon(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
}

interface CartCouponBoxProps {
  subtotalPaise: number;
  applied: AppliedCoupon | null;
  onChange: (coupon: AppliedCoupon | null) => void;
}

export function CartCouponBox({ subtotalPaise, applied, onChange }: CartCouponBoxProps) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revalidating, setRevalidating] = useState(false);

  // Silent re-validation whenever the subtotal changes (e.g. qty edit on the cart page).
  // An invalid coupon is dropped rather than silently honoured — the order API re-checks anyway.
  useEffect(() => {
    if (!applied) return;
    if (applied.validatedAtSubtotalPaise === subtotalPaise) return;
    let cancelled = false;
    void (async () => {
      setRevalidating(true);
      try {
        const res = await fetch("/api/coupon/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: applied.code, subtotalPaise }),
        });
        const json = (await res.json()) as {
          ok: boolean;
          error?: string;
          data?: { valid: boolean; reason?: string; discountPaise: number };
        };
        if (cancelled) return;
        if (json.ok && json.data?.valid) {
          const next: AppliedCoupon = {
            code: applied.code,
            discountPaise: json.data.discountPaise,
            validatedAtSubtotalPaise: subtotalPaise,
          };
          writeAppliedCoupon(next);
          onChange(next);
        } else {
          clearAppliedCoupon();
          onChange(null);
          toast({
            title: "Coupon removed",
            description: json.ok ? json.data?.reason ?? "It no longer applies to this cart." : json.error ?? "It no longer applies to this cart.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setRevalidating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applied, subtotalPaise, onChange]);

  async function apply() {
    const trimmed = code.trim();
    if (!trimmed || checking) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotalPaise }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { valid: boolean; reason?: string; discountPaise: number; coupon?: { code: string } };
      };
      if (json.ok && json.data?.valid) {
        const next: AppliedCoupon = {
          code: json.data.coupon?.code ?? trimmed.toUpperCase(),
          discountPaise: json.data.discountPaise,
          validatedAtSubtotalPaise: subtotalPaise,
        };
        writeAppliedCoupon(next);
        onChange(next);
        setCode("");
        toast({
          title: `Coupon ${next.code} applied`,
          description: `You save ${formatINR(next.discountPaise)} on this order.`,
        });
      } else {
        const reason = json.ok
          ? json.data?.reason ?? "Coupon cannot be applied"
          : json.error ?? "Could not validate coupon";
        setError(reason);
        toast({ title: "Coupon not applied", description: reason, variant: "destructive" });
      }
    } catch {
      setError("Something went wrong. Try again.");
      toast({ title: "Coupon not applied", description: "Network error — try again.", variant: "destructive" });
    } finally {
      setChecking(false);
    }
  }

  function remove() {
    clearAppliedCoupon();
    onChange(null);
    setError(null);
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-full border border-primary/25 bg-sand/60 py-2 pl-3 pr-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15" aria-hidden>
            <Check className="h-3.5 w-3.5 text-success" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-wide">
              {applied.code}
              {revalidating && (
                <Loader2 className="ml-2 inline h-3 w-3 animate-spin text-muted-foreground" aria-label="Re-checking coupon" />
              )}
            </p>
            <p className="text-[11px] text-sand-foreground/80">Coupon discount − {formatINR(applied.discountPaise)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          aria-label={`Remove coupon ${applied.code}`}
          className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sand-foreground/70 transition-colors hover:bg-card hover:text-foreground"
        >
          <TicketX className="h-4 w-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="coupon-code" className="label-caps mb-2 flex items-center gap-1.5">
        <BadgePercent className="h-3 w-3" aria-hidden /> Have a coupon?
      </label>
      <div className="flex items-center gap-2 rounded-full border border-input bg-card py-1 pl-4 pr-1 transition-colors focus-within:border-primary/50">
        <Input
          id="coupon-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void apply();
            }
          }}
          placeholder="e.g. WELCOME5"
          className="h-8 border-0 bg-transparent px-0 uppercase shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
          autoComplete="off"
          aria-describedby={error ? "coupon-error" : undefined}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => void apply()}
          disabled={checking || !code.trim()}
          className="h-8 shrink-0 rounded-full px-4 text-xs"
        >
          {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : "Apply"}
        </Button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
