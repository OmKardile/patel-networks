import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Rating — star + average + optional count, reference restraint.
// size/color are additive: "md"/"star" (theme) is the original look, card
// surfaces pass size="sm" color="amber" for the fixed reference styling.

const STAR_SIZES = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
} as const;

const STAR_COLORS = {
  star: "fill-star text-star",
  amber: "fill-amber-400 text-amber-400",
} as const;

export function Rating({
  avg,
  count,
  className,
  size = "md",
  color = "star",
}: {
  avg: number | null;
  count?: number;
  className?: string;
  size?: keyof typeof STAR_SIZES;
  color?: keyof typeof STAR_COLORS;
}) {
  if (avg == null && !count) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Star aria-hidden className={cn(STAR_SIZES[size], STAR_COLORS[color])} />
      <span className="font-medium">{avg != null ? avg.toFixed(1) : "New"}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="text-muted-foreground">({count})</span>
      ) : null}
    </span>
  );
}
