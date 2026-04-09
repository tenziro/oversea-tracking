"use client";

import * as React from "react";
import { fetchCargoStatus } from "@/lib/api";
import { saveRecentSearch } from "@/lib/utils";
import type { CargoApiResponse, SearchType } from "@/lib/types";

interface UseCargoState {
  data: CargoApiResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useCargo() {
  const [state, setState] = React.useState<UseCargoState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const search = React.useCallback(async (query: string, searchType: SearchType) => {
    setState({ data: null, isLoading: true, error: null });

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
      });
    } catch {
      setState({
        data: null,
        isLoading: false,
        error: "네트워크 오류가 발생했습니다. 연결 상태를 확인해 주세요.",
      });
    }
  }, []);

  const reset = React.useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, search, reset };
}
