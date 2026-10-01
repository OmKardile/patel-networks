"use client";

// ADR-006 kit builder — 5-step wizard: Recorder → Cameras (bounded by the
// recorder's channel count) → Storage (retention estimate) → Power & Cable
// (connector follows the recorder technology) → Summary. Compatibility is
// enforced in state; the bundle discount is estimated live with the same rule
// the cart server applies (recorder + camera qualification, bundle-member SKUs
// only). Adding navigates to /cart — the drawer is never opened here.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Info, Loader2, Minus, Plus, TriangleAlert } from "lucide-react";
import { AddToCartButton } from "@/components/storefront/add-to-cart";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface KitVariant {
  skuId: string;
  skuCode: string;
  name: string;
  pricePaise: number;
  mrpPaise: number;
  availableStock: number;
  inStock: boolean;
  attributes: Record<string, string>;
}

export interface KitProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  imageUrl: string | null;
  variants: KitVariant[];
}

export interface KitData {
  slots: {
    recorder: KitProduct[];
    camera: KitProduct[];
    hdd: KitProduct[];
    power: KitProduct[];
    cable: KitProduct[];
    connector: KitProduct[];
  };
  discountPct: number;
  bundleName: string;
  /** SKUs that belong to the bundle — only these lines are discounted, exactly
   *  as the cart server computes it. */
  bundleSkuIds: string[];
}

type RecorderType = "DVR" | "NVR";

const STEP_LABELS = ["Recorder", "Cameras", "Storage", "Power & Cable", "Summary"];

/** Retention estimate (2MP assumption, continuous recording):
 * a 2MP stream writes ≈ 0.5 GB/hour → 12 GB/day per camera.
 * days ≈ (TB × 1000 GB) / (12 GB/day × cameraQty) */
function retentionDays(tb: number, cameras: number): number {
  if (cameras <= 0 || tb <= 0) return 0;
  return Math.round((tb * 1000) / (12 * cameras));
}

function parseChannels(value: string | undefined): number {
  if (!value) return 0;
  const n = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseStorageTB(value: string | undefined): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function firstVariant(p: KitProduct): KitVariant | null {
  return p.variants[0] ?? null;
}

/** Shared card chrome for every selectable option in the wizard. */
function optionCard(selected: boolean, enabled: boolean): string {
  return cn(
    "rounded-lg border bg-card text-left shadow-whisper transition-colors duration-200",
    selected
      ? "border-primary ring-1 ring-primary"
      : enabled
        ? "border-border hover:border-foreground/30"
        : "cursor-not-allowed border-border bg-muted/50 opacity-60"
  );
}

interface KitLineItem {
  skuId: string;
  skuCode: string;
  name: string;
  slot: string;
  qty: number;
  pricePaise: number;
  lineTotalPaise: number;
}

export function KitBuilderWizard({ data }: { data: KitData }) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.add);

  const [step, setStep] = useState(1);
  const [recorderSkuId, setRecorderSkuId] = useState<string | null>(null);
  const [camQty, setCamQty] = useState<Record<string, number>>({});
  const [hddSkuId, setHddSkuId] = useState<string | null>(null);
  const [cableSkuId, setCableSkuId] = useState<string | null>(null);
  const [connectorOn, setConnectorOn] = useState(true);
  const [powerOn, setPowerOn] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const recorderVariants = useMemo(() => data.slots.recorder.flatMap((p) => p.variants), [data.slots.recorder]);
  const cameraVariants = useMemo(() => data.slots.camera.flatMap((p) => p.variants), [data.slots.camera]);
  const hddVariants = useMemo(() => data.slots.hdd.flatMap((p) => p.variants), [data.slots.hdd]);
  const cableVariants = useMemo(() => data.slots.cable.flatMap((p) => p.variants), [data.slots.cable]);
  const powerProducts = data.slots.power;

  const recorder = recorderVariants.find((v) => v.skuId === recorderSkuId) ?? null;
  const recType: RecorderType | null = recorder
    ? (recorder.attributes.Type ?? "").toUpperCase().includes("NVR")
      ? "NVR"
      : "DVR"
    : null;
  const channels = parseChannels(recorder?.attributes.Channels);

  const totalCameras = Object.values(camQty).reduce((n, q) => n + q, 0);
  const camerasGate = Boolean(recorder) && channels > 0;

  // connector slot follows the recorder technology: BNC + DC for DVR (coax), RJ45 for NVR (Cat6)
  const connectorVariants = useMemo(() => data.slots.connector.flatMap((p) => p.variants), [data.slots.connector]);
  const wantedConnectorKey = recType === "NVR" ? "RJ45" : "BNC";
  const connectorSkuId = useMemo(() => {
    const match =
      connectorVariants.find((v) => (v.skuCode + " " + v.name).toUpperCase().includes(wantedConnectorKey)) ??
      connectorVariants.find((v) => v.inStock) ??
      connectorVariants[0] ??
      null;
    return match?.skuId ?? null;
  }, [connectorVariants, wantedConnectorKey]);

  const hdd = hddVariants.find((v) => v.skuId === hddSkuId) ?? null;
  const retention = retentionDays(parseStorageTB(hdd?.attributes.Storage), totalCameras);

  const bundleSku = new Set(data.bundleSkuIds);

  const lines: KitLineItem[] = useMemo(() => {
    const out: KitLineItem[] = [];
    if (recorder) {
      out.push({ skuId: recorder.skuId, skuCode: recorder.skuCode, name: recorder.name, slot: "Recorder", qty: 1, pricePaise: recorder.pricePaise, lineTotalPaise: recorder.pricePaise });
    }
    for (const v of cameraVariants) {
      const qty = camQty[v.skuId] ?? 0;
      if (qty > 0) out.push({ skuId: v.skuId, skuCode: v.skuCode, name: v.name, slot: "Camera", qty, pricePaise: v.pricePaise, lineTotalPaise: v.pricePaise * qty });
    }
    if (hdd) out.push({ skuId: hdd.skuId, skuCode: hdd.skuCode, name: hdd.name, slot: "Storage", qty: 1, pricePaise: hdd.pricePaise, lineTotalPaise: hdd.pricePaise });
    const cable = cableVariants.find((v) => v.skuId === cableSkuId) ?? null;
    if (cable) out.push({ skuId: cable.skuId, skuCode: cable.skuCode, name: cable.name, slot: "Cable", qty: 1, pricePaise: cable.pricePaise, lineTotalPaise: cable.pricePaise });
    if (connectorOn && connectorSkuId) {
      const v = connectorVariants.find((x) => x.skuId === connectorSkuId);
      if (v) out.push({ skuId: v.skuId, skuCode: v.skuCode, name: v.name, slot: "Connectors", qty: 1, pricePaise: v.pricePaise, lineTotalPaise: v.pricePaise });
    }
    if (powerOn) {
      for (const p of powerProducts) {
        const v = firstVariant(p);
        if (v && v.inStock) out.push({ skuId: v.skuId, skuCode: v.skuCode, name: `${p.name} — ${v.name}`, slot: "Power", qty: 1, pricePaise: v.pricePaise, lineTotalPaise: v.pricePaise });
        break; // one power product per kit (single PoE switch option in stock)
      }
    }
    return out;
  }, [recorder, cameraVariants, camQty, hdd, cableVariants, cableSkuId, connectorOn, connectorSkuId, connectorVariants, powerOn, powerProducts]);

  const subtotalPaise = lines.reduce((n, l) => n + l.lineTotalPaise, 0);
  // Same server rule: recorder + camera qualify the bundle; only bundle-member SKUs are discounted.
  const bundleQualified =
    lines.some((l) => l.slot === "Recorder" && bundleSku.has(l.skuId)) &&
    lines.some((l) => l.slot === "Camera" && bundleSku.has(l.skuId));
  const discountPaise = bundleQualified
    ? Math.floor(lines.filter((l) => bundleSku.has(l.skuId)).reduce((n, l) => n + l.lineTotalPaise, 0) * (data.discountPct / 100))
    : 0;
  const estimatedTotalPaise = Math.max(subtotalPaise - discountPaise, 0);

  function setCameraQty(skuId: string, qty: number) {
    setCamQty((prev) => {
      const others = Object.entries(prev).reduce((n, [k, q]) => (k === skuId ? n : n + q), 0);
      const clamped = Math.max(0, Math.min(qty, channels - others));
      return { ...prev, [skuId]: clamped };
    });
  }

  function togglePower() {
    setPowerOn((v) => {
      const next = !v;
      if (next) {
        const available = powerProducts.find((p) => firstVariant(p)?.inStock) ?? null;
        if (!available) {
          setAddError("The PoE switch is out of stock — continue without it.");
          return false;
        }
        setAddError(null);
      }
      return next;
    });
  }

  async function addKitToCart() {
    if (!lines.length || adding) return;
    setAdding(true);
    setAddError(null);
    let failed = "";
    for (const line of lines) {
      for (let i = 0; i < line.qty; i += 1) {
        const res = await addToCart(line.skuId, 1);
        if (!res.ok) {
          failed = `${line.name}: ${res.error ?? "add failed"}`;
          break;
        }
      }
      if (failed) break;
    }
    setAdding(false);
    if (failed) {
      setAddError(`Kit could not be completed — ${failed}`);
      return;
    }
    router.push("/cart");
  }

  const stepsReady: boolean[] = [
    Boolean(recorder),
    camerasGate && totalCameras > 0,
    Boolean(hdd),
    Boolean(cableSkuId),
    lines.length > 0,
  ];

  return (
    <div>
      {/* stepper */}
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" aria-label="Kit builder steps">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const active = step === n;
          const done = n < step && stepsReady[i];
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => setStep(n)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-[44px] w-full items-center gap-2.5 rounded-full border px-4 py-2 text-left text-[13px] font-medium transition-colors duration-200",
                  active ? "border-primary bg-card text-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums",
                    active ? "bg-primary text-primary-foreground" : done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : String(n).padStart(2, "0")}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-lg border border-border bg-card p-5 shadow-whisper sm:p-7">
        {/* ---------------- step 1 · recorder ---------------- */}
        {step === 1 && (
          <section aria-labelledby="ks-recorder">
            <h2 id="ks-recorder" className="font-display text-xl font-semibold tracking-tight">
              Pick the recorder
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              The recorder sets the channel budget and the camera technology — HD analog over coax (DVR) or IP over
              Cat6 (NVR).
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {data.slots.recorder.map((p) => {
                const v = firstVariant(p);
                if (!v) return null;
                const selected = v.skuId === recorderSkuId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setRecorderSkuId(v.skuId);
                      setCamQty({});
                      setPowerOn(false);
                    }}
                    className={optionCard(selected, v.inStock)}
                    disabled={!v.inStock}
                    aria-pressed={selected}
                  >
                    <span className="block p-4">
                      <span className="label-caps">{p.brandName}</span>
                      <span className="mt-1 block text-[14px] font-semibold leading-snug">{p.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{v.name}</span>
                      <span className="mt-2 block text-[13px] font-semibold tabular-nums">{formatINR(v.pricePaise)}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {v.inStock ? `${v.availableStock} in stock` : "Out of stock"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------- step 2 · cameras ---------------- */}
        {step === 2 && (
          <section aria-labelledby="ks-cameras">
            <h2 id="ks-cameras" className="font-display text-xl font-semibold tracking-tight">
              Size the cameras to the channels
            </h2>
            {camerasGate ? (
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {recorder?.name} offers <strong className="font-semibold text-foreground">{channels} channels</strong> —
                quantities below are clamped to the budget. Selected so far: {totalCameras}.
              </p>
            ) : (
              <p className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground" role="status">
                <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden /> Choose a recorder first — the channel count
                defines the camera budget.
              </p>
            )}
            <div className={cn("mt-5 grid gap-3 sm:grid-cols-2", !camerasGate && "pointer-events-none opacity-50")}>
              {cameraVariants.map((v) => {
                const qty = camQty[v.skuId] ?? 0;
                return (
                  <div key={v.skuId} className={optionCard(qty > 0, v.inStock)}>
                    <div className="p-4">
                      <p className="label-caps">{v.attributes.Resolution ?? ""}</p>
                      <p className="mt-1 text-[14px] font-semibold leading-snug">{v.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {v.inStock ? `${formatINR(v.pricePaise)} · ${v.availableStock} in stock` : `Out of stock · ${formatINR(v.pricePaise)}`}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCameraQty(v.skuId, qty - 1)}
                          disabled={qty === 0 || !v.inStock}
                          aria-label={`Remove one ${v.name}`}
                          className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-background disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" aria-hidden />
                        </button>
                        <span className="w-10 text-center font-display text-base font-semibold tabular-nums" aria-live="polite">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCameraQty(v.skuId, qty + 1)}
                          disabled={!v.inStock || totalCameras >= channels}
                          aria-label={`Add one ${v.name}`}
                          className="press grid h-11 w-11 place-items-center rounded-full border border-border bg-background disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------------- step 3 · storage ---------------- */}
        {step === 3 && (
          <section aria-labelledby="ks-storage">
            <h2 id="ks-storage" className="font-display text-xl font-semibold tracking-tight">
              Storage and retention
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Surveillance-rated drives only — desktop drives are not built for 24/7 write loads.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {hddVariants.map((v) => {
                const selected = v.skuId === hddSkuId;
                return (
                  <button
                    key={v.skuId}
                    type="button"
                    onClick={() => setHddSkuId(v.skuId)}
                    className={optionCard(selected, v.inStock)}
                    disabled={!v.inStock}
                    aria-pressed={selected}
                  >
                    <span className="block p-4">
                      <span className="label-caps">{v.attributes.Storage ?? ""}</span>
                      <span className="mt-1 block text-[14px] font-semibold leading-snug">{v.name}</span>
                      <span className="mt-2 block text-[13px] font-semibold tabular-nums">{formatINR(v.pricePaise)}</span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {v.inStock ? `${v.availableStock} in stock` : "Out of stock"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {hdd && (
              <p className="mt-5 flex items-start gap-2 rounded-md border border-border bg-muted/60 px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Estimated continuous recording for {totalCameras || 0} camera{totalCameras === 1 ? "" : "s"} on{" "}
                  {parseStorageTB(hdd.attributes.Storage) || 0}TB:{" "}
                  <strong className="font-semibold text-foreground">
                    {retention > 0 ? `about ${retention} days` : "add cameras to estimate"}
                  </strong>{" "}
                  (2MP bitrate assumption — heavier cameras record for less).
                </span>
              </p>
            )}
          </section>
        )}

        {/* ---------------- step 4 · power & cable ---------------- */}
        {step === 4 && (
          <section aria-labelledby="ks-cable">
            <h2 id="ks-cable" className="font-display text-xl font-semibold tracking-tight">
              Power &amp; cable
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {recType === "NVR"
                ? "NVR kits run one Cat6 cable per camera — power and video ride together on PoE."
                : recType === "DVR"
                  ? "DVR kits run 3+1 coax — video plus DC power over the same jacket, terminated with BNC connectors."
                  : "Choose a recorder first to see the matching cabling."}
            </p>

            <div className={cn("mt-5 grid gap-3 sm:grid-cols-3", !recorder && "pointer-events-none opacity-50")}>
              {cableVariants.map((v) => {
                const isCat6 = (v.attributes.Category ?? "").toUpperCase().includes("CAT6");
                const recommended = (recType === "NVR" && isCat6) || (recType === "DVR" && !isCat6);
                const selected = v.skuId === cableSkuId;
                return (
                  <button
                    key={v.skuId}
                    type="button"
                    onClick={() => setCableSkuId(v.skuId)}
                    className={cn(optionCard(selected, v.inStock), "relative")}
                    disabled={!v.inStock}
                    aria-pressed={selected}
                  >
                    {recommended ? (
                      <span className="absolute right-2 top-2 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-success">
                        fits {recType}
                      </span>
                    ) : null}
                    <span className="block p-4">
                      <span className="label-caps">{v.attributes.Length ?? v.attributes.Category ?? ""}</span>
                      <span className="mt-1 block text-[14px] font-semibold leading-snug">{v.name}</span>
                      <span className="mt-2 block text-[13px] font-semibold tabular-nums">{formatINR(v.pricePaise)}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              <label className="flex min-h-[44px] items-center justify-between gap-4 rounded-lg border border-border bg-background/60 px-4 py-3">
                <span className="text-sm">
                  <span className="font-medium text-foreground">
                    {recType === "NVR" ? "RJ45" : "BNC + DC"} connector kit
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Terminations for every cable run — selected automatically for the {recType ?? "chosen"} technology.
                  </span>
                </span>
                <input type="checkbox" checked={connectorOn} onChange={(e) => setConnectorOn(e.target.checked)} className="h-4 w-4 shrink-0 accent-[var(--primary)]" />
              </label>

              {powerProducts.length > 0 && (
                <label className="flex min-h-[44px] items-center justify-between gap-4 rounded-lg border border-border bg-background/60 px-4 py-3">
                  <span className="text-sm">
                    <span className="font-medium text-foreground">PoE switch (network power)</span>
                    <span className="block text-xs text-muted-foreground">
                      {powerProducts[0].name} — needed when cameras are powered over the network rather than the NVR.
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    checked={powerOn}
                    onChange={() => togglePower()}
                    disabled={recType !== "NVR"}
                    className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                  />
                </label>
              )}
            </div>
          </section>
        )}

        {/* ---------------- step 5 · summary ---------------- */}
        {step === 5 && (
          <section aria-labelledby="ks-summary">
            <h2 id="ks-summary" className="font-display text-xl font-semibold tracking-tight">
              The kit, priced as one
            </h2>
            {lines.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground" role="status">
                Nothing selected yet — walk back through the steps to build the kit.
              </p>
            ) : (
              <>
                <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
                  {lines.map((l) => (
                    <li key={`${l.skuId}-${l.slot}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                      <div className="min-w-0">
                        <p className="label-caps">{l.slot}</p>
                        <p className="mt-0.5 text-[14px] font-medium leading-snug">{l.name}</p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {l.qty} × {formatINR(l.pricePaise)} · {l.skuCode}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-[14px] font-semibold tabular-nums">{formatINR(l.lineTotalPaise)}</p>
                        <AddToCartButton skuId={l.skuId} label="Add line" openAfter={false} size="sm" variant="outline" className="min-h-[44px]" />
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium tabular-nums">{formatINR(subtotalPaise)}</dd>
                  </div>
                  {bundleQualified && discountPaise > 0 ? (
                    <div className="flex items-center justify-between text-success">
                      <dt>
                        {data.bundleName} bundle · {data.discountPct}% off
                      </dt>
                      <dd className="font-semibold tabular-nums">−{formatINR(discountPaise)}</dd>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <dt>
                        {data.bundleName} bundle · {data.discountPct}%
                      </dt>
                      <dd>applies in cart with a bundle recorder + camera</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <dt className="font-display text-base font-semibold">Estimated total</dt>
                    <dd className="font-display text-lg font-semibold tabular-nums">{formatINR(estimatedTotalPaise)}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  GST-inclusive prices. The cart re-checks the bundle rule server-side and adds each line as its own
                  invoice line.
                </p>
              </>
            )}

            {addError && (
              <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-[13px] text-destructive">
                {addError}
              </p>
            )}

            <Button
              type="button"
              onClick={() => void addKitToCart()}
              disabled={lines.length === 0 || adding}
              aria-busy={adding}
              className="mt-5 h-11 w-full sm:w-auto"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null} Add kit to cart &amp; view cart
            </Button>
          </section>
        )}

        {/* nav */}
        <div className="mt-7 flex items-center justify-between border-t border-border pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="min-h-[44px]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={() => setStep((s) => Math.min(5, s + 1))} className="min-h-[44px]">
              Next <ChevronRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Step 5 of 5</span>
          )}
        </div>
      </div>
    </div>
  );
}
