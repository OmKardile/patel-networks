"use client";

// Product review form — POSTs {productId, rating, title?, comment} to
// /api/reviews. Approval happens in the admin console, so success renders the
// "submitted, pending approval" state. Guests get the sign-in prompt (the API
// enforces the session too).

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const pathname = usePathname();

  if (done) {
    return (
      <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-[13px] text-muted-foreground" role="status">
        Thank you — your review has been submitted and will appear once it is approved by our team.
      </p>
    );
  }

  if (needsLogin) {
    return (
      <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-[13px] text-muted-foreground">
        <Link href={`/account/login?next=${encodeURIComponent(pathname)}`} className="font-medium text-foreground underline underline-offset-2">
          Sign in
        </Link>{" "}
        with your mobile number to write a review.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setDone(true);
        return;
      }
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      setError(json.error ?? "Could not submit the review — try again.");
    } catch {
      setError("Network error — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-whisper">
      <p className="text-sm font-semibold">Write a review</p>

      <div role="radiogroup" aria-label="Rating" className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === rating}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-muted"
          >
            <Star aria-hidden className={cn("h-5 w-5", n <= rating ? "fill-star text-star" : "text-border")} />
          </button>
        ))}
      </div>

      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline (optional)" maxLength={120} className="rounded-full" />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How did the hardware perform on site?"
        rows={4}
        maxLength={2000}
        required
        minLength={5}
        aria-label="Review"
        className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60"
      />

      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} className="px-6">
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
