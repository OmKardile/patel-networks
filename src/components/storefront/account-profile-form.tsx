"use client";

// Account profile form (GET/PUT /api/account/profile) + sign-out
// (POST /api/auth/logout → refresh → /). The phone is the login identity and
// is never editable here.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function AccountProfileForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/profile", { cache: "no-store" });
        const json = (await res.json()) as {
          ok: boolean;
          error?: string;
          data?: { fullName: string; phone: string; companyName: string; gstin: string };
        };
        if (cancelled) return;
        if (json.ok && json.data) {
          setFullName(json.data.fullName ?? "");
          setPhone(json.data.phone ?? "");
          setCompanyName(json.data.companyName ?? "");
          setGstin(json.data.gstin ?? "");
        } else {
          setLoadError(json.error ?? "Could not load the profile.");
        }
      } catch {
        if (!cancelled) setLoadError("Network error — could not load the profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save() {
    setError(null);
    setSaved(false);
    if (fullName.trim().length < 2) {
      setError("Name needs at least 2 characters.");
      return;
    }
    const cleanGstin = gstin.trim().toUpperCase();
    if (cleanGstin && !GSTIN_RE.test(cleanGstin)) {
      setError("Enter a valid 15-character GSTIN, or leave it blank.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          companyName: companyName.trim() || undefined,
          gstin: cleanGstin || undefined,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setSaved(true);
      } else {
        setError(json.error ?? "Could not save the profile.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <span className="sr-only">Loading profile</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {loadError}
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
      className="space-y-4"
      aria-label="Profile details"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pf-name" className="label-caps">
            Full name
          </Label>
          <Input
            id="pf-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11"
            autoComplete="name"
            maxLength={80}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-phone" className="label-caps">
            Mobile (login id)
          </Label>
          <Input
            id="pf-phone"
            value={phone}
            disabled
            className="h-11 bg-muted font-mono"
            aria-describedby="pf-phone-hint"
          />
          <p id="pf-phone-hint" className="text-[11px] text-muted-foreground">
            Your number is your identity — it cannot be changed here.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-company" className="label-caps">
            Company <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
          </Label>
          <Input
            id="pf-company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="h-11"
            autoComplete="organization"
            maxLength={120}
            placeholder="Contractor / firm name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pf-gstin" className="label-caps">
            GSTIN <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
          </Label>
          <Input
            id="pf-gstin"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase().slice(0, 15))}
            className="h-11 font-mono uppercase"
            placeholder="24AAACP1234F1Z8"
            aria-describedby="pf-gstin-hint"
          />
          <p id="pf-gstin-hint" className="text-[11px] text-muted-foreground">
            Printed on the tax invoice for B2B input tax credit.
          </p>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-xs text-success">
          Profile saved — your details are up to date.
        </p>
      )}
      <Button type="submit" disabled={saving} className="h-11">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}{" "}
        Save profile
      </Button>
    </form>
  );
}

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void signOut()}
      disabled={busy}
      aria-busy={busy}
      className={className}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />} Sign
      out
    </Button>
  );
}
