"use client";

// CompareTray — floating bottom tray for the compare selection (localStorage
// via useCompareStore). Hidden on /compare, /checkout, /order-success and
// /account — the flows that own the full screen. The pill needs ≥2 picks and
// deep-links /compare?ids=…

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/store/compare-store";

const HIDDEN_PREFIXES = ["/compare", "/checkout", "/order-success", "/account"];

export function CompareTray() {
  const pathname = usePathname();
  const items = useCompareStore((s) => s.items);
  const hydrated = useCompareStore((s) => s.hydrated);
  const clear = useCompareStore((s) => s.clear);
  const remove = useCompareStore((s) => s.remove);

  if (!hydrated || items.length === 0) return null;
  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return null;

  const canCompare = items.length >= 2;

  return (
    <aside
      aria-label="Compare selection"
      className="fixed bottom-4 left-1/2 z-40 w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-lift">
        <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-secondary py-1 pl-1 pr-1.5"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-full bg-secondary object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid h-6 w-6 place-items-center rounded-full bg-border text-[10px] font-semibold text-muted-foreground"
                >
                  {item.brandName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-28 truncate text-xs font-medium">{item.name}</span>
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`Remove ${item.name} from compare`}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 text-muted-foreground"
          onClick={() => clear()}
        >
          Clear
        </Button>
        {canCompare ? (
          <Button asChild size="sm" className="h-9 shrink-0">
            <Link href={`/compare?ids=${items.map((item) => item.id).join(",")}`}>
              Compare {items.length}
            </Link>
          </Button>
        ) : (
          <Button size="sm" className="h-9 shrink-0" disabled title="Pick one more product to compare">
            Compare {items.length}
          </Button>
        )}
      </div>
    </aside>
  );
}
