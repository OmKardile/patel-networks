"use client";

// Delivery & COD availability checker — GET /api/shipping/pincode?pin= with a
// localStorage cache of the last pin (silently re-checked on mount). The zone
// answer is real logistics config: zone label, ETA window, COD serviceability.

import { useCallback, useEffect, useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PincodeResult {
  pin: string;
  zone: string;
  label: string;
  etaDays: string;
  codAvailable: boolean;
  express: boolean;
  estimatedDelivery: string;
}

const PIN_STORAGE_KEY = "pn_last_pin";
const PIN_PATTERN = /^[1-9][0-9]{5}$/;

function formatEtaDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export function PincodeChecker() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<PincodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const check = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!PIN_PATTERN.test(trimmed)) {
      setError("Enter a valid 6-digit Indian PIN code.");
      setResult(null);
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/shipping/pincode?pin=${encodeURIComponent(trimmed)}`);
      const json = (await res.json()) as { ok: boolean; data?: PincodeResult; error?: string };
      if (json.ok && json.data) {
        setResult(json.data);
        setError(null);
        try {
          localStorage.setItem(PIN_STORAGE_KEY, trimmed);
        } catch {
          /* storage unavailable — non-fatal */
        }
      } else {
        setResult(null);
        setError(json.error ?? "Could not check serviceability. Try again.");
      }
    } catch {
      setResult(null);
      setError("Network error — could not check serviceability.");
    } finally {
      setChecking(false);
    }
  }, []);

  // Prefill the last pin used and re-check it quietly
  useEffect(() => {
    let cached: string | null = null;
    try {
      cached = localStorage.getItem(PIN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (cached && PIN_PATTERN.test(cached)) {
      setPin(cached);
      void check(cached);
    }
  }, [check]);

  return (
    <section aria-label="Delivery availability check" className="rounded-xl border border-border bg-card p-4 shadow-whisper">
      <p className="label-caps flex items-center gap-1.5">
        <Truck aria-hidden className="h-3.5 w-3.5" />
        Delivery &amp; COD
      </p>

      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void check(pin);
        }}
      >
        <Input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit PIN"
          inputMode="numeric"
          autoComplete="postal-code"
          aria-label="PIN code"
          aria-invalid={Boolean(error)}
          className="h-11 max-w-[180px] rounded-full bg-background text-[13px] tabular-nums"
        />
        <Button type="submit" variant="outline" size="sm" disabled={checking} className="min-h-[44px] px-5 text-xs">
          {checking ? "Checking…" : "Check"}
        </Button>
      </form>

      {error ? (
        <p role="alert" className="mt-2.5 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}

      {result && !error ? (
        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-[13px]" aria-live="polite">
          <p className="flex items-center gap-1.5 font-medium">
            <MapPin aria-hidden className="h-3.5 w-3.5 text-muted-foreground" />
            {result.label}
          </p>
          <p className="text-muted-foreground">
            Delivery in {result.etaDays}
            {formatEtaDate(result.estimatedDelivery) ? <> by {formatEtaDate(result.estimatedDelivery)}</> : null}.
          </p>
          <p className="flex flex-wrap gap-1.5">
            <span className={result.codAvailable ? "rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success" : "rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground"}>
              {result.codAvailable ? "Cash on Delivery available" : "Prepaid only in this zone"}
            </span>
            {result.express ? (
              <span className="rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold text-sand-foreground">Express corridor</span>
            ) : null}
          </p>
        </div>
      ) : null}
    </section>
  );
}
