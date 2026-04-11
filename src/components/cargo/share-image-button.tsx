"use client";

import * as React from "react";
import { IconPhoto } from "@tabler/icons-react";
import type { CargoInfo } from "@/lib/types";
import { calcProgressPercent, getCurrentClearanceStatus } from "@/lib/utils";

interface ShareImageButtonProps {
  cargo: CargoInfo;
  query?: string;
}

// 통관 상태 → 한국어
const STATUS_LABELS: Record<string, string> = {
  PRE_DECLARATION: "신고전",
  DECLARED: "수입신고",
  INSPECTION: "화물검사",
  EXAMINATION: "심사진행",
  DUTY_PAYMENT: "납세심사",
  CLEARED: "통관완료",
  REJECTED: "반송/취하",
  UNKNOWN: "상태불명",
};

// 통관 상태 → hex 색
const STATUS_HEX: Record<string, string> = {
  PRE_DECLARATION: "#94a3b8",
  DECLARED: "#60a5fa",
  INSPECTION: "#fbbf24",
  EXAMINATION: "#fbbf24",
  DUTY_PAYMENT: "#f97316",
  CLEARED: "#10b981",
  REJECTED: "#ef4444",
  UNKNOWN: "#94a3b8",
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split("");
  let line = "";
  let curY = y;

  for (const char of words) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
      ctx.fillText(line, x, curY);
      line = char;
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, curY);
  return curY + lineHeight;
}

async function generateCargoImage(cargo: CargoInfo, query?: string): Promise<Blob | null> {
  const W = 800;
  const H = 420;
  const PAD = 40;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const statusKey = getCurrentClearanceStatus(cargo.csclPrgsStts);
  const progress = calcProgressPercent(cargo.csclPrgsStts);
  const latestStatus =
    cargo.csclPrgsStts[cargo.csclPrgsStts.length - 1]?.prgsSttsNm ||
    STATUS_LABELS[statusKey] ||
    "확인중";
  const statusColor = STATUS_HEX[statusKey] || "#94a3b8";
  const cargoNumber = cargo.cargMtNo || cargo.hblNo || cargo.mblNo || query || "";

  // ── 배경 ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = "#0f172a"; // dark slate
  ctx.fillRect(0, 0, W, H);

  // 상단 컬러 스트라이프
  ctx.fillStyle = statusColor;
  ctx.fillRect(0, 0, W, 6);

  // ── 앱 로고/이름 ─────────────────────────────────────────────────────────
  ctx.fillStyle = "#64748b";
  ctx.font = "500 13px -apple-system, sans-serif";
  ctx.fillText("화물통관 조회", PAD, PAD + 16);

  // ── 화물명 ───────────────────────────────────────────────────────────────
  ctx.fillStyle = "#f1f5f9";
  ctx.font = "700 28px -apple-system, sans-serif";
  const cargoName = cargo.cargNm || "화물명 미확인";
  const nameY = wrapText(ctx, cargoName, PAD, PAD + 54, W - PAD * 2 - 160, 38);

  // ── 화물번호 ─────────────────────────────────────────────────────────────
  if (cargoNumber) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 14px monospace";
    ctx.fillText(cargoNumber, PAD, nameY + 4);
  }

  // ── 상태 배지 (우상단) ────────────────────────────────────────────────────
  const badgeX = W - PAD - 160;
  const badgeY = PAD + 44;
  const badgeW = 160;
  const badgeH = 38;
  const radius = 10;

  ctx.beginPath();
  ctx.moveTo(badgeX + radius, badgeY);
  ctx.lineTo(badgeX + badgeW - radius, badgeY);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + radius);
  ctx.lineTo(badgeX + badgeW, badgeY + badgeH - radius);
  ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - radius, badgeY + badgeH);
  ctx.lineTo(badgeX + radius, badgeY + badgeH);
  ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - radius);
  ctx.lineTo(badgeX, badgeY + radius);
  ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
  ctx.closePath();
  ctx.fillStyle = statusColor + "22"; // 반투명 배경
  ctx.fill();
  ctx.strokeStyle = statusColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = statusColor;
  ctx.font = "600 14px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(latestStatus, badgeX + badgeW / 2, badgeY + badgeH / 2 + 5);
  ctx.textAlign = "left";

  // ── 구분선 ────────────────────────────────────────────────────────────────
  const divY = Math.max(nameY + 36, PAD + 130);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, divY);
  ctx.lineTo(W - PAD, divY);
  ctx.stroke();

  // ── 진행률 섹션 ──────────────────────────────────────────────────────────
  const barY = divY + 28;
  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 12px -apple-system, sans-serif";
  ctx.fillText("통관 진행률", PAD, barY);
  ctx.fillStyle = statusColor;
  ctx.font = "700 16px -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`${progress}%`, W - PAD, barY);
  ctx.textAlign = "left";

  // 진행 바
  const barTrackY = barY + 12;
  const barH = 8;
  const barW = W - PAD * 2;
  const barRadius = barH / 2;

  ctx.beginPath();
  ctx.roundRect(PAD, barTrackY, barW, barH, barRadius);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  const fillW = Math.max((barW * progress) / 100, barH);
  ctx.beginPath();
  ctx.roundRect(PAD, barTrackY, fillW, barH, barRadius);
  const grad = ctx.createLinearGradient(PAD, 0, PAD + fillW, 0);
  grad.addColorStop(0, statusColor + "aa");
  grad.addColorStop(1, statusColor);
  ctx.fillStyle = grad;
  ctx.fill();

  // 단계 레이블
  const stageLabels = ["신고접수", "심사", "납세", "통관완료"];
  const stageCount = stageLabels.length;
  ctx.fillStyle = "#475569";
  ctx.font = "400 10px -apple-system, sans-serif";
  stageLabels.forEach((label, i) => {
    const lx = PAD + (barW / (stageCount - 1)) * i;
    ctx.textAlign = i === 0 ? "left" : i === stageCount - 1 ? "right" : "center";
    ctx.fillText(label, lx, barTrackY + barH + 16);
  });
  ctx.textAlign = "left";

  // ── 하단 메타 정보 ────────────────────────────────────────────────────────
  const metaY = H - PAD - 8;
  const meta: string[] = [];
  if (cargo.ldprNm && cargo.dsprNm) meta.push(`${cargo.ldprNm} → ${cargo.dsprNm}`);
  if (cargo.shipNm) meta.push(`선박: ${cargo.shipNm}`);
  if (cargo.etprDt) meta.push(`입항: ${cargo.etprDt.slice(0, 8)}`);

  if (meta.length > 0) {
    ctx.fillStyle = "#475569";
    ctx.font = "400 12px -apple-system, sans-serif";
    ctx.fillText(meta.join("  ·  "), PAD, metaY);
  }

  // URL 힌트
  ctx.fillStyle = "#334155";
  ctx.font = "400 11px monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    typeof window !== "undefined" ? window.location.hostname : "oversea-tracking",
    W - PAD,
    metaY
  );
  ctx.textAlign = "left";

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function ShareImageButton({ cargo, query }: ShareImageButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const blob = await generateCargoImage(cargo, query);
      if (!blob) return;

      const cargoNumber = cargo.cargMtNo || cargo.hblNo || cargo.mblNo || query || "cargo";
      const filename = `화물현황_${cargoNumber}.png`;

      // Web Share API (파일 공유 지원 여부 확인)
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [new File([blob], filename, { type: "image/png" })] })
      ) {
        const file = new File([blob], filename, { type: "image/png" });
        await navigator.share({ files: [file], title: "화물통관 현황" });
      } else {
        // fallback: 다운로드
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      // AbortError(사용자 취소) 또는 기타 오류 무시
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={isGenerating}
      className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-50"
      aria-label="현황 이미지 저장/공유"
      title="현황 이미지"
    >
      <IconPhoto size={15} className="text-muted-foreground" />
    </button>
  );
}
