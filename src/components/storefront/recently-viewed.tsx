"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { Price } from "./price";
import { cn } from "@/lib/utils";

// Recently viewed — localStorage ring buffer (pn-recent-v1, max 8, newest
// first), cross-tab via storage event. PDP records; home renders read-only.

const KEY = "pn-recent-v1";
const MAX = 8;
const EVENT = "pn-recent-changed";

export type RecentProductSnapshot = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  priceFromPaise: number;
  at: number;
};

// useSyncExternalStore requires stable snapshot identities — cache the parsed
// list and only re-parse when the raw string actually changes.
const EMPTY: RecentProductSnapshot[] = [];
let cacheRaw: string | null = null;
let cache: RecentProductSnapshot[] = EMPTY;

function read(): RecentProductSnapshot[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cacheRaw) return cache;
    const parsed = raw ? (JSON.parse(raw) as RecentProductSnapshot[]) : [];
    cacheRaw = raw;
    cache = Array.isArray(parsed) ? parsed.filter((r) => r && r.id && r.slug) : EMPTY;
    return cache;
  } catch {
    return EMPTY;
  }
}

function write(list: RecentProductSnapshot[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVENT));
}

export function recordRecent(snapshot: Omit<RecentProductSnapshot, "at">) {
  if (typeof window === "undefined") return;
  const list = read().filter((r) => r.id !== snapshot.id);
  write([{ ...snapshot, at: Date.now() }, ...list]);
}

function clearRecent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function useRecentList() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

function RecentCard({ item }: { item: RecentProductSnapshot }) {
  return (
    <li className="w-36 shrink-0 snap-start sm:w-40">
      <Link href={`/products/${item.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>
        <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug">{item.name}</p>
        <Price paise={item.priceFromPaise} className="mt-0.5 block text-xs font-semibold" />
      </Link>
    </li>
  );
}

function Strip({
  items,
  currentId,
  onClear,
  className,
}: {
  items: RecentProductSnapshot[];
  currentId?: string;
  onClear?: () => void;
  className?: string;
}) {
  const visible = items.filter((r) => r.id !== currentId);
  if (visible.length === 0) return null;
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <p className="label-caps">Recently viewed</p>
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="min-h-[44px] text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            Clear history
          </button>
        ) : null}
      </div>
      <ul className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
        {visible.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

// PDP slot — records the current product once, then renders the strip.
export function RecentlyViewed({ current }: { current: RecentProductSnapshot }) {
  const list = useRecentList();
  useEffect(() => {
    recordRecent(current);
  }, [current.id]);
  return (
    <Strip
      items={list}
      currentId={current.id}
      onClear={clearRecent}
      className="container-inner"
    />
  );
}

// Home slot — read-only; self-hides when the buffer is empty. The server
// snapshot of useSyncExternalStore is [], so SSR/hydration render nothing and
// the strip appears with items right after mount — no mounted-gate needed.
export function RecentlyViewedRail({ className }: { className?: string }) {
  const list = useRecentList();
  return <Strip items={list} className={cn("container-inner", className)} />;
}
