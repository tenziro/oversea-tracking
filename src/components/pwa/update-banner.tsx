"use client";

import * as React from "react";
import { IconRefresh, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function UpdateBanner() {
  const [showUpdate, setShowUpdate] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      // 이미 대기 중인 SW가 있는 경우
      if (registration.waiting) {
        setShowUpdate(true);
        return;
      }

      // 새 SW가 설치되어 대기하는 경우
      const handleUpdateFound = () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setShowUpdate(true);
          }
        });
      };

      registration.addEventListener("updatefound", handleUpdateFound);
      return () => registration.removeEventListener("updatefound", handleUpdateFound);
    });
  }, []);

  const handleUpdate = () => {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });

    // SW 교체 후 페이지 리로드
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowUpdate(false);
  };

  if (!showUpdate || dismissed) return null;

  return (
    <div
      className={cn(
        "fixed top-14 left-0 right-0 z-50 animate-in slide-in-from-top-2"
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
      role="alert"
    >
      <div className="flex items-center gap-3 bg-primary px-4 py-2.5 text-primary-foreground">
        <IconRefresh size={16} className="shrink-0" />
        <p className="flex-1 text-sm font-medium">새 버전이 있습니다</p>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleUpdate}
          >
            업데이트
          </Button>
          <button
            onClick={handleDismiss}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label="닫기"
          >
            <IconX size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
