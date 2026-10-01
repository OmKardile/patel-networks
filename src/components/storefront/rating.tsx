import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Rating — star + average + optional count, reference restraint.

export function Rating({
  avg,
  count,
  className,
}: {
  avg: number | null;
  count?: number;
  className?: string;
}) {
  if (avg == null && !count) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Star aria-hidden className="h-3.5 w-3.5 fill-star text-star" />
      <span className="font-medium">{avg != null ? avg.toFixed(1) : "New"}</span>
      {typeof count === "number" && count > 0 ? (
        <span className="text-muted-foreground">({count})</span>
      ) : null}
    </span>
  );
}
