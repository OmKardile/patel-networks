"use client";

// Address book — GET/POST /api/account/addresses, PATCH {isDefault} and
// DELETE /api/account/addresses/[id]. Server enforces the max of 10; the UI
// mirrors it. Validation mirrors addressSchema (lib/validators) client-side so
// honest errors appear before the round-trip.

import { useEffect, useState } from "react";
import { Loader2, MapPin, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localPhoneFromInput } from "@/lib/phone";
import { isValidPincode } from "@/lib/pincodes";
import { cn } from "@/lib/utils";

export interface SavedAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: string; // HOME | WORK | WAREHOUSE
}

const ADDRESS_TYPES = ["HOME", "WORK", "WAREHOUSE"] as const;
type AddressType = (typeof ADDRESS_TYPES)[number];

const MAX_ADDRESSES = 10;

const emptyForm = {
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  type: "HOME" as AddressType,
  isDefault: false,
};

function typeLabel(type: string): string {
  return type === "WORK" ? "Work" : type === "WAREHOUSE" ? "Warehouse" : "Home";
}

export function AccountAddressBook() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/account/addresses", { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; error?: string; data?: { addresses: SavedAddress[] } };
        if (cancelled) return;
        if (json.ok && json.data) {
          setAddresses(json.data.addresses);
          setShowForm(json.data.addresses.length === 0);
        } else {
          setLoadError(json.error ?? "Could not load your addresses.");
        }
      } catch {
        if (!cancelled) setLoadError("Network error — could not load your addresses.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  function validate(): string | null {
    if (form.recipientName.trim().length < 2) return "Enter the recipient's full name.";
    if (!/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/[\s-]/g, ""))) return "Enter a valid 10-digit Indian mobile number.";
    if (form.addressLine1.trim().length < 5) return "Enter the house / street address (address line 1).";
    if (form.city.trim().length < 2) return "Enter the city.";
    if (form.state.trim().length < 2) return "Enter the state.";
    if (!isValidPincode(form.pincode)) return "Enter a valid 6-digit Indian PIN code.";
    return null;
  }

  async function addAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: form.recipientName.trim(),
          phone: form.phone,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2.trim() || undefined,
          landmark: form.landmark.trim() || undefined,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode,
          type: form.type,
          isDefault: form.isDefault,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; data?: { address: SavedAddress } };
      if (json.ok && json.data) {
        setAddresses((list) => [json.data!.address, ...list.map((a) => (json.data!.address.isDefault ? { ...a, isDefault: false } : a))]);
        setForm({ ...emptyForm });
        setShowForm(false);
      } else {
        setError(json.error ?? "Could not save the address.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setSaving(false);
    }
  }

  async function makeDefault(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setAddresses((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));
      } else {
        setError(json.error ?? "Could not set the default address.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function removeAddress(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setAddresses((list) => list.filter((a) => a.id !== id));
      } else {
        setError(json.error ?? "Could not remove the address.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
        <span className="sr-only">Loading addresses</span>
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
    <div className="space-y-6">
      <ul className="space-y-3" aria-label="Saved addresses">
        {addresses.map((a) => (
          <li
            key={a.id}
            className={cn(
              "rounded-lg border bg-card p-4 sm:p-5",
              a.isDefault ? "border-primary/50" : "border-border"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand" aria-hidden>
                  <MapPin className="h-4 w-4 text-sand-foreground" />
                </span>
                <div className="min-w-0 text-sm leading-relaxed">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {a.recipientName}
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {typeLabel(a.type)}
                    </span>
                    {a.isDefault ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-success">
                        <Star className="h-3 w-3" aria-hidden /> Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {a.addressLine1}
                    {a.addressLine2 ? `, ${a.addressLine2}` : ""}
                    {a.landmark ? ` · ${a.landmark}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {a.city}, {a.state} — {a.pincode} · {a.phone}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!a.isDefault ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-[44px] rounded-full px-3"
                    onClick={() => void makeDefault(a.id)}
                    disabled={busyId !== null}
                    aria-busy={busyId === a.id}
                  >
                    {busyId === a.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Star className="h-4 w-4" aria-hidden />}
                    Set default
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] rounded-full px-3 text-muted-foreground hover:text-destructive"
                  onClick={() => void removeAddress(a.id)}
                  disabled={busyId !== null}
                  aria-busy={busyId === a.id}
                  aria-label={`Remove address for ${a.recipientName}`}
                >
                  {busyId === a.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
        {addresses.length === 0 ? (
          <li className="rounded-lg border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No saved addresses yet — add one below and checkout will prefill it.
          </li>
        ) : null}
      </ul>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}

      {!showForm ? (
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => setShowForm(true)}
          disabled={addresses.length >= MAX_ADDRESSES}
        >
          <Plus className="h-4 w-4" aria-hidden /> Add an address
        </Button>
      ) : (
        <form onSubmit={addAddress} className="rounded-lg border border-border bg-card p-5 sm:p-6" aria-label="Add an address" noValidate>
          <h3 className="font-display text-lg font-semibold tracking-tight">New address</h3>
          {addresses.length >= MAX_ADDRESSES ? (
            <p className="mt-2 text-[13px] text-destructive">
              The address book is full (max {MAX_ADDRESSES}) — remove one before adding another.
            </p>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ad-name">Recipient name</Label>
              <Input
                id="ad-name"
                value={form.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                className="h-11"
                autoComplete="name"
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-phone">Phone</Label>
              <Input
                id="ad-phone"
                value={form.phone}
                onChange={(e) => set("phone", localPhoneFromInput(e.target.value))}
                className="h-11"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="98765 43210"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ad-line1">Address line 1</Label>
              <Input
                id="ad-line1"
                value={form.addressLine1}
                onChange={(e) => set("addressLine1", e.target.value)}
                className="h-11"
                autoComplete="address-line1"
                maxLength={160}
                placeholder="House / shop no., street"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ad-line2">
                Address line 2 <span className="text-muted-foreground/70">(optional)</span>
              </Label>
              <Input
                id="ad-line2"
                value={form.addressLine2}
                onChange={(e) => set("addressLine2", e.target.value)}
                className="h-11"
                autoComplete="address-line2"
                maxLength={160}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ad-landmark">
                Landmark <span className="text-muted-foreground/70">(optional)</span>
              </Label>
              <Input
                id="ad-landmark"
                value={form.landmark}
                onChange={(e) => set("landmark", e.target.value)}
                className="h-11"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-city">City</Label>
              <Input
                id="ad-city"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="h-11"
                autoComplete="address-level2"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-state">State</Label>
              <Input
                id="ad-state"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                className="h-11"
                autoComplete="address-level1"
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-pincode">PIN code</Label>
              <Input
                id="ad-pincode"
                value={form.pincode}
                onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-11"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="395003"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ad-type">Type</Label>
              <select
                id="ad-type"
                value={form.type}
                onChange={(e) => set("type", e.target.value as AddressType)}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {ADDRESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="mt-4 flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => set("isDefault", e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Make this the default delivery address
          </label>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="submit" className="h-11" disabled={saving} aria-busy={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Save address
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm({ ...emptyForm });
                setError(null);
              }}
              className="inline-flex min-h-[44px] items-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
