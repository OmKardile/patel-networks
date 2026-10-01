import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { BlogPostBody } from "@/components/content/blog-post-body";
import { parseTags } from "@/components/storefront/content-blog-card";
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
      <article className="container-inner pt-12 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <p className="label-caps">Blog · Field notes</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt ? <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">{post.excerpt}</p> : null}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-6">
            <p className="label-caps flex items-center gap-2 !text-[10px]">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {publishedLabel}
            </p>
            <p className="label-caps !text-[10px]">{readMinutes} min read</p>
            <p className="label-caps !text-[10px]">Patel Networks trade desk</p>
          </div>

          <div className="mt-8">
            {post.coverImageUrl ? (
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg border border-border bg-muted">
                <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover dark:brightness-[.9]" />
              </div>
            ) : (
              <div
                className="flex aspect-[2/1] flex-col justify-between overflow-hidden rounded-lg border border-border bg-muted/70 p-6"
                aria-hidden
              >
                <p className="label-caps !text-[10px]">Field notes · Surveillance trade</p>
                <p className="font-display text-xl leading-snug tracking-tight text-foreground/70">{post.title}</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <BlogPostBody content={post.content} />
          </div>

          {tags.length > 0 ? (
            <ul className="mt-10 flex flex-wrap gap-1.5 border-t border-border pt-6" aria-label="Article tags">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <nav aria-label="More articles" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            {newer ? (
              <Link href={`/blog/${newer.slug}`} className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-medium">
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden />
                <span className="max-w-[16rem] truncate text-muted-foreground group-hover:text-foreground">{newer.title}</span>
              </Link>
            ) : (
              <Link href="/blog" className="inline-flex min-h-[44px] items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                All articles
              </Link>
            )}
            {older ? (
              <Link href={`/blog/${older.slug}`} className="group inline-flex min-h-[44px] items-center gap-2 text-right text-sm font-medium">
                <span className="max-w-[16rem] truncate text-muted-foreground group-hover:text-foreground">{older.title}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            ) : null}
          </nav>
        </div>
      </article>
    </div>
  );
}
