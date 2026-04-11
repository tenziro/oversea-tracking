"use client";

import * as React from "react";
import { fetchCargoStatus } from "@/lib/api";
import { saveRecentSearch, saveCargoCache, getCargoCache } from "@/lib/utils";
import { queueSearch } from "@/lib/sync";
import type { CargoApiResponse, SearchType } from "@/lib/types";

interface UseCargoState {
  data: CargoApiResponse | null;
  isLoading: boolean;
  error: string | null;
  isQueued: boolean; // 오프라인 큐잉 여부 (Background Sync)
  cachedAt: number | null; // 캐시된 시각 (오프라인 캐시일 때)
}

export function useCargo() {
  const [state, setState] = React.useState<UseCargoState>({
    data: null,
    isLoading: false,
    error: null,
    isQueued: false,
    cachedAt: null,
  });

  const search = React.useCallback(async (query: string, searchType: SearchType) => {
    setState({ data: null, isLoading: true, error: null, isQueued: false, cachedAt: null });

    try {
      const result = await fetchCargoStatus(query, searchType);

      if (result.success && result.data) {
        saveRecentSearch({
          query,
          searchType,
          cargoName: result.data.cargNm,
          lastStatus: result.data.csclPrgsStts[result.data.csclPrgsStts.length - 1]?.prgsSttsNm,
        });
        // 최신 결과를 오프라인 캐시에 저장
        saveCargoCache(query, searchType, result.data);
      }

      setState({
        data: result,
        isLoading: false,
        error: result.success ? null : (result.error ?? "알 수 없는 오류가 발생했습니다."),
        isQueued: false,
        cachedAt: null,
      });
    } catch {
      // 오프라인이면 Background Sync로 큐잉 + 캐시에서 결과 표시
      if (!navigator.onLine) {
        // 캐시된 결과가 있으면 먼저 표시
        const cached = getCargoCache(query, searchType);

        const queued = await queueSearch(query, searchType);
        if (queued) {
          setState({
            data: cached ? { success: true, data: cached.data } : null,
            isLoading: false,
            error: null,
            isQueued: true,
            cachedAt: cached?.cachedAt ?? null,
          });
        } else {
          // Background Sync 미지원
          setState({
            data: cached ? { success: true, data: cached.data } : null,
            isLoading: false,
            error: cached
              ? null
              : "오프라인 상태입니다. 연결 후 다시 시도해 주세요.",
            isQueued: false,
            cachedAt: cached?.cachedAt ?? null,
          });
        }
      } else {
        setState({
          data: null,
          isLoading: false,
          error: "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.",
          isQueued: false,
          cachedAt: null,
        });
      }
    }
  }, []);

  const reset = React.useCallback(() => {
    setState({ data: null, isLoading: false, error: null, isQueued: false, cachedAt: null });
  }, []);

  return { ...state, search, reset };
}
