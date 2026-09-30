import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { BlogPostBody } from "@/components/content/blog-post-body";
import { Reveal } from "@/components/motion/reveal";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  const post = await db.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") return null;
  return post;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: "Article not found" };
  }
  return {
    title: `${post.title} | Blog`,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: post.publishedAt?.toISOString(),
      tags: parseTags(post),
    },
  };
}

function parseTags(post: Pick<{ tags: string | null }, "tags">): string[] {
  if (!post.tags) return [];
  try {
    const parsed: unknown = JSON.parse(post.tags);
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Newer / older neighbours within the published feed.
  const siblings = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { slug: true, title: true },
  });
  const idx = siblings.findIndex((p) => p.slug === post.slug);
  const newer = idx > 0 ? siblings[idx - 1] : null;
  const older = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const words = post.content.trim().split(/\s+/).length;
  const readMinutes = Math.max(2, Math.round(words / 200));
  const tags = parseTags(post);

  const publishedLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Unpublished";

  return (
    <div className="pb-0">
      <article className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            {/* Header */}
            <p className="label-caps">Blog · Field notes</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
            ) : null}

            {/* Meta row */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6">
              <p className="label-caps flex items-center gap-2 !text-[10px]">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                {publishedLabel}
              </p>
              <p className="label-caps !text-[10px]">{readMinutes} min read</p>
              <p className="label-caps !text-[10px]">Patel Networks trade desk</p>
            </div>

            {/* Cover */}
            <div className="mt-8">
              {post.coverImageUrl ? (
                <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-border bg-muted">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-full w-full object-cover dark:brightness-[.9]"
                  />
                </div>
              ) : (
                <div
                  className="flex aspect-[2/1] flex-col justify-between overflow-hidden rounded-xl border border-border bg-muted/70 p-6"
                  aria-hidden
                >
                  <p className="label-caps !text-[10px]">Field notes · Surveillance trade</p>
                  <p className="font-display text-xl leading-snug tracking-tight text-foreground/70">{post.title}</p>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="mt-8">
              <BlogPostBody content={post.content} />
            </div>

            {/* Tags */}
            {tags.length > 0 ? (
              <div className="mt-12 border-t border-border pt-6">
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
              </div>
            ) : null}
          </div>
        </Reveal>

        {/* Prev / next */}
        <nav aria-label="More articles" className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
          {newer ? (
            <Link
              href={`/blog/${newer.slug}`}
              className="group rounded-xl border border-border bg-card p-5 shadow-whisper transition-colors hover:bg-muted/50"
            >
              <p className="label-caps flex items-center gap-2 !text-[10px]">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Newer
              </p>
              <p className="mt-2 font-display text-base leading-snug tracking-tight group-hover:underline group-hover:underline-offset-4">
                {newer.title}
              </p>
            </Link>
          ) : (
            <span aria-hidden className="hidden sm:block" />
          )}
          {older ? (
            <Link
              href={`/blog/${older.slug}`}
              className="group rounded-xl border border-border bg-card p-5 text-right shadow-whisper transition-colors hover:bg-muted/50"
            >
              <p className="label-caps flex items-center justify-end gap-2 !text-[10px]">
                Older <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
              <p className="mt-2 font-display text-base leading-snug tracking-tight group-hover:underline group-hover:underline-offset-4">
                {older.title}
              </p>
            </Link>
          ) : null}
        </nav>
      </article>

      {/* CTA band — full-bleed deep green */}
      <section className="mt-16 bg-brand text-brand-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-foreground/60">
              From reading to specifying
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
              Ready to specify the hardware?
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-brand-foreground/75">
              Everything discussed in this guide is stocked at the Surat hub — browse the catalog or let the kit
              builder assemble a matched set.
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
    </div>
  );
}
