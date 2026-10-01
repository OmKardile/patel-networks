import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

// /login is a convenience alias — the real OTP sign-in lives at /account/login.
// Only a local path is honored as ?next= (starts with "/", never "//") so an
// off-site target can't ride the redirect.

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: true },
};

export default async function LoginAliasPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : undefined;
  const next = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : undefined;
  permanentRedirect(next ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login");
}
