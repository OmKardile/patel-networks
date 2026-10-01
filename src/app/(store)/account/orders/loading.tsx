// Route-level skeleton for /account/orders — keeps the page rhythm while the
// gated order list streams in.

import { Skeleton } from "@/components/ui/skeleton";

export default function AccountOrdersLoading() {
  return (
    <div className="container-inner py-10 lg:py-14">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-9 w-48" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
