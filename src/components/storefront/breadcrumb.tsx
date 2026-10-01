import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Breadcrumb — Home / … / current, last item aria-current.

export function Breadcrumb({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {last || !item.href ? (
                <span aria-current={last ? "page" : undefined} className={cn(last && "font-medium text-foreground")}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-foreground hover:underline">
                  {item.label}
                </Link>
              )}
              {!last ? <ChevronRight aria-hidden className="h-3 w-3" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
