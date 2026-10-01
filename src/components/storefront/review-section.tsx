import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ReviewSection — reference "What Our Customers Say": centered heading over a
// 2-up grid of story cards (portrait, story, featured-product mini-card that
// links to the PDP). Self-hides below 3 reviews instead of padding thin data
// with fabricated quotes.
//
// ReviewCard (also exported) is the BRAND REVIEWS wall card — white bordered
// tile with the review's own star rating and a product attribution link.

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

// Five-glyph row for a single review's own rating (brand reviews wall).
function Stars({ rating, className }: { rating: number; className?: string }) {
  const filled = Math.round(rating);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rated ${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            "h-3.5 w-3.5",
            n <= filled ? "fill-amber-400 text-amber-400" : "text-black/20",
          )}
        />
      ))}
    </span>
  );
}

export function ReviewCard({ review, className }: { review: HomeReview; className?: string }) {
  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-xl border border-black/5 bg-white p-5",
        className,
      )}
    >
      <Stars rating={review.rating} />
      {review.title ? (
        <p className="mt-2.5 text-sm font-semibold leading-snug">{review.title}</p>
      ) : null}
      {review.comment ? (
        <blockquote className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-black/60">
          &ldquo;{review.comment}&rdquo;
        </blockquote>
      ) : null}
      <footer className="mt-auto pt-4">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-black/80">
          {displayName(review.authorName, review.isVerified)}
          {review.isVerified ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <BadgeCheck aria-hidden className="h-3.5 w-3.5" />
              Verified purchase
            </span>
          ) : null}
        </p>
        <Link
          href={`/products/${review.productSlug}`}
          className="mt-1 inline-block text-xs text-black/50 underline transition-colors hover:text-black/80"
        >
          {review.productName}
        </Link>
      </footer>
    </figure>
  );
}

// Customer-story card: gray band card with portrait, story text and the
// featured-product mini-card bound to the PDP.

function StoryCard({ review }: { review: HomeReview }) {
  // Brief rule: product rating shows ONLY with a meaningful sample (>= 5).
  const productRating =
    review.productRating && review.productRating.count >= 5 ? review.productRating : null;

  return (
    <figure className="flex h-full flex-col rounded-2xl bg-[var(--band-gray)] p-4 md:p-6">
      <div
        className={cn(
          "flex flex-1 flex-col gap-5 lg:grid lg:items-center lg:gap-5",
          review.productImageUrl ? "lg:grid-cols-[auto_1fr]" : "",
        )}
      >
        {review.productImageUrl ? (
          <span className="relative block aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-lg bg-white md:w-44">
            <Image
              src={review.productImageUrl}
              alt={review.productName}
              fill
              sizes="(min-width:1024px) 176px, 144px"
              className="object-cover"
            />
          </span>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {review.title ? (
            <p className="text-lg font-bold uppercase leading-snug tracking-wide text-[#1c1b1b]">
              {review.title}
            </p>
          ) : null}
          {review.comment ? (
            <blockquote className="mt-1.5 line-clamp-4 text-base leading-relaxed text-black/70">
              &ldquo;{review.comment}&rdquo;
            </blockquote>
          ) : null}
          <p className="mt-2 text-xs text-black/50">
            {displayName(review.authorName, review.isVerified)}
          </p>

          {/* Featured product mini-card — every story binds to what it bought */}
          <Link
            href={`/products/${review.productSlug}`}
            className="group mt-4 flex items-center gap-3 rounded-lg bg-white p-3 shadow-whisper transition-shadow hover:shadow-lift"
          >
            <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded bg-secondary">
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
              <span className="w-fit rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-emerald-900">
                Featured Product
              </span>
              <span className="mt-1 block truncate text-xs text-black/70">
                {review.productName}
              </span>
              <span className="mt-0.5 flex items-center gap-1 text-xs">
                {productRating ? (
                  <>
                    <Star
                      aria-hidden
                      className="h-3 w-3 fill-amber-400 text-amber-400"
                    />
                    <span className="font-medium text-black/80">
                      {productRating.avg.toFixed(1)}
                    </span>
                    <span className="text-black/50">({productRating.count})</span>
                  </>
                ) : (
                  <span className="text-black/50">See all reviews</span>
                )}
              </span>
            </span>
            <ChevronRight
              aria-hidden
              className="ml-auto h-4 w-4 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </figure>
  );
}

export function ReviewSection({
  reviews,
  title = "What our customers say",
}: {
  reviews: HomeReview[];
  title?: string;
}) {
  if (reviews.length < 3) return null;
  const headingId = "customer-stories-heading";

  return (
    <section aria-labelledby={headingId} className="py-12 md:py-16">
      <div className="container-inner">
        <h2
          id={headingId}
          className="text-center text-xl font-semibold tracking-tight md:text-2xl"
        >
          {title}
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <StoryCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
