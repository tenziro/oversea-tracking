"use client";

import * as React from "react";

/**
 * 결과 표시 중 화면 자동 꺼짐 방지 (Screen Wake Lock API)
 * @param active - true일 때 Wake Lock 취득, false일 때 해제
 */
export function useWakeLock(active: boolean) {
  const sentinelRef = React.useRef<WakeLockSentinel | null>(null);

  React.useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      if (cancelled) return;
      try {
        sentinelRef.current = await navigator.wakeLock.request("screen");
        // 브라우저가 자동 해제 시(탭 전환 등) 재취득
        sentinelRef.current.addEventListener("release", () => {
          if (!cancelled) {
            acquire();
          }
        });
      } catch {
        // 미지원 또는 권한 거부 — 무시
      }
    };

    acquire();

    // 페이지가 다시 visible이 될 때 재취득
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !sentinelRef.current) {
        acquire();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      sentinelRef.current?.release().catch(() => {});
      sentinelRef.current = null;
    };
  }, [active]);
}
