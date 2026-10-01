import { cn } from "@/lib/utils";
import { discountPercent } from "@/lib/money";
import { Price } from "./price";

// Price — reference anatomy: bold selling price, struck MRP, % off chip.

export function PriceRow({
  pricePaise,
  mrpPaise,
  size = "base",
  className,
}: {
  pricePaise: number;
  mrpPaise?: number | null;
  size?: "sm" | "base" | "lg";
  className?: string;
}) {
  const pct = mrpPaise && mrpPaise > pricePaise ? discountPercent(pricePaise, mrpPaise) : null;
  const main =
    size === "lg" ? "text-lg" : size === "sm" ? "text-sm" : "text-[15px]";
  return (
    <span className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <Price paise={pricePaise} className={cn(main, "font-semibold tracking-tight")} />
      {mrpPaise && mrpPaise > pricePaise ? (
        <Price
          paise={mrpPaise}
          strike
          className="text-xs font-normal text-muted-foreground"
        />
      ) : null}
      {pct ? (
        <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-success">
          {pct}% off
        </span>
      ) : null}
    </span>
  );
}
