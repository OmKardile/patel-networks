import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// EmptyState — clear message + supporting copy + recovery actions slot.

export function EmptyState({
  icon: Icon,
  title,
  body,
  children,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-16 text-center", className)}>
      {Icon ? (
        <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary">
          <Icon aria-hidden className="h-6 w-6 text-muted-foreground" />
        </span>
      ) : null}
      <h2 className="mt-4 text-lg font-semibold tracking-tight">{title}</h2>
      {body ? (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{body}</p>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
