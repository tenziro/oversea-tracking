"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // 스토리지 지속성 요청 — 브라우저 자동 삭제 방지
    navigator.storage?.persist();

    // Periodic Background Sync 등록 (12시간마다 즐겨찾기 자동 조회)
    const registerPeriodicSync = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        // @ts-expect-error — Periodic Background Sync API는 TypeScript 표준 미포함
        if ("periodicSync" in reg) {
          // @ts-expect-error
          await reg.periodicSync.register("watchlist-refresh", {
            minInterval: 12 * 60 * 60 * 1000, // 12시간
          });
        }
      } catch {
        // 권한 거부 또는 미지원 브라우저
      }
    };
    registerPeriodicSync();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
