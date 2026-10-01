"use client";

// (store)/error.tsx — chromed error boundary for the storefront route group.
// Renders INSIDE the store shell (header/footer stay up), offers a real retry
// and honest messaging; the digest reference helps correlate with server logs.

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[store] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-20">
      <div className="max-w-lg text-center">
        <p className="label-caps">Something failed on our side</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          This section couldn&rsquo;t load.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          The rest of the store is still online. Try again — if it keeps failing, the trade desk is
          one WhatsApp message away.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset} className="rounded-full px-6">
            <RefreshCcw aria-hidden className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full px-6">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
