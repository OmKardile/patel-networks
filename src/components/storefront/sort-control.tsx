"use client";

// Sort control — pushes the updated query string; page resets on sort change.
// The dropdown is the only stateful element; everything else lives in the URL.

import { useRouter } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SORT_OPTIONS = [
  { value: "popular", label: "Most popular" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
] as const;

export function SortControl({ params }: { params: Record<string, string | undefined> }) {
  const router = useRouter();
  const value = params.sort || "popular";

  function onChange(next: string) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (k === "page" || k === "sort" || !v) continue;
      sp.set(k, v);
    }
    if (next && next !== "popular") sp.set("sort", next);
    const qs = sp.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="label-caps hidden sm:block" id="sort-label">
        Sort
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-labelledby="sort-label"
          className="h-11 w-[190px] rounded-full border-border bg-card text-[13px] shadow-whisper"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <SelectValue placeholder="Sort" />
          </span>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
