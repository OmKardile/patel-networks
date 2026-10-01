"use client";

import Link from "next/link";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { RailWithArrows } from "./rail";
import { cn } from "@/lib/utils";

// ReviewSection — reference "What Our Customers Say": a scroll-snap carousel
// of real approved reviews (quote, title, author first-name + initial, product
// link, verified badge). Self-hides below 3 reviews instead of padding thin
// data with fabricated quotes.

export type HomeReview = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  authorName: string | null;
  productName: string;
  productSlug: string;
};

function displayName(fullName: string | null, isVerified: boolean): string {
  const trimmed = fullName?.trim();
  if (!trimmed) return isVerified ? "Verified buyer" : "Customer";
  const parts = trimmed.split(/\s+/);
  const first = parts[0] ?? trimmed;
  if (parts.length === 1) return first;
  const initial = parts[parts.length - 1]?.slice(0, 1).toUpperCase() ?? "";
  return initial ? `${first} ${initial}.` : first;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`Rated ${rating} out of 5`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn("h-3.5 w-3.5", n <= rating ? "fill-star text-star" : "text-border")}
        />
      ))}
    </span>
  );
}

export function ReviewCard({ review, className }: { review: HomeReview; className?: string }) {
  return (
    <figure className={cn("flex h-full flex-col rounded-lg border bg-card p-5 shadow-whisper", className)}>
      <Quote aria-hidden className="h-4 w-4 text-star" />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Stars rating={review.rating} />
        {review.isVerified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
            <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
            Verified purchase
          </span>
        ) : null}
      </div>
      {review.title ? <p className="mt-2 text-sm font-semibold leading-snug">{review.title}</p> : null}
      {review.comment ? (
        <blockquote className="mt-1 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </blockquote>
      ) : null}
      <figcaption className="mt-auto pt-3 text-xs">
        <span className="font-medium">{displayName(review.authorName, review.isVerified)}</span>
        <span className="text-muted-foreground">
          {" · "}
          <Link href={`/products/${review.productSlug}`} className="link-underline hover:text-foreground">
            {review.productName}
          </Link>
        </span>
      </figcaption>
    </figure>
  );
}

const CARD_WIDTHS =
  "w-[86%] min-[420px]:w-[72%] sm:w-[46%] lg:w-[31.5%] shrink-0 snap-start";

export function ReviewSection({ reviews }: { reviews: HomeReview[] }) {
  if (reviews.length < 3) return null;
  const headingId = "customer-stories-heading";

  // RailWithArrows owns the scroll-snap track, ResizeObserver-driven arrow
  // visibility and the 44px arrow buttons; the header is a head slot.
  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <RailWithArrows
        label="What our customers say"
        className="container-inner"
        railClassName="mt-6"
        head={
          <div className="max-w-2xl">
            <p className="label-caps">Customer stories</p>
            <h2 id={headingId} className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              What our customers say
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Real notes from verified purchases across the catalogue.
            </p>
          </div>
        }
      >
        {reviews.map((review) => (
          <li key={review.id} className={CARD_WIDTHS}>
            <ReviewCard review={review} />
          </li>
        ))}
      </RailWithArrows>
    </section>
  );
}
