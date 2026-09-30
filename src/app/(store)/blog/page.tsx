import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Blog — Field Notes on CCTV, Storage & GST",
  description:
    "Installer-oriented guides from the Patel Networks trade desk: HD analog vs IP, surveillance HDD sizing, GST input tax credit on security hardware, and more.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/blog" },
};

/* ----- inline post helpers (the index renders its own cards) ----- */

interface PostLike {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt: Date | string | null;
  tags?: string | null; // JSON string[]
}

function parseTags(post: Pick<PostLike, "tags">): string[] {
  if (!post.tags) return [];
  try {
    const parsed: unknown = JSON.parse(post.tags);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

function formatPostDate(date: PostLike["publishedAt"]): string {
  if (!date) return "Unpublished";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function PostMeta({ post }: { post: PostLike }) {
  return (
    <p className="label-caps flex items-center gap-2 !text-[10px]">
      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
      {formatPostDate(post.publishedAt)}
    </p>
  );
}

function TagChips({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Article tags">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** Cover — real image when seeded, quiet typographic panel when not. */
function PostCover({
  post,
  ratio = "aspect-[4/3]",
  className = "",
}: {
  post: Pick<PostLike, "title" | "coverImageUrl">;
  ratio?: string;
  className?: string;
}) {
  if (post.coverImageUrl) {
    return (
      <div className={`relative ${ratio} overflow-hidden rounded-xl border border-border bg-muted ${className}`}>
        <img
          src={post.coverImageUrl}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 ease-out dark:brightness-[.9]"
        />
      </div>
    );
  }
  return (
    <div
      className={`${ratio} flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/70 p-5 ${className}`}
      aria-hidden
    >
      <p className="label-caps !text-[10px]">Field notes · Surveillance trade</p>
      <p className="font-display text-lg leading-snug tracking-tight text-foreground/70 line-clamp-3">{post.title}</p>
    </div>
  );
}

export default async function BlogIndexPage() {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const [featured, ...rest] = posts;

  return (
    <div className="pb-0">
      {/* Hero */}
      <section className="bg-hero-ivory">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="max-w-3xl">
            <p className="label-caps">Blog · Field notes</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Guides from the trade counter
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              The questions that reach our counter, answered in full — technology comparisons, storage mathematics
              and the GST paperwork that keeps installer invoices clean.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center shadow-whisper">
            <h2 className="font-display text-xl tracking-tight">No field notes published yet</h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              We are writing the first guides. In the meantime, the catalog and kit builder are open — or ask the
              trade desk directly.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/products"
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse the catalog
              </Link>
              <Link href="/contact" className="link-underline text-sm font-medium">
                Contact the desk
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Featured — split cover/story card */}
            {featured ? (
              <Reveal>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="group grid gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-whisper transition-shadow duration-300 hover:shadow-lift md:grid-cols-2"
                >
                  <div className="p-4 pb-0 md:py-4 md:pl-4">
                    <div className="transition-transform duration-300 ease-out group-hover:scale-[1.01]">
                      <PostCover post={featured} ratio="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px]" />
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="rounded-full bg-sand px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-sand-foreground">
                        Latest
                      </span>
                      <PostMeta post={featured} />
                    </div>
                    <h2 className="mt-4 font-display text-2xl leading-tight tracking-tight md:text-3xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt ? (
                      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground md:text-[15px]">
                        {featured.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-5">
                      <TagChips tags={parseTags(featured)} />
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium">
                      Read the guide
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ) : null}

            {/* Grid */}
            {rest.length > 0 ? (
              <section aria-label="All articles" className="mt-12 border-t border-border pt-10">
                <h2 className="label-caps">All articles</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post, i) => {
                    const tags = parseTags(post);
                    return (
                      <Reveal key={post.id} delay={(i % 3) * 60}>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="group flex h-full flex-col rounded-xl border border-border bg-card shadow-whisper transition-shadow duration-300 hover:shadow-lift"
                        >
                          <div className="overflow-hidden rounded-t-xl p-4 pb-0">
                            <div className="transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                              <PostCover post={post} />
                            </div>
                          </div>
                          <div className="flex flex-1 flex-col p-5">
                            <PostMeta post={post} />
                            <h3 className="mt-2.5 font-display text-xl font-semibold leading-snug tracking-tight">
                              {post.title}
                            </h3>
                            {post.excerpt ? (
                              <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                                {post.excerpt}
                              </p>
                            ) : null}
                            <div className="mt-auto pt-4">
                              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
                                Read the guide
                                <ArrowRight
                                  className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                                  aria-hidden
                                />
                              </span>
                            </div>
                            {tags.length > 0 ? <div className="pt-3"><TagChips tags={tags} /></div> : null}
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </>
        )}
      </section>

      {/* Closing band — full-bleed deep green, only when there is something to read next */}
      {posts.length > 0 && (
        <section className="mt-16 bg-brand text-brand-foreground">
          <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">
                From reading to specifying
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                Specifying hardware instead of reading about it?
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-brand-foreground/75">
                The catalog carries the cameras, recorders, drives and cabling these guides discuss — or the kit
                builder assembles a matched set for you.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-full bg-brand-foreground px-6 py-3 text-sm font-medium text-brand transition-colors hover:bg-brand-foreground/90"
                >
                  Browse the catalog
                </Link>
                <Link
                  href="/kit-builder"
                  className="inline-flex items-center rounded-full border border-brand-foreground/35 px-6 py-3 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-foreground/10"
                >
                  Build a kit
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
