"use client";

// Phone + OTP sign-in (ADR-003/ADR-011). Dual-mode SMS: in sandbox the code is
// printed to dev.log and the UI says so. Used on /account/login and inline in
// checkout (compact) so the cart context is never lost during sign-in.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MessageSquareLock, ShieldCheck, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/hooks/use-toast";
import { localPhoneFromInput } from "@/lib/phone";

type Step = "phone" | "otp" | "name";

interface OtpLoginProps {
  /** Where to navigate after a successful login (when no onSuccess is given). */
  redirectTo?: string;
  /** Called after successful login instead of navigation (used by checkout). */
  onSuccess?: () => void;
  compact?: boolean;
}

export function OTPLogin({ redirectTo, onSuccess, compact = false }: OtpLoginProps) {
  const router = useRouter();
  const refreshCart = useCartStore((s) => s.refresh);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [simulated, setSimulated] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  function startResendCooldown() {
    setResendIn(30);
  }

  async function requestOtp(isResend = false) {
    setError(null);
    if (!/^(\+91)?[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ""))) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; data?: { sent: boolean; simulated: boolean; expiresInSec: number } };
      if (json.ok && json.data?.sent) {
        setSimulated(Boolean(json.data.simulated));
        setCode("");
        setStep("otp");
        startResendCooldown();
        if (!isResend) {
          toast({ title: "Code sent", description: `A 6-digit code was sent to +91 ${phone.replace(/\D/g, "").slice(-10)}.` });
        }
      } else {
        setError(json.error ?? "Could not send the code. Try again.");
      }
    } catch {
      setError("Network error — could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; data?: { loggedIn: boolean; isNewUser: boolean; mergedCartItems: number } };
      if (json.ok && json.data?.loggedIn) {
        setIsNewUser(json.data.isNewUser);
        await refreshCart();
        if (json.data.isNewUser) {
          setStep("name");
        } else {
          finish();
        }
      } else {
        setError(json.error ?? "Verification failed.");
      }
    } catch {
      setError("Network error — could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  async function saveNameAndFinish() {
    const name = fullName.trim();
    if (name.length >= 2) {
      setBusy(true);
      try {
        await fetch("/api/account/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: name }),
        });
      } catch {
        // non-fatal — profile can be completed later from the account page
      } finally {
        setBusy(false);
      }
    }
    finish();
  }

  function finish() {
    toast({ title: "Signed in", description: "Welcome to Patel Networks." });
    if (onSuccess) {
      onSuccess();
    } else {
      router.push(redirectTo ?? "/account");
      router.refresh();
    }
  }

  return (
    <div
      className={
        compact
          ? "mx-auto w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-whisper"
          : "rounded-xl border border-border bg-card p-6 text-center shadow-whisper sm:p-8"
      }
    >
      {step === "phone" && (
        <div>
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sand" aria-hidden>
            <MessageSquareLock className="h-5 w-5 text-sand-foreground" />
          </span>
          <h2 className="font-display text-xl font-semibold tracking-tight">Sign in with your mobile</h2>
          <p className="mx-auto mt-2 mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            We send a one-time code on WhatsApp/SMS. No passwords, no spam.
          </p>

          <label htmlFor="otp-phone" className="label-caps mb-1.5 block text-left">
            Mobile number
          </label>
          <div className="flex items-center gap-2">
            <span className="flex h-10 shrink-0 items-center rounded-full border border-border bg-muted px-3.5 font-mono text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="otp-phone"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => {
                // Prefix-aware local-phone normalizer (see lib/phone.ts) — a plain
                // first-10 cap here used to turn "+91 98765 43210" into a wrong account.
                setPhone(localPhoneFromInput(e.target.value));
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void requestOtp();
              }}
              placeholder="98765 43210"
              className="h-10 rounded-full text-center"
              aria-describedby={error ? "otp-error" : undefined}
            />
          </div>
          {error && (
            <p id="otp-error" role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <Button
            type="button"
            onClick={() => void requestOtp()}
            disabled={busy || phone.length !== 10}
            className="mt-5 h-11 w-full"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Send code
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div>
          <button
            type="button"
            onClick={() => {
              setStep("phone");
              setError(null);
            }}
            className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Change number
          </button>
          <h2 className="font-display text-xl font-semibold tracking-tight">Enter the 6-digit code</h2>
          <p className="mx-auto mt-1.5 mb-4 text-sm text-muted-foreground">
            Sent to <span className="font-medium text-foreground">+91 {phone}</span>
          </p>

          {simulated && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-muted/70 px-3.5 py-3 text-left text-xs text-muted-foreground">
              <TerminalSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Sandbox mode</span> — no real SMS is sent. Read the 6-digit code from the{" "}
                <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px]">[SIMULATED SMS]</code> line in dev.log.
              </span>
            </div>
          )}

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={(v) => { setCode(v); setError(null); }}>
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button type="button" onClick={() => void verifyOtp()} disabled={busy || code.length !== 6} className="h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ShieldCheck className="h-4 w-4" aria-hidden />} Verify &amp; sign in
            </Button>
            {resendIn > 0 ? (
              <span className="text-xs text-muted-foreground">Resend code in {resendIn}s</span>
            ) : (
              <button
                type="button"
                onClick={() => void requestOtp(true)}
                disabled={busy}
                className="text-xs font-medium text-primary hover:underline"
              >
                Resend code
              </button>
            )}
          </div>
        </div>
      )}

      {step === "name" && (
        <div>
          <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-sand" aria-hidden>
            <ShieldCheck className="h-5 w-5 text-sand-foreground" />
          </span>
          <h2 className="font-display text-xl font-semibold tracking-tight">Almost there — your name</h2>
          <p className="mx-auto mt-1.5 mb-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {isNewUser ? "New here? " : ""}Tell us the name for invoices and delivery updates.
          </p>
          <label htmlFor="otp-name" className="label-caps mb-1.5 block text-left">
            Full name
          </label>
          <Input
            id="otp-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void saveNameAndFinish();
            }}
            placeholder="e.g. Rajesh Patel"
            className="h-10 rounded-full text-center"
            autoFocus
          />
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button type="button" onClick={() => void saveNameAndFinish()} disabled={busy} className="h-11">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Continue
            </Button>
            {!fullName.trim() && (
              <button
                type="button"
                onClick={() => finish()}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
