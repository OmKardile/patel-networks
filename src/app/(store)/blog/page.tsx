import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Breadcrumb } from "@/components/storefront/breadcrumb";
import { BlogCard } from "@/components/storefront/content-blog-card";

export const metadata: Metadata = {
  title: "Blog — Field Notes on CCTV, Storage & GST",
  description:
    "Installer-oriented guides from the Patel Networks trade desk: HD analog vs IP, surveillance HDD sizing, GST input tax credit on security hardware, and more.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/blog" },
};

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
        <div className="container-inner pb-10 pt-12 md:pb-12 md:pt-16">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} className="mb-6" />
          <div className="max-w-3xl">
            <p className="label-caps">Blog · Field notes</p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Guides from the trade counter
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              The questions that reach our counter, answered in full — technology comparisons, storage mathematics and
              the GST paperwork that keeps installer invoices clean.
            </p>
          </div>
        </div>
      </section>

      <section className="container-inner py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card px-6 py-16 text-center shadow-whisper">
            <p className="label-caps">Field notes</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">No guides published yet.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              The trade desk writes as it answers — comparisons, storage sizing and GST walkthroughs land here first.
            </p>
          </div>
        ) : (
          <>
            {featured ? (
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <BlogCard post={featured} />
                </div>
                {rest.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                    {rest.slice(0, 2).map((post) => (
                      <BlogCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {rest.length > 2 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.slice(2).map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
