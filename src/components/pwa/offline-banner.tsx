"use client";

import * as React from "react";
import { IconWifi, IconWifiOff } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [wasOffline, setWasOffline] = React.useState(false);
  const [showReconnected, setShowReconnected] = React.useState(false);

  React.useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        "fixed top-14 left-0 right-0 z-50 transition-all duration-300",
        "animate-in slide-in-from-top-2"
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium",
          isOnline
            ? "bg-green-500 text-white"
            : "bg-amber-500 text-white"
        )}
      >
        {isOnline ? (
          <>
            <IconWifi size={16} />
            <span>인터넷에 다시 연결되었습니다</span>
          </>
        ) : (
          <>
            <IconWifiOff size={16} />
            <span>오프라인 모드 — 저장된 데이터를 표시합니다</span>
          </>
        )}
      </div>
    </div>
  );
}
