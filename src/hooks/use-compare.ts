"use client";

import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "maha-compare-ids";
const STORAGE_EVENT = "maha-compare-change";
const EMPTY_COMPARE_IDS: string[] = [];

let cachedRaw = "";
let cachedIds: string[] = EMPTY_COMPARE_IDS;

function parseCompareIds(raw: string | null) {
  if (!raw) {
    return EMPTY_COMPARE_IDS;
  }

  try {
    const parsed = JSON.parse(raw);
    const nextIds = Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : EMPTY_COMPARE_IDS;

    return nextIds.length ? nextIds : EMPTY_COMPARE_IDS;
  } catch {
    return EMPTY_COMPARE_IDS;
  }
}

function readCompareIds() {
  if (typeof window === "undefined") {
    return EMPTY_COMPARE_IDS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";

  if (raw === cachedRaw) {
    return cachedIds;
  }

  cachedRaw = raw;
  cachedIds = parseCompareIds(raw);
  return cachedIds;
}

function getServerCompareIds() {
  return EMPTY_COMPARE_IDS;
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function writeCompareIds(ids: string[]) {
  const normalizedIds = ids.length ? ids : EMPTY_COMPARE_IDS;
  const nextRaw = normalizedIds.length ? JSON.stringify(normalizedIds) : "";

  cachedRaw = nextRaw;
  cachedIds = normalizedIds;

  if (nextRaw) {
    window.localStorage.setItem(STORAGE_KEY, nextRaw);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useCompare() {
  const ids = useSyncExternalStore(subscribe, readCompareIds, getServerCompareIds);

  return useMemo(
    () => ({
      ids,
      isReady: typeof window !== "undefined",
      clear() {
        writeCompareIds([]);
      },
      toggle(id: string) {
        const currentIds = readCompareIds();

        if (currentIds.includes(id)) {
          writeCompareIds(currentIds.filter((item) => item !== id));
          return;
        }

        if (currentIds.length >= 3) {
          return;
        }

        writeCompareIds([...currentIds, id]);
      },
      isSelected(id: string) {
        return ids.includes(id);
      },
      isFull: ids.length >= 3,
    }),
    [ids],
  );
}
