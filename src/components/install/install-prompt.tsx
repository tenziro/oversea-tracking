"use client";

import * as React from "react";
import { IconDownload, IconX, IconPackageImport, IconShare, IconPlus, IconDotsCircleHorizontal } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [isIOSSafari, setIsIOSSafari] = React.useState(false);
  const [showIOSDialog, setShowIOSDialog] = React.useState(false);

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

    // iOS Safari 감지
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIOS && isSafari) {
      setIsIOSSafari(true);
      return;
    }

    // Android/Desktop: beforeinstallprompt 이벤트 대기
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

  if (isInstalled || dismissed) return null;

  // iOS Safari용 설치 안내 배너
  if (isIOSSafari) {
    return (
      <>
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
              <p className="text-sm font-semibold">홈 화면에 추가하기</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Safari에서 앱처럼 사용할 수 있어요
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowIOSDialog(true)}
                className="h-8 gap-1.5"
              >
                설치 방법
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

        <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>홈 화면에 추가하는 방법</DialogTitle>
              <DialogDescription>
                Safari 브라우저에서 아래 단계를 따라해 주세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    하단 공유 버튼 탭
                    <IconShare size={15} className="text-blue-500 shrink-0" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Safari 하단 가운데에 있는 네모+화살표 아이콘
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    &apos;홈 화면에 추가&apos; 선택
                    <IconPlus size={15} className="text-blue-500 shrink-0" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    공유 메뉴를 아래로 스크롤하여 찾으세요
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    우측 상단 &apos;추가&apos; 탭
                    <IconDotsCircleHorizontal size={15} className="text-blue-500 shrink-0" />
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    앱 이름을 확인하고 추가 버튼을 누르세요
                  </p>
                </div>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                setShowIOSDialog(false);
                handleDismiss();
              }}
            >
              확인했어요
            </Button>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Android/Desktop용 설치 배너
  if (!deferredPrompt) return null;

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
