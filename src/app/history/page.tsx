"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconHistory, IconTrash, IconChevronRight, IconX, IconShip } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRecentSearches, removeRecentSearch, clearRecentSearches, SEARCH_TYPE_LABELS } from "@/lib/utils";
import type { RecentSearch } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const [searches, setSearches] = React.useState<RecentSearch[]>([]);

  React.useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  const handleSelect = (recent: RecentSearch) => {
    const params = new URLSearchParams({
      q: recent.query,
      type: recent.searchType,
    });
    router.push(`/?${params}`);
  };

  const handleRemove = (id: string) => {
    removeRecentSearch(id);
    setSearches(getRecentSearches());
  };

  const handleClearAll = () => {
    clearRecentSearches();
    setSearches([]);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <IconHistory size={20} className="text-primary" />
          <h1 className="text-lg font-bold">검색 기록</h1>
          {searches.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {searches.length}
            </Badge>
          )}
        </div>
        {searches.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-1.5 h-8"
            onClick={handleClearAll}
          >
            <IconTrash size={14} />
            전체 삭제
          </Button>
        )}
      </div>

      {searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <IconHistory size={28} className="text-muted-foreground/50" />
          </div>
          <p className="font-medium text-foreground">검색 기록이 없습니다</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            화물을 조회하면 기록이 저장됩니다
          </p>
          <Button variant="outline" className="mt-6 gap-2" onClick={() => router.push("/")}>
            <IconShip size={16} />
            화물 조회하기
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {searches.map((recent) => (
            <div
              key={recent.id}
              className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 hover:bg-accent transition-colors"
            >
              <button
                className="flex flex-1 items-center gap-3 min-w-0 text-left"
                onClick={() => handleSelect(recent)}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <IconShip size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold font-mono truncate">{recent.query}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0">
                      {SEARCH_TYPE_LABELS[recent.searchType]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {recent.cargoName && (
                      <p className="text-xs text-muted-foreground truncate">{recent.cargoName}</p>
                    )}
                    {recent.lastStatus && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        · {recent.lastStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {new Date(recent.timestamp).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <IconChevronRight
                  size={16}
                  className="text-muted-foreground shrink-0 group-hover:text-foreground"
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(recent.id);
                }}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                aria-label="삭제"
              >
                <IconX size={14} className="text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
