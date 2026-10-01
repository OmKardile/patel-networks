"use client";

// NewsletterForm — compact footer email capture (reference footer group:
// short heading, supporting line, single email field, Subscribe). Posts to
// the additive /api/newsletter backend (Task 52). Inline state messaging.

import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function NewsletterForm({ source = "footer" }: { source?: "footer" | "offers" | "home" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

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
        body: JSON.stringify({ email: value, source }),
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

  if (status === "done") {
    return (
      <p
        role="status"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-md border bg-background px-4 text-sm font-medium text-foreground"
      >
        <CheckCircle2 aria-hidden className="h-4 w-4 text-success" />
        {message}
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-2 sm:flex-row" noValidate>
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="footer-newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby="footer-newsletter-message"
          disabled={status === "loading"}
          className="h-11 flex-1"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "loading" ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : null}
          Subscribe
        </button>
      </form>
      <p id="footer-newsletter-message" aria-live="polite" className="mt-1.5 min-h-5 text-sm">
        {status === "error" ? <span className="font-medium text-destructive">{message}</span> : null}
      </p>
    </div>
  );
}
