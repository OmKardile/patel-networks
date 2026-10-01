"use client";

// AnnouncementBar — teal "Trade Desk Deals End In:" countdown strip (reference
// top band). The timer targets the NEXT dispatch cutoff (STORE.dispatchCutoff,
// 4:00 PM IST) computed with a fixed UTC+05:30 offset — India has no DST, so a
// constant offset is exact: same-day if now < 16:00 IST, otherwise tomorrow,
// rolling over automatically when the cutoff passes.
// Hydration-safe: server render and the first client paint show "--" boxes;
// the ticking digits start on the mounted tick. Ticking text is aria-hidden —
// screen readers get the static timer label instead of per-second chatter.

import { useEffect, useState } from "react";
import { STORE } from "@/lib/constants";

const IST_OFFSET_MINUTES = 330; // UTC+05:30, fixed

// Parse "4:00 PM IST" → { hour: 16, minute: 0 }. Falls back to 16:00 if the
// constant is ever edited into an unparseable shape.
function parseCutoff(value: string): { hour: number; minute: number } {
  const match = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(value);
  if (!match) return { hour: 16, minute: 0 };
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return { hour, minute: Number(match[2]) };
}

const CUTOFF = parseCutoff(STORE.dispatchCutoff);

// Epoch ms of the next cutoff strictly after `nowMs`. Shifting the epoch by
// +05:30 lets plain UTC getters read as IST wall-clock values.
function nextCutoffEpochMs(nowMs: number): number {
  const shifted = nowMs + IST_OFFSET_MINUTES * 60_000;
  const ist = new Date(shifted);
  const istMidnight = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
  let cutoff = istMidnight + (CUTOFF.hour * 60 + CUTOFF.minute) * 60_000;
  if (cutoff <= shifted) cutoff += 24 * 60 * 60_000; // past today's cutoff → tomorrow
  return cutoff - IST_OFFSET_MINUTES * 60_000;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function AnnouncementBar() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const frame = requestAnimationFrame(tick); // first reading right after paint
    const timer = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(timer);
    };
  }, []);

  const remaining = now === null ? null : Math.max(0, nextCutoffEpochMs(now) - now);
  const boxes: { label: string; value: string }[] = [
    { label: "Hours", value: remaining === null ? "--" : pad(Math.floor(remaining / 3_600_000)) },
    {
      label: "Min",
      value: remaining === null ? "--" : pad(Math.floor((remaining % 3_600_000) / 60_000)),
    },
    { label: "Sec", value: remaining === null ? "--" : pad(Math.floor((remaining % 60_000) / 1000)) },
  ];

  return (
    <div
      role="timer"
      aria-label="Time left for same-day dispatch today"
      className="bg-[var(--band-teal)] text-white"
    >
      <div className="flex h-11 items-center justify-center gap-1.5 px-2">
        <p className="min-w-0 truncate whitespace-nowrap text-sm font-bold">
          Trade Desk Deals End In:
        </p>
        <div aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          {boxes.map((box) => (
            <span
              key={box.label}
              className="grid h-9 min-w-11 place-items-center rounded-md bg-white px-1 text-[#1c1b1b]"
            >
              <span className="flex flex-col items-center leading-none">
                <span className="text-sm font-bold tabular-nums">{box.value}</span>
                <span className="mt-px text-[9px] uppercase tracking-wider text-[#1c1b1b]/70">
                  {box.label}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
