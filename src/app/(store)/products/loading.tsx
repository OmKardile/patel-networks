import { Skeleton } from "@/components/ui/skeleton";

// PLP skeleton — same shell as the catalog page: heading, toolbar row,
// filter aside (desktop) and a grid of 4:5 card skeletons.

export default function ProductsLoading() {
  return (
    <div className="container-inner py-10 md:py-14">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-5 h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-24" />

      <div className="mt-8 flex items-center justify-between border-y border-border py-3.5">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-11 w-[190px] rounded-full" />
      </div>

      <div className="mt-8 flex gap-10">
        <div className="hidden w-60 shrink-0 space-y-4 lg:block" aria-hidden>
          {["w-24", "w-32", "w-28", "w-20", "w-24"].map((w, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className={`h-3 ${w}`} />
              <Skeleton className="h-11 w-full rounded-full" />
              <Skeleton className="h-11 w-5/6 rounded-full" />
              <Skeleton className="h-11 w-4/6 rounded-full" />
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                <Skeleton className="mt-3 h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-2 h-3 w-24" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
