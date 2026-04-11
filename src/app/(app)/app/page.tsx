"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  IconPackageImport,
  IconHistory as IconClockHistory,
  IconTrash,
  IconChevronRight,
  IconAlertCircle,
  IconX,
  IconStar,
  IconWifiOff,
  IconPlus,
  IconDatabase,
} from "@tabler/icons-react";
import { SearchForm } from "@/components/cargo/search-form";
import { CargoDetailCard } from "@/components/cargo/cargo-detail-card";
import { CargoDetailSkeleton } from "@/components/cargo/cargo-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCargo } from "@/hooks/use-cargo";
import { useWakeLock } from "@/hooks/use-wake-lock";
import {
  getRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
  getWatchlist,
  removeFromWatchlist,
  SEARCH_TYPE_LABELS,
  formatDateTime,
} from "@/lib/utils";
import type { CargoApiResponse, RecentSearch, SearchType } from "@/lib/types";
import { cn } from "@/lib/utils";

// ── 멀티 화물 결과 아이템 타입 ──────────────────────────────────────────────
interface MultiResult {
  query: string;
  searchType: SearchType;
  result: CargoApiResponse | null;
  error: string | null;
  isLoading: boolean;
  cachedAt: number | null;
}

// ── URL 파라미터 읽기 컴포넌트 (Suspense boundary 내부) ─────────────────────
function SearchParamsInit({
  onInit,
}: {
  onInit: (q: string, type: SearchType) => void;
}) {
  const searchParams = useSearchParams();
  const didInit = React.useRef(false);

  React.useEffect(() => {
    if (didInit.current) return;
    const q = searchParams.get("q");
    const type = searchParams.get("type") as SearchType | null;
    if (q) {
      didInit.current = true;
      onInit(q, type && ["cargMtNo", "hblNo", "mblNo"].includes(type) ? type : "cargMtNo");
    }
  }, [searchParams, onInit]);

  return null;
}

// ── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { data, isLoading, error, isQueued, cachedAt, search, reset } = useCargo();
  const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([]);
  const [watchlist, setWatchlist] = React.useState<RecentSearch[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);
  const [currentQuery, setCurrentQuery] = React.useState("");
  const [currentSearchType, setCurrentSearchType] = React.useState<SearchType>("cargMtNo");
  const resultRef = React.useRef<HTMLDivElement>(null);

  // 멀티 화물 일괄 조회 결과
  const [multiResults, setMultiResults] = React.useState<MultiResult[]>([]);
  const [isMultiMode, setIsMultiMode] = React.useState(false);

  // 결과 표시 중 화면 켜짐 유지
  useWakeLock(!isLoading && !!data?.success && !!data.data);

  const refreshLists = React.useCallback(() => {
    setRecentSearches(getRecentSearches());
    setWatchlist(getWatchlist());
  }, []);

  React.useEffect(() => {
    refreshLists();
  }, [refreshLists]);

  // URL 파라미터로 자동 검색 (deeplink)
  const handleDeeplinkInit = React.useCallback(
    (q: string, type: SearchType) => {
      setHasSearched(true);
      setIsMultiMode(false);
      setCurrentQuery(q);
      setCurrentSearchType(type);
      search(q, type);
    },
    [search]
  );

  // URL 업데이트 (공유 딥링크용)
  const updateUrl = React.useCallback(
    (query: string, type: SearchType) => {
      const params = new URLSearchParams({ q: query, type });
      router.replace(`/app?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const handleSearch = React.useCallback(
    async (query: string, searchType: SearchType) => {
      // 쉼표/줄바꿈으로 구분된 멀티 쿼리 감지
      const parts = query
        .split(/[\n,;]/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      if (parts.length > 1) {
        // 멀티 모드
        setIsMultiMode(true);
        setHasSearched(true);
        setMultiResults(
          parts.map((q) => ({
            query: q,
            searchType,
            result: null,
            error: null,
            isLoading: true,
            cachedAt: null,
          }))
        );
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);

        // 병렬 조회
        const { fetchCargoStatus } = await import("@/lib/api");
        const { saveRecentSearch, saveCargoCache, getCargoCache } = await import("@/lib/utils");

        await Promise.allSettled(
          parts.map(async (q, i) => {
            try {
              const res = await fetchCargoStatus(q, searchType);
              if (res.success && res.data) {
                saveRecentSearch({
                  query: q,
                  searchType,
                  cargoName: res.data.cargNm,
                  lastStatus:
                    res.data.csclPrgsStts[res.data.csclPrgsStts.length - 1]?.prgsSttsNm,
                });
                saveCargoCache(q, searchType, res.data);
              }
              setMultiResults((prev) =>
                prev.map((item, idx) =>
                  idx === i ? { ...item, result: res, error: null, isLoading: false, cachedAt: null } : item
                )
              );
            } catch {
              const cached = getCargoCache(q, searchType);
              setMultiResults((prev) =>
                prev.map((item, idx) =>
                  idx === i
                    ? {
                        ...item,
                        result: cached ? { success: true, data: cached.data } : null,
                        error: cached ? null : "조회 실패",
                        isLoading: false,
                        cachedAt: cached?.cachedAt ?? null,
                      }
                    : item
                )
              );
            }
          })
        );
        setRecentSearches(getRecentSearches());
        return;
      }

      // 단일 모드
      setIsMultiMode(false);
      setHasSearched(true);
      setCurrentQuery(query);
      setCurrentSearchType(searchType);
      updateUrl(query, searchType);
      await search(query, searchType);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      setRecentSearches(getRecentSearches());
    },
    [search, updateUrl]
  );

  const handleRecentSearch = (recent: RecentSearch) => {
    handleSearch(recent.query, recent.searchType);
  };

  const handleRemoveRecent = (id: string) => {
    removeRecentSearch(id);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAll = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRemoveWatchlist = (item: RecentSearch) => {
    removeFromWatchlist(item.query, item.searchType);
    setWatchlist(getWatchlist());
  };

  const handleReset = () => {
    reset();
    setHasSearched(false);
    setIsMultiMode(false);
    setMultiResults([]);
    router.replace("/app", { scroll: false });
    refreshLists();
  };

  const anyLoading = isLoading || multiResults.some((r) => r.isLoading);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* URL 딥링크 초기화 (Suspense 경계 내부) */}
      <React.Suspense fallback={null}>
        <SearchParamsInit onInit={handleDeeplinkInit} />
      </React.Suspense>

      {/* 헤로 섹션 */}
      {!hasSearched && (
        <div className="text-center py-6 animate-fade-in">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 text-primary">
            <IconPackageImport size={30} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">화물통관 조회</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            화물관리번호 또는 B/L번호로
            <br />
            통관 진행 상태를 확인하세요
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            쉼표로 구분하면 여러 화물을 한번에 조회할 수 있어요
          </p>
        </div>
      )}

      {/* 검색 폼 */}
      <div className={cn("rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-4", hasSearched && "sticky top-16 z-30")}>
        <SearchForm onSearch={handleSearch} isLoading={anyLoading} />
      </div>

      {/* 결과 영역 */}
      <div ref={resultRef}>
        {/* 단일 모드 로딩 */}
        {isLoading && !isMultiMode && <CargoDetailSkeleton />}

        {/* 오프라인 큐잉 배너 */}
        {isQueued && !isLoading && !isMultiMode && (
          <div className="rounded-xl border bg-card p-6 text-center animate-fade-in">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
              <IconWifiOff size={24} className="text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">조회 예약됨</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              오프라인 상태입니다. 연결되면 자동으로 조회하고 알림을 보내드립니다.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleReset}>
              <IconX size={14} className="mr-1.5" />
              취소
            </Button>
          </div>
        )}

        {/* 오류 */}
        {error && !isLoading && !isQueued && !isMultiMode && (
          <div className="rounded-xl border bg-card p-6 text-center animate-fade-in">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <IconAlertCircle size={24} className="text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground">조회 실패</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleReset}
            >
              <IconX size={14} className="mr-1.5" />
              초기화
            </Button>
          </div>
        )}

        {/* 단일 결과 카드 */}
        {data?.success && data.data && !isLoading && !isMultiMode && (
          <div className="space-y-3 animate-fade-in">
            {cachedAt && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2">
                <IconDatabase size={13} className="shrink-0" />
                <span>오프라인 — {formatDateTime(String(cachedAt))} 기준 캐시</span>
              </div>
            )}
            <CargoDetailCard
              cargo={data.data}
              query={currentQuery}
              searchType={currentSearchType}
              onWatchlistChange={refreshLists}
            />
          </div>
        )}

        {/* 멀티 결과 */}
        {isMultiMode && multiResults.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">
                일괄 조회 결과 ({multiResults.length}건)
              </p>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <IconX size={13} />
                초기화
              </button>
            </div>
            {multiResults.map((item, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                {item.isLoading ? (
                  <CargoDetailSkeleton />
                ) : item.error ? (
                  <div className="p-4 flex items-center gap-2 text-sm text-destructive">
                    <IconAlertCircle size={16} className="shrink-0" />
                    <div>
                      <span className="font-mono font-medium">{item.query}</span>
                      <span className="ml-2 text-muted-foreground">— {item.error}</span>
                    </div>
                  </div>
                ) : item.result?.success && item.result.data ? (
                  <div className="space-y-0">
                    {item.cachedAt && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 border-b">
                        <IconDatabase size={12} className="shrink-0" />
                        <span>캐시된 결과</span>
                      </div>
                    )}
                    <CargoDetailCard
                      cargo={item.result.data}
                      query={item.query}
                      searchType={item.searchType}
                      onWatchlistChange={refreshLists}
                    />
                  </div>
                ) : null}
              </div>
            ))}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <IconPlus size={14} />
              새 검색
            </button>
          </div>
        )}
      </div>

      {/* 즐겨찾기 (검색 결과 없을 때만 표시) */}
      {!hasSearched && watchlist.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <IconStar size={16} className="text-amber-400" />
            즐겨찾기
          </div>
          <div className="space-y-1.5">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer"
              >
                <button
                  className="flex flex-1 items-center gap-3 min-w-0 text-left"
                  onClick={() => handleRecentSearch(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium font-mono truncate">{item.query}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0">
                        {SEARCH_TYPE_LABELS[item.searchType]}
                      </Badge>
                    </div>
                    {item.cargoName && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.cargoName}
                      </p>
                    )}
                  </div>
                  <IconChevronRight
                    size={15}
                    className="text-muted-foreground group-hover:text-foreground shrink-0"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWatchlist(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted transition-all"
                  aria-label="즐겨찾기 해제"
                >
                  <IconX size={12} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 최근 검색 (검색 결과 없을 때만 표시) */}
      {!hasSearched && recentSearches.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <IconClockHistory size={16} className="text-muted-foreground" />
              최근 검색
            </div>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconTrash size={13} />
              전체 삭제
            </button>
          </div>

          <div className="space-y-1.5">
            {recentSearches.map((recent) => (
              <div
                key={recent.id}
                className="group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer"
              >
                <button
                  className="flex flex-1 items-center gap-3 min-w-0 text-left"
                  onClick={() => handleRecentSearch(recent)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium font-mono truncate">{recent.query}</span>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0">
                        {SEARCH_TYPE_LABELS[recent.searchType]}
                      </Badge>
                    </div>
                    {recent.cargoName && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {recent.cargoName}
                      </p>
                    )}
                  </div>
                  <IconChevronRight
                    size={15}
                    className="text-muted-foreground group-hover:text-foreground shrink-0"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRecent(recent.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted transition-all"
                  aria-label="삭제"
                >
                  <IconX size={12} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 빈 상태 (최근 검색 없음) */}
      {!hasSearched && recentSearches.length === 0 && watchlist.length === 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center animate-fade-in">
          <IconPackageImport size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            화물관리번호 또는 B/L번호를 입력하여
            <br />
            통관 상태를 조회하세요
          </p>
        </div>
      )}
    </div>
  );
}
