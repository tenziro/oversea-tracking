"use client";

import * as React from "react";
import {
  IconShip,
  IconHistory as IconClockHistory,
  IconTrash,
  IconChevronRight,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { SearchForm } from "@/components/cargo/search-form";
import { CargoDetailCard } from "@/components/cargo/cargo-detail-card";
import { CargoDetailSkeleton } from "@/components/cargo/cargo-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCargo } from "@/hooks/use-cargo";
import {
  getRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
  SEARCH_TYPE_LABELS,
} from "@/lib/utils";
import type { RecentSearch, SearchType } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { data, isLoading, error, search, reset } = useCargo();
  const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);
  const resultRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearch = React.useCallback(
    async (query: string, searchType: SearchType) => {
      setHasSearched(true);
      await search(query, searchType);
      // 결과 영역으로 스크롤
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      // 최근 검색 업데이트
      setRecentSearches(getRecentSearches());
    },
    [search]
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

  const handleReset = () => {
    reset();
    setHasSearched(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* 헤로 섹션 */}
      {!hasSearched && (
        <div className="text-center py-4 animate-fade-in">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <IconShip size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">화물통관 조회</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            화물관리번호 또는 B/L번호로
            <br />
            통관 진행 상태를 확인하세요
          </p>
        </div>
      )}

      {/* 검색 폼 */}
      <div className={cn("rounded-xl border bg-card p-4 shadow-sm", hasSearched && "sticky top-16 z-30 backdrop-blur")}>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* 결과 영역 */}
      <div ref={resultRef}>
        {isLoading && <CargoDetailSkeleton />}

        {error && !isLoading && (
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

        {data?.success && data.data && !isLoading && (
          <div className="animate-fade-in">
            <CargoDetailCard cargo={data.data} />
          </div>
        )}
      </div>

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
      {!hasSearched && recentSearches.length === 0 && (
        <div className="rounded-xl border border-dashed bg-muted/30 py-10 text-center animate-fade-in">
          <IconShip size={32} className="mx-auto mb-3 text-muted-foreground/40" />
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
