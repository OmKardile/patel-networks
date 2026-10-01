"use client";

// CompareIdsBridge — mounted by the /compare page. On mount it reconciles the
// persisted compare selection against the ids the server actually resolved
// (dropping stale selections), then — if the URL carried an ids param that no
// longer matches — replaces the URL without adding a history entry.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compare-store";

export function CompareIdsBridge({
  resolvedIds,
  hadIdsParam,
}: {
  resolvedIds: string[];
  hadIdsParam: boolean;
}) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    useCompareStore.getState().reconcile(resolvedIds);

    if (!hadIdsParam) return;
    const current = useCompareStore.getState().items.map((item) => item.id);
    const differs =
      current.length !== resolvedIds.length ||
      current.some((id, index) => id !== resolvedIds[index]);
    if (differs) {
      router.replace(`/compare?ids=${resolvedIds.join(",")}`);
    }
  }, [hadIdsParam, resolvedIds, router]);

  return null;
}
