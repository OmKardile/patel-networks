"use client";

// NewsletterBand — brief NEWSLETTER row: headline, supporting message, email
// input, subscribe CTA, privacy note. The WhatsApp deal-alerts path is kept
// alongside (genuine client channel); the email path posts to the additive
// /api/newsletter backend (Task 52). Inline state messaging, no toasts.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { STORE } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterBand() {
  const headingId = "deal-alerts-heading";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const waHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(
    "Hi Patel Networks — please send me new-arrival and deal alerts.",
  )}`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "home" }),
      });
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setStatus("error");
        setMessage(body?.message ?? "Could not save the subscription. Try again.");
        return;
      }
      setStatus("done");
      setMessage(body?.message ?? "You're on the list — zero spam.");
    } catch {
      setStatus("error");
      setMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <section aria-labelledby={headingId} className="bg-sand text-sand-foreground">
      <div className="container-inner flex flex-col items-center gap-5 py-12 text-center md:py-16">
        <p className="label-caps">Deal alerts</p>
        <h2 id={headingId} className="max-w-xl text-xl font-semibold tracking-tight sm:text-2xl">
          Deal alerts, zero spam.
        </h2>
        <p className="max-w-md text-sm text-foreground/80">
          New arrivals, restocks and genuine bundle savings from the {STORE.city} trade desk — one
          short note when something lands, nothing else.
        </p>

        {status === "done" ? (
          <p
            role="status"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-card px-4 text-sm font-medium text-foreground"
          >
            <CheckCircle2 aria-hidden className="h-4 w-4 text-success" />
            {message}
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
            noValidate
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <Input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (status === "error") setStatus("idle");
              }}
              aria-invalid={status === "error"}
              aria-describedby="newsletter-message"
              disabled={status === "loading"}
              className="h-11 flex-1 border-sand-foreground/30 bg-card text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className={buttonVariants({ size: "lg" }) + " min-h-[44px] disabled:opacity-60"}
            >
              {status === "loading" ? (
                <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              ) : null}
              Subscribe
            </button>
          </form>
        )}
        <p id="newsletter-message" aria-live="polite" className="min-h-5 text-sm">
          {status === "error" ? <span className="font-medium text-destructive">{message}</span> : null}
        </p>

        <p className="max-w-md text-xs leading-5 text-foreground/70">
          By subscribing you agree to our{" "}
          <Link href="/privacy-policy" className="link-underline font-medium">
            Privacy Policy
          </Link>
          . Prefer WhatsApp?{" "}
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="link-underline font-medium">
            Get alerts on WhatsApp
          </a>{" "}
          instead — or{" "}
          <Link href="/products?sort=newest" className="link-underline font-medium">
            browse new arrivals
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
