// Reviews wall — blueprint §1.2 slot 8 ("Let customers speak for us" analog).
// Aggregate = a direct count of approved reviews from the server; cards reuse
// the shared ReviewCard anatomy. The page renders this section only when the
// count is non-zero — counts and quotes are never invented.

import { ReviewCard, type HomeReview } from "./customer-stories";
import { SectionHead } from "./section-head";

interface ReviewsWallProps {
  reviewCount: number;
  /** 6–8 recent approved reviews (same server query as Customer Stories). */
  reviews: HomeReview[];
  headingId?: string;
}

export function ReviewsWall({ reviewCount, reviews, headingId = "reviews-wall-heading" }: ReviewsWallProps) {
  if (reviewCount <= 0 || reviews.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
      <SectionHead
        headingId={headingId}
        eyebrow="Reviews"
        title="Let customers speak for us."
        lede={`From ${reviewCount} verified review${reviewCount === 1 ? "" : "s"} across the catalog.`}
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
