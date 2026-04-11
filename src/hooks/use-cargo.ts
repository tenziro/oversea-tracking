"use client";

import * as React from "react";
import { fetchCargoStatus } from "@/lib/api";
import { saveRecentSearch } from "@/lib/utils";
import { queueSearch } from "@/lib/sync";
import type { CargoApiResponse, SearchType } from "@/lib/types";

interface UseCargoState {
  data: CargoApiResponse | null;
  isLoading: boolean;
  error: string | null;
  isQueued: boolean; // 오프라인 큐잉 여부 (Background Sync)
}

export function useCargo() {
  const [state, setState] = React.useState<UseCargoState>({
    data: null,
    isLoading: false,
    error: null,
    isQueued: false,
  });

  const search = React.useCallback(async (query: string, searchType: SearchType) => {
    setState({ data: null, isLoading: true, error: null, isQueued: false });

    try {
      const result = await fetchCargoStatus(query, searchType);

      if (result.success && result.data) {
        saveRecentSearch({
          query,
          searchType,
          cargoName: result.data.cargNm,
          lastStatus: result.data.csclPrgsStts[result.data.csclPrgsStts.length - 1]?.prgsSttsNm,
        });
      }

      setState({
        data: result,
        isLoading: false,
        error: result.success ? null : (result.error ?? "알 수 없는 오류가 발생했습니다."),
        isQueued: false,
      });
    } catch {
      // 오프라인이면 Background Sync로 큐잉
      if (!navigator.onLine) {
        const queued = await queueSearch(query, searchType);
        setState({
          data: null,
          isLoading: false,
          error: null,
          isQueued: queued,
        });
        if (!queued) {
          // Background Sync 미지원 — 일반 오프라인 에러
          setState({
            data: null,
            isLoading: false,
            error: "오프라인 상태입니다. 연결 후 다시 시도해 주세요.",
            isQueued: false,
          });
        }
      } else {
        setState({
          data: null,
          isLoading: false,
          error: "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.",
          isQueued: false,
        });
      }
    }
  }, []);

  const reset = React.useCallback(() => {
    setState({ data: null, isLoading: false, error: null, isQueued: false });
  }, []);

  return { ...state, search, reset };
}
