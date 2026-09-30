import type { Metadata } from "next";
import { db } from "@/lib/db";
import { KitBuilderWizard, type KitData, type KitProduct, type KitVariant } from "@/components/storefront/kit-builder-wizard";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "CCTV Kit Builder — 5-step surveillance bundle",
  description:
    "Pick a recorder, cameras bounded by channels, surveillance storage, cabling and connectors. Automatic 5% bundle discount, GST-inclusive.",
  robots: { index: true, follow: true },
};

type ProductWithVariants = {
  id: string;
  slug: string;
  name: string;
  brand: { name: string } | null;
  variants: {
    skuId: string;
    name: string;
    attributes: string;
    sku: {
      code: string;
      mrp: number;
      sellingPrice: number;
      inventory: { currentStock: number; reservedStock: number } | null;
    };
  }[];
};

function toKitProduct(p: ProductWithVariants): KitProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brandName: p.brand?.name ?? "",
    variants: p.variants.map((v): KitVariant => {
      let attributes: Record<string, string> = {};
      try {
        const parsed: unknown = JSON.parse(v.attributes);
        if (parsed && typeof parsed === "object") {
          attributes = Object.fromEntries(Object.entries(parsed as Record<string, unknown>).map(([k, val]) => [k, String(val)]));
        }
      } catch {
        attributes = {};
      }
      const available = v.sku.inventory ? Math.max(v.sku.inventory.currentStock - v.sku.inventory.reservedStock, 0) : 0;
      return {
        skuId: v.skuId,
        skuCode: v.sku.code,
        name: v.name,
        pricePaise: v.sku.sellingPrice,
        mrpPaise: v.sku.mrp,
        availableStock: available,
        inStock: available > 0,
        attributes,
      };
    }),
  };
}

async function loadCategoryProducts(slugs: string[]): Promise<ProductWithVariants[]> {
  const rows = await db.category.findMany({
    where: { slug: { in: slugs }, isActive: true },
    select: {
      products: {
        where: { isActive: true, deletedAt: null },
        select: {
          id: true,
          slug: true,
          name: true,
          brand: { select: { name: true } },
          variants: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" as const },
            select: {
              skuId: true,
              name: true,
              attributes: true,
              sku: {
                select: {
                  code: true,
                  mrp: true,
                  sellingPrice: true,
                  inventory: { select: { currentStock: true, reservedStock: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  return rows.flatMap((c) => c.products as ProductWithVariants[]);
}

async function loadConnectorVariant(slug: string): Promise<KitVariant | null> {
  const found = await db.product.findFirst({
    where: { slug, isActive: true, deletedAt: null },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: { select: { name: true } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" as const },
        select: {
          skuId: true,
          name: true,
          attributes: true,
          sku: {
            select: {
              code: true,
              mrp: true,
              sellingPrice: true,
              inventory: { select: { currentStock: true, reservedStock: true } },
            },
          },
        },
      },
    },
  });
  if (!found) return null;
  const mapped = toKitProduct(found as ProductWithVariants);
  return mapped.variants[0] ?? null;
}

const STEPS_PREVIEW = [
  { n: "01", label: "Recorder", note: "DVR or NVR, sized in channels" },
  { n: "02", label: "Cameras", note: "Capped by the channel count" },
  { n: "03", label: "Storage", note: "Surveillance drive + retention" },
  { n: "04", label: "Power & cable", note: "Coax or Cat6, connectors" },
  { n: "05", label: "Summary", note: "One add-to-cart for the kit" },
];

export default async function KitBuilderPage() {
  const [recorders, analogCameras, ipCameras, hdds, coaxCables, ethernetCables, bundle, bncConnector, rj45Connector] =
    await Promise.all([
      loadCategoryProducts(["dvr-nvr-recorders"]),
      loadCategoryProducts(["hd-analog-cameras"]),
      loadCategoryProducts(["ip-network-cameras"]),
      loadCategoryProducts(["surveillance-storage"]),
      loadCategoryProducts(["cctv-coaxial-cable"]),
      loadCategoryProducts(["ethernet-cable"]),
      db.bundle.findUnique({ where: { slug: "custom-cctv-kit" }, select: { discountPct: true } }),
      loadConnectorVariant("axpial-bnc-dc-connector-pack"),
      loadConnectorVariant("mtc-rj45-cat6-keystone-kit"),
    ]);

  const data: KitData = {
    recorders: recorders.map(toKitProduct),
    analogCameras: analogCameras.map(toKitProduct),
    ipCameras: ipCameras.map(toKitProduct),
    hdds: hdds.map(toKitProduct),
    coaxCables: coaxCables.map(toKitProduct),
    ethernetCables: ethernetCables.map(toKitProduct),
    bncConnector,
    rj45Connector,
    discountPct: bundle?.discountPct ?? 5,
  };

  return (
    <div className="pb-20">
      {/* Hero — ivory radial behind the copy, Neeman's opener */}
      <section className="bg-hero-ivory">
        <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8 lg:pb-12 lg:pt-20">
          <div className="max-w-3xl">
            <p className="label-caps">Kit builder</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              A surveillance kit that fits together, priced as one
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              Five steps, in the order a site actually gets wired: the recorder sets the channel budget, cameras
              are sized to it, then storage, cabling and termination. Every compatible piece lands in the cart as
              its own invoice line — with an automatic {data.discountPct}% bundle discount on the lot.
            </p>
          </div>

          <Reveal delay={80}>
            <ol className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="The five steps">
              {STEPS_PREVIEW.map((s) => (
                <li
                  key={s.n}
                  className="rounded-xl border border-border bg-card p-4 shadow-whisper"
                >
                  <p className="font-display text-[13px] font-semibold tabular-nums text-primary">{s.n}</p>
                  <p className="mt-1.5 text-[14px] font-semibold leading-snug">{s.label}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.note}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Wizard */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
        <KitBuilderWizard data={data} />
      </section>
    </div>
  );
}
