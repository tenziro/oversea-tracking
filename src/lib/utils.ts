import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClearanceProgressItem, ClearanceStatus, RecentSearch, SearchType } from "./types";
import { CLEARANCE_STATUS_MAP } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 날짜 포맷팅 (YYYYMMDDHHmmss → 사람이 읽기 쉬운 형식)
export function formatDateTime(dt: string): string {
  if (!dt || dt.length < 8) return dt || "-";

  const year = dt.slice(0, 4);
  const month = dt.slice(4, 6);
  const day = dt.slice(6, 8);
  const hour = dt.length >= 10 ? dt.slice(8, 10) : "";
  const minute = dt.length >= 12 ? dt.slice(10, 12) : "";

  if (hour && minute) {
    return `${year}.${month}.${day} ${hour}:${minute}`;
  }
  return `${year}.${month}.${day}`;
}

// 통관 진행 상태에서 현재 단계 파악
export function getCurrentClearanceStatus(items: ClearanceProgressItem[]): ClearanceStatus {
  if (!items || items.length === 0) return "UNKNOWN";

  // 가장 최근 상태 기준으로 판별
  const latest = items[items.length - 1];
  const mapped = CLEARANCE_STATUS_MAP[latest.prgsStts];
  return mapped?.status ?? "UNKNOWN";
}

// 통관 완료 여부
export function isClearanceComplete(items: ClearanceProgressItem[]): boolean {
  return getCurrentClearanceStatus(items) === "CLEARED";
}

// 최근 검색 로컬스토리지 관리
const RECENT_SEARCHES_KEY = "cargo_recent_searches";
const MAX_RECENT_SEARCHES = 10;

export function getRecentSearches(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(search: Omit<RecentSearch, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches();
    // 중복 제거
    const filtered = existing.filter(
      (s) => !(s.query === search.query && s.searchType === search.searchType)
    );
    const newSearch: RecentSearch = {
      ...search,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function removeRecentSearch(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentSearches();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// 즐겨찾기 로컬스토리지 관리
const WATCHLIST_KEY = "cargo_watchlist";
const MAX_WATCHLIST = 20;

export function getWatchlist(): RecentSearch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToWatchlist(item: Omit<RecentSearch, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getWatchlist();
    const filtered = existing.filter(
      (s) => !(s.query === item.query && s.searchType === item.searchType)
    );
    const newItem: RecentSearch = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const updated = [newItem, ...filtered].slice(0, MAX_WATCHLIST);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function removeFromWatchlist(query: string, searchType: SearchType): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getWatchlist();
    const updated = existing.filter(
      (s) => !(s.query === query && s.searchType === searchType)
    );
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function isInWatchlist(query: string, searchType: SearchType): boolean {
  const list = getWatchlist();
  return list.some((s) => s.query === query && s.searchType === searchType);
}

// 검색 타입 레이블
export const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  cargMtNo: "화물관리번호",
  hblNo: "B/L번호",
  mblNo: "마스터 B/L번호",
};

// 진행률 계산 (0~100)
export function calcProgressPercent(items: ClearanceProgressItem[]): number {
  if (!items || items.length === 0) return 0;

  const statusOrder: ClearanceStatus[] = [
    "PRE_DECLARATION",
    "DECLARED",
    "INSPECTION",
    "EXAMINATION",
    "DUTY_PAYMENT",
    "CLEARED",
  ];

  const current = getCurrentClearanceStatus(items);
  if (current === "REJECTED") return 100;

  const idx = statusOrder.indexOf(current);
  if (idx < 0) return 0;

  return Math.round(((idx + 1) / statusOrder.length) * 100);
}
