import type { Metadata } from "next";
import Link from "next/link";
import { Columns3, ShieldCheck, Star, Truck } from "lucide-react";
import { getProductsForCompare, getPriceAndRating } from "@/server/services/catalog.service";
import { mapProductCard } from "@/lib/serializers";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "@/components/storefront/breadcrumb";

export const metadata: Metadata = {
  title: "Compare Products — Side-by-side specs",
  description:
    "Compare up to 4 CCTV cameras, DVRs, NVRs and networking products side by side — price, warranty, COD availability and full specifications.",
};

interface PageProps {
  searchParams: Promise<{ ids?: string }>;
}

const MAX_COMPARE = 4;

function parseSpecs(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
        .map(([k, v]) => [k, String(v)]),
    );
  } catch {
    return {};
  }
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { ids: idsParam } = await searchParams;
  const ids = [...new Set((idsParam ?? "").split(",").map((s) => s.trim()).filter(Boolean))].slice(0, MAX_COMPARE);

  const rawProducts = ids.length ? await getProductsForCompare(ids) : [];
  const ratingEnrich = await getPriceAndRating(rawProducts.map((p) => p.id));
  const products = rawProducts.map((p) => ({
    card: mapProductCard(p, 0, ratingEnrich.ratings.get(p.id)),
    specs: parseSpecs(p.specifications),
  }));

  /* ---------- empty state (0 or 1 products is not a comparison) ---------- */
  if (products.length < 2) {
    return (
      <div className="container-inner py-12 md:py-16">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Compare" }]} className="mb-8" />
        <div className="mx-auto flex max-w-md flex-col items-center rounded-lg border border-border bg-card px-6 py-16 text-center shadow-whisper">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sand">
            <Columns3 className="h-6 w-6 text-sand-foreground" aria-hidden />
          </span>
          <p className="label-caps mt-6">Side-by-side</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            {products.length === 1 ? "One product is not a comparison" : "Add products to compare"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {products.length === 1
              ? "You are comparing one product — add at least one more from any product card to see the differences."
              : "Browse the catalog and tap the compare chip on any product card. You can line up to 4 products side by side — specs, prices, warranty and more."}
          </p>
          {products.length === 1 ? (
            <p className="mt-4 text-[13px] text-muted-foreground">
              Currently comparing: <span className="font-medium text-foreground">{products[0].card.name}</span>
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex min-h-[44px] items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse products
            </Link>
            <Link
              href="/kit-builder"
              className="inline-flex min-h-[44px] items-center rounded-full border px-6 text-sm font-medium transition-colors hover:bg-secondary"
            >
              Build a kit
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- shared spec keys in first-seen order ---------- */
  const specKeys: string[] = [];
  const seen = new Set<string>();
  for (const p of products) {
    for (const key of Object.keys(p.specs)) {
      if (!seen.has(key)) {
        seen.add(key);
        specKeys.push(key);
      }
    }
  }

  const minPricePaise = Math.min(...products.map((p) => p.card.priceFromPaise));
  const maxWarranty = Math.max(...products.map((p) => p.card.warrantyMonths));

  const cellBase = "border-l border-border px-4 py-3.5 align-top text-[13px] leading-relaxed";
  const rowHeadBase =
    "sticky left-0 z-10 bg-card px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sticky-col-shadow";

  const factRows: { label: string; render: (i: number) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (i) => {
        const p = products[i].card;
        const isBest = products.length > 1 && p.priceFromPaise === minPricePaise;
        return (
          <span className={isBest ? "font-semibold text-foreground" : undefined}>
            {formatINR(p.priceFromPaise)}
            {isBest ? <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-success">lowest</span> : null}
          </span>
        );
      },
    },
    {
      label: "Availability",
      render: (i) => {
        const p = products[i].card;
        return p.inStock ? (
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
            In stock{p.availableStock > 0 ? ` (${p.availableStock})` : ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" aria-hidden />
            Out of stock
          </span>
        );
      },
    },
    {
      label: "Rating",
      render: (i) => {
        const p = products[i].card;
        return p.ratingCount > 0 && p.ratingAvg !== null ? (
          <span className="inline-flex items-center gap-1">
            <Star aria-hidden className="h-3.5 w-3.5 fill-star text-star" />
            {p.ratingAvg.toFixed(1)} · {p.ratingCount} review{p.ratingCount === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-muted-foreground">No reviews yet</span>
        );
      },
    },
    {
      label: "Warranty",
      render: (i) => {
        const p = products[i].card;
        const isBest = products.length > 1 && p.warrantyMonths === maxWarranty && p.warrantyMonths > 0;
        return (
          <span className={isBest ? "font-medium text-foreground" : undefined}>
            {p.warrantyMonths > 0 ? `${p.warrantyMonths} months` : "—"}
          </span>
        );
      },
    },
    {
      label: "Cash on delivery",
      render: (i) => {
        const allowed = products[i].card.isCodAllowed;
        return allowed ? (
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-muted-foreground" aria-hidden /> Allowed
          </span>
        ) : (
          <span className="text-muted-foreground">Prepaid only</span>
        );
      },
    },
    {
      label: "Model number",
      render: (i) => products[i].card.modelNumber ?? <span className="text-muted-foreground">—</span>,
    },
  ];

  return (
    <div className="container-inner py-12 md:py-16">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Compare" }]} className="mb-8" />

      <header className="max-w-2xl">
        <p className="label-caps">Side-by-side</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Compare products
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Comparing {products.length} products. Specification rows only appear when at least one product documents
          them.
        </p>
      </header>

      <p className="mt-3 text-xs text-muted-foreground sm:hidden">Swipe sideways to see all products →</p>

      {/* the sheet */}
      <div className="mt-8 overflow-x-auto rounded-lg border border-border bg-card shadow-whisper [&_tbody>tr]:transition-colors [&_tbody>tr:hover]:bg-muted/30">
        <table className="w-full min-w-[560px] border-collapse text-left sm:min-w-[720px]">
          <caption className="sr-only">Product comparison table</caption>
          <colgroup>
            <col className="w-32 sm:w-44" />
            {products.map((p) => (
              <col key={p.card.id} className="w-44 sm:w-56" />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={rowHeadBase}>
                {products.length} of {MAX_COMPARE}
              </th>
              {products.map((p) => (
                <th key={p.card.id} scope="col" className="border-l border-border px-4 py-5 align-top">
                  <div className="relative aspect-square w-20 overflow-hidden rounded-lg border border-border/60 bg-muted sm:w-24">
                    {p.card.images[0]?.url ? (
                      <img src={p.card.images[0].url} alt={p.card.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">No image</div>
                    )}
                  </div>
                  <p className="mt-3 text-[13px] font-semibold leading-snug">
                    <Link href={`/products/${p.card.slug}`} className="hover:underline">
                      {p.card.name}
                    </Link>
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground">
                    <span className="label-caps !text-[10px]">{p.card.brand.name}</span>
                    <span>
                      <ShieldCheck className="mb-0.5 inline h-3 w-3" aria-hidden /> {p.card.warrantyMonths}mo
                    </span>
                  </p>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {factRows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-b-0">
                <th scope="row" className={rowHeadBase}>
                  {row.label}
                </th>
                {products.map((p, i) => (
                  <td key={p.card.id} className={cellBase}>
                    {row.render(i)}
                  </td>
                ))}
              </tr>
            ))}

            {specKeys.length > 0 && (
              <tr aria-hidden className="bg-muted/40">
                <th scope="col" className={cn(rowHeadBase, "bg-muted/40")}>
                  Specifications
                </th>
                {products.map((p) => (
                  <td key={p.card.id} className={cn(cellBase, "bg-muted/40")} />
                ))}
              </tr>
            )}
            {specKeys.map((key) => (
              <tr key={key} className="border-b border-border last:border-b-0">
                <th scope="row" className={rowHeadBase}>
                  {key}
                </th>
                {products.map((p) => (
                  <td key={p.card.id} className={cellBase}>
                    {p.specs[key] ?? <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
