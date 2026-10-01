"use client";

// Notify me — back-in-stock capture for an out-of-stock SKU.
// POST /api/stock-alerts {skuId, phone}; the API answers with the exact
// customer-facing message (subscribed / already back in stock / error).

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitState =
  | { kind: "idle" }
  | { kind: "done"; message: string; alreadyInStock: boolean }
  | { kind: "error"; message: string };

export function NotifyMeInline({ skuId, className }: { skuId: string; className?: string }) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function submit() {
    const digits = phone.replace(/[\s-]/g, "");
    if (!/^(\+91)?[6-9]\d{9}$/.test(digits)) {
      setState({ kind: "error", message: "Enter a valid 10-digit Indian mobile number." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/stock-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skuId, phone: digits }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        data?: { message?: string; alreadyInStock?: boolean; subscribed?: boolean };
      };
      if (!res.ok || !json.ok) {
        setState({ kind: "error", message: json.error ?? "Could not save the request — try again in a few minutes." });
        return;
      }
      setState({
        kind: "done",
        message: json.data?.message ?? "We will message you when it is back in stock.",
        alreadyInStock: Boolean(json.data?.alreadyInStock),
      });
    } catch {
      setState({ kind: "error", message: "Network error — try again in a few minutes." });
    } finally {
      setBusy(false);
    }
  }

  if (state.kind === "done") {
    return (
      <div
        className={cn("flex items-start gap-2.5 rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground", className)}
        role="status"
      >
        <BellRing aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{state.message}</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-muted/40 px-4 py-3.5", className)}>
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground/90">
        <BellRing aria-hidden className="h-4 w-4 text-primary" />
        Out of stock — get notified when it returns
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          aria-label="WhatsApp number for the stock alert"
          placeholder="WhatsApp number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-invalid={state.kind === "error"}
          className="h-11 w-full max-w-56 rounded-full border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-primary/60"
        />
        <Button type="button" variant="outline" onClick={submit} disabled={busy} className="min-h-[44px]">
          {busy ? "Saving…" : "Notify me"}
        </Button>
      </div>
      {state.kind === "error" ? (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {state.message}
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] text-muted-foreground">One WhatsApp message when the SKU lands back in stock — no marketing.</p>
      )}
    </div>
  );
}
