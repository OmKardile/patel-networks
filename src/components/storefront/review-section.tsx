"use client";

import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Quote, Star } from "lucide-react";
import { RailWithArrows } from "./rail";
import { cn } from "@/lib/utils";

// ReviewSection — reference "What Our Customers Say": a scroll-snap carousel
// of real approved reviews. Card anatomy follows the reference: quote
// headline, quote body, then a FEATURED PRODUCT block (image + label + name +
// product rating) binding every story to the product it bought. Self-hides
// below 3 reviews instead of padding thin data with fabricated quotes.

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
  productImageUrl?: string | null;
  /** Aggregate rating of the featured product — rendered only at count ≥ 5. */
  productRating?: { avg: number; count: number };
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

export function ReviewCard({ review, className }: { review: HomeReview; className?: string }) {
  const productRating =
    review.productRating && review.productRating.count >= 5 ? review.productRating : null;

  return (
    <figure className={cn("flex h-full flex-col rounded-lg border bg-card p-5 shadow-whisper", className)}>
      <Quote aria-hidden className="h-4 w-4 text-star" />
      {review.title ? <p className="mt-2 text-sm font-semibold uppercase leading-snug tracking-tight">{review.title}</p> : null}
      {review.comment ? (
        <blockquote className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          &ldquo;{review.comment}&rdquo;
        </blockquote>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">{displayName(review.authorName, review.isVerified)}</p>

      {/* Featured product block — reference binds every story to its product */}
      <div className="mt-auto pt-4">
      <Link
        href={`/products/${review.productSlug}`}
        className="group flex items-center gap-3 rounded-md border bg-background p-2.5 transition-colors hover:border-foreground/25"
      >
        <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
          {review.productImageUrl ? (
            <Image
              src={review.productImageUrl}
              alt={review.productName}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Featured Product
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium group-hover:underline">
            {review.productName}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            {productRating ? (
              <>
                <Star aria-hidden className="h-3 w-3 fill-star text-star" />
                <span className="font-medium text-foreground tabular-nums">
                  {productRating.avg.toFixed(1)}
                </span>
                <span>({productRating.count})</span>
              </>
            ) : (
              <span>See all reviews</span>
            )}
          </span>
        </span>
      </Link>
      </div>
      {review.isVerified ? (
        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-success">
          <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
          Verified purchase
        </span>
      ) : null}
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
