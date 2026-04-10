"use client";

import * as React from "react";
import { IconDownload, IconX, IconPackageImport } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    // 이미 설치된 경우
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // 이미 닫은 경우
    const isDismissed = sessionStorage.getItem("pwa_install_dismissed");
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("pwa_install_dismissed", "1");
  };

  if (isInstalled || dismissed || !deferredPrompt) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 rounded-xl border bg-card shadow-lg",
        "animate-in slide-in-from-bottom-5"
      )}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      role="dialog"
      aria-label="앱 설치 안내"
    >
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 text-primary">
          <IconPackageImport size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">앱으로 설치하기</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            홈 화면에 추가하면 더 빠르게 이용할 수 있어요
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={handleInstall} className="h-8 gap-1.5">
            <IconDownload size={14} />
            설치
          </Button>
          <button
            onClick={handleDismiss}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label="닫기"
          >
            <IconX size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
