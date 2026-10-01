import { cn } from "@/lib/utils";

// ProductBadge — image-area badge. Tones: discount (green), new (sand),
// low (amber), oos (muted). Positioning owned by the caller.

const TONES: Record<string, string> = {
  discount: "bg-success text-brand-foreground",
  new: "bg-sand text-sand-foreground",
  low: "bg-accent text-accent-foreground",
  oos: "bg-secondary text-secondary-foreground",
};

export function ProductBadge({
  tone = "new",
  children,
  className,
}: {
  tone?: "discount" | "new" | "low" | "oos";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
