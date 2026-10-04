"use client";

// Customer stories — blueprint §1.2 slot 5 ("What Our Customers Say" analog).
// A scroll-snap carousel of REAL approved reviews (server-fetched, passed as
// plain props — the page hides the whole section when fewer than 3 exist, so
// nothing is ever fabricated). The ReviewCard is exported for reuse by the
// ReviewsWall grid so both surfaces share one anatomy.

import Link from "next/link";
import { Quote, Star } from "lucide-react";
import { RailWithArrows } from "./rail-arrows";
import { SectionHead } from "./section-head";

export interface HomeReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  /** ISO string — serialized at the server boundary. */
  createdAt: string;
  authorName: string | null;
  productName: string;
  productSlug: string;
}

const REVIEW_DATE = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "long", year: "numeric" });

export function ReviewCard({ review }: { review: HomeReview }) {
  const firstName = review.authorName?.trim().split(/\s+/)[0] || "Verified buyer";
  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-whisper">
      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, s) => (
          <Star
            key={s}
            className={`h-3.5 w-3.5 ${s < review.rating ? "fill-star text-star" : "text-muted-foreground/40"}`}
            aria-hidden
          />
        ))}
      </div>
      {review.title && (
        <h3 className="mt-3 font-display text-[15px] font-semibold leading-snug tracking-tight">{review.title}</h3>
      )}
      {review.comment && (
        <p className="mt-2 flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
          <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
          {review.comment}
        </p>
      )}
      <p className="mt-auto pt-4 text-xs text-muted-foreground">
        {firstName} · {review.isVerified ? "verified purchase" : "customer"}
        {review.productSlug && (
          <>
            {" · "}
            <Link href={`/products/${review.productSlug}`} className="link-underline font-medium text-foreground">
              {review.productName}
            </Link>
          </>
        )}
        <span className="block sm:inline">
          {review.productSlug ? " · " : ""}
          {REVIEW_DATE.format(new Date(review.createdAt))}
        </span>
      </p>
    </article>
  );
}

export function CustomerStories({ reviews }: { reviews: HomeReview[] }) {
  if (reviews.length < 3) return null; // never stage a thin testimonial wall

  return (
    <RailWithArrows
      label="Customer stories"
      head={
        <SectionHead
          headingId="customer-stories-heading"
          eyebrow="Customer stories"
          title="What our customers say."
          lede="Installers, shops and integrators on the hardware they run — in their own words."
        />
      }
    >
      {reviews.map((review) => (
        <li key={review.id} className="w-[280px] shrink-0 snap-start sm:w-[330px]">
          <ReviewCard review={review} />
        </li>
      ))}
    </RailWithArrows>
  );
}
