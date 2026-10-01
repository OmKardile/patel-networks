// POST /api/newsletter — deal-alert email capture (public, rate-limited).
// Additive Task 52 backend: one row per verified-format email; re-subscribing
// an existing (or soft-unsubscribed) address reactivates it. No PII beyond
// the email itself. NEVER sends anything — the trade desk owns outreach.

import { fail, ok, parseBody, clientIp } from '@/lib/api-helpers';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { db } from '@/lib/db';

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  source: z.enum(['footer', 'offers', 'home']).default('home'),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return fail('Too many requests — try again in a few minutes.', 429, { retryAfterMs: rl.retryAfterMs });
  }

  const { data, error } = await parseBody(req, newsletterSchema);
  if (error) return error;

  try {
    await db.newsletterSubscriber.upsert({
      where: { email: data.email },
      create: { email: data.email, source: data.source, isActive: true },
      update: { isActive: true, source: data.source },
    });
    return ok({
      subscribed: true,
      message: "You're on the list — deal alerts land in your inbox, zero spam.",
    });
  } catch (err) {
    console.error('[api/newsletter] failed', err);
    return fail('Could not save the subscription. Try again.', 500);
  }
}
