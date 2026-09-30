"use client";

// Product review form — POSTs to /api/reviews; approvals happen in the admin
// console. Guests get a sign-in prompt (the API enforces the session too).

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ReviewForm({ productId, loggedIn }: { productId: string; loggedIn: boolean }) {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  if (!loggedIn) {
    return (
      <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-[13px] text-muted-foreground">
        <a href="/account/login?next=/" className="font-medium text-foreground underline underline-offset-2">
          Sign in
        </a>{" "}
        with your mobile number to write a review.
      </p>
    );
  }

  if (done) {
    return (
      <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-[13px] text-muted-foreground" role="status">
        Thank you — your review was submitted and will appear once approved by our team.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (json.ok) {
        setDone(true);
      } else {
        toast({ title: "Could not submit review", description: json.error, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const shownRating = hovered ?? rating;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-whisper">
      <p className="text-sm font-semibold">Write a review</p>

      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="Rating"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={n === rating}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            className="p-0.5 transition-transform duration-150 hover:scale-110"
          >
            <Star className={cn("h-6 w-6 transition-colors", n <= shownRating ? "fill-accent text-accent" : "text-border")} />
          </button>
        ))}
      </div>

      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline (optional)" maxLength={120} className="rounded-full" />
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How did the hardware perform on site?"
        rows={3}
        maxLength={2000}
        required
        minLength={5}
      />
      <Button type="submit" disabled={submitting} className="px-6">
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
