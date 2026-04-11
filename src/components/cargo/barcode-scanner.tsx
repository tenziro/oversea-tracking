"use client";

import * as React from "react";
import { IconQrcode, IconCameraOff } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// BarcodeDetector API 타입 선언 (TypeScript 표준 미포함)
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorInstance {
  detect(
    source: HTMLVideoElement | HTMLImageElement | ImageBitmap
  ): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new(options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats(): Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

interface BarcodeScannerProps {
  /** 바코드 감지 시 호출 — 상위에서 query 세팅 및 검색 실행 */
  onResult: (value: string) => void;
}

/**
 * 카메라로 바코드/QR 코드를 스캔하여 화물번호를 자동 입력합니다.
 * BarcodeDetector API가 미지원이면 null을 렌더링합니다 (Chrome/Edge/Safari 17+).
 */
export function BarcodeScanner({ onResult }: BarcodeScannerProps) {
  const [open, setOpen] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const detectorRef = React.useRef<BarcodeDetectorInstance | null>(null);

  React.useEffect(() => {
    setIsSupported("BarcodeDetector" in window);
  }, []);

  const stopCamera = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraError(null);
  }, []);

  const startCamera = React.useCallback(async () => {
    if (!window.BarcodeDetector) return;
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const formats = [
        "code_128",
        "code_39",
        "qr_code",
        "data_matrix",
        "ean_13",
        "ean_8",
        "itf",
      ];
      detectorRef.current = new window.BarcodeDetector({ formats });

      // 500ms 간격으로 바코드 감지
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current || !detectorRef.current) return;
        if (videoRef.current.readyState < 2) return; // 비디오 준비 대기

        try {
          const barcodes = await detectorRef.current.detect(videoRef.current);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, "");
            if (cleaned.length >= 4) {
              stopCamera();
              setOpen(false);
              onResult(cleaned);
            }
          }
        } catch {
          // 감지 오류 무시
        }
      }, 500);
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setCameraError("카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해 주세요.");
        } else if (err.name === "NotFoundError") {
          setCameraError("카메라를 찾을 수 없습니다.");
        } else {
          setCameraError("카메라를 시작할 수 없습니다.");
        }
      } else {
        setCameraError("카메라를 시작할 수 없습니다.");
      }
    }
  }, [onResult, stopCamera]);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        startCamera();
      } else {
        stopCamera();
      }
    },
    [startCamera, stopCamera]
  );

  if (!isSupported) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-input bg-background hover:bg-accent transition-colors"
        aria-label="바코드 스캔으로 입력"
        title="바코드 스캔"
      >
        <IconQrcode size={17} className="text-muted-foreground" />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm p-0 overflow-hidden gap-0">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-base flex items-center gap-2">
              <IconQrcode size={18} />
              바코드 스캔
            </DialogTitle>
          </DialogHeader>

          {/* 카메라 프리뷰 */}
          <div className="relative bg-black aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
            />
            {/* 스캔 가이드 오버레이 */}
            {!cameraError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-3/4 h-1/2">
                  {/* 모서리 마커 */}
                  <span className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl" />
                  <span className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr" />
                  <span className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
                  <span className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
                  {/* 스캔 라인 애니메이션 */}
                  <span className="absolute left-0 right-0 h-0.5 bg-primary/60 top-1/2 animate-pulse" />
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3">
            {cameraError ? (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <IconCameraOff size={16} className="shrink-0 mt-0.5" />
                <p>{cameraError}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                화물번호 또는 B/L번호가 담긴 바코드를 카메라에 비춰주세요
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
