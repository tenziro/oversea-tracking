"use client";

import * as React from "react";
import {
  IconFileText,
  IconSearch,
  IconEyeCheck,
  IconCoinEuro,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconHelpCircle,
  IconChevronDown,
  IconBuilding,
  IconHash,
  IconArrowRight,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { ClearanceProgressItem } from "@/lib/types";
import { CLEARANCE_STATUS_MAP } from "@/lib/types";

interface StatusTimelineProps {
  items: ClearanceProgressItem[];
  className?: string;
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  PRE_DECLARATION: IconClock,
  DECLARED: IconFileText,
  INSPECTION: IconSearch,
  EXAMINATION: IconEyeCheck,
  DUTY_PAYMENT: IconCoinEuro,
  CLEARED: IconCircleCheck,
  REJECTED: IconAlertTriangle,
  UNKNOWN: IconHelpCircle,
};

const STATUS_COLORS: Record<string, string> = {
  PRE_DECLARATION: "text-muted-foreground",
  DECLARED: "text-blue-400 dark:text-blue-400",
  INSPECTION: "text-amber-400 dark:text-amber-400",
  EXAMINATION: "text-amber-400 dark:text-amber-400",
  DUTY_PAYMENT: "text-orange-400 dark:text-orange-400",
  CLEARED: "text-emerald-500 dark:text-emerald-400",
  REJECTED: "text-red-500 dark:text-red-400",
};

const STATUS_BG: Record<string, string> = {
  PRE_DECLARATION: "bg-muted",
  DECLARED: "bg-blue-50 dark:bg-blue-500/12",
  INSPECTION: "bg-amber-50 dark:bg-amber-500/12",
  EXAMINATION: "bg-amber-50 dark:bg-amber-500/12",
  DUTY_PAYMENT: "bg-orange-50 dark:bg-orange-500/12",
  CLEARED: "bg-emerald-50 dark:bg-emerald-500/15",
  REJECTED: "bg-red-50 dark:bg-red-500/12",
};

// 단계별 상세 안내 텍스트
const STATUS_GUIDANCE: Record<string, string> = {
  PRE_DECLARATION: "화물이 수입지에 도착했으나 아직 수입신고가 이루어지지 않은 상태입니다.",
  DECLARED: "세관에 수입신고가 접수된 상태입니다. 심사 또는 검사가 진행될 수 있습니다.",
  INSPECTION: "세관 검사관에 의해 화물 실물 검사가 진행 중입니다. 검사 후 결과에 따라 다음 단계로 진행됩니다.",
  EXAMINATION: "세관 심사관이 신고 서류를 검토 중입니다. 추가 서류 제출이 요청될 수 있습니다.",
  DUTY_PAYMENT: "납부해야 할 관세 및 세금이 결정되었습니다. 납부 완료 후 통관이 진행됩니다.",
  CLEARED: "모든 통관 절차가 완료되었습니다. 화물을 수령할 수 있습니다.",
  REJECTED: "화물이 반송되거나 수입신고가 취하되었습니다. 세관 또는 관련 기관에 문의하세요.",
};

function formatElapsed(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 ${hours % 24}시간`;
  if (hours > 0) return `${hours}시간 ${minutes % 60}분`;
  if (minutes > 0) return `${minutes}분`;
  return "1분 미만";
}

function parseDateTime(dt: string | undefined): number | null {
  if (!dt || dt.length < 8) return null;
  // YYYYMMDDHHmmss 형식
  const year = parseInt(dt.slice(0, 4));
  const month = parseInt(dt.slice(4, 6)) - 1;
  const day = parseInt(dt.slice(6, 8));
  const hour = dt.length >= 10 ? parseInt(dt.slice(8, 10)) : 0;
  const minute = dt.length >= 12 ? parseInt(dt.slice(10, 12)) : 0;
  const sec = dt.length >= 14 ? parseInt(dt.slice(12, 14)) : 0;
  const d = new Date(year, month, day, hour, minute, sec);
  return isNaN(d.getTime()) ? null : d.getTime();
}

export function StatusTimeline({ items, className }: StatusTimelineProps) {
  const [expandedIdx, setExpandedIdx] = React.useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <div className={cn("py-8 text-center text-muted-foreground", className)}>
        <IconClock size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">통관 진행 내역이 없습니다.</p>
      </div>
    );
  }

  // 최신 순으로 정렬 — prcsDttm(API 가이드) 또는 prcsDt(이전) 사용
  const getTime = (item: ClearanceProgressItem) =>
    parseInt(item.prcsDttm || item.prcsDt || "0");

  const sortedItems = [...items].sort((a, b) => getTime(b) - getTime(a));

  return (
    <div className={cn("space-y-0", className)}>
      {sortedItems.map((item, idx) => {
        const mapped = CLEARANCE_STATUS_MAP[item.prgsStts];
        const statusKey = mapped?.status ?? "UNKNOWN";
        const Icon = STATUS_ICONS[statusKey] ?? IconFileText;
        const iconColor = STATUS_COLORS[statusKey] ?? "text-muted-foreground";
        const iconBg = STATUS_BG[statusKey] ?? "bg-muted";
        const isLatest = idx === 0;
        const isLast = idx === sortedItems.length - 1;
        const isExpanded = expandedIdx === idx;

        // 다음 항목(시간순으로 이전 단계)과의 소요 시간 계산
        const nextItem = sortedItems[idx + 1];
        let elapsedLabel: string | null = null;
        if (nextItem) {
          const thisTs = parseDateTime(item.prcsDttm ?? item.prcsDt);
          const prevTs = parseDateTime(nextItem.prcsDttm ?? nextItem.prcsDt);
          if (thisTs !== null && prevTs !== null && thisTs > prevTs) {
            elapsedLabel = formatElapsed(thisTs - prevTs);
          }
        }

        const hasDetails =
          !!item.shedNm ||
          !!item.rlbrCn ||
          !!item.bfnnGdncCn ||
          !!item.dclrNo ||
          !!STATUS_GUIDANCE[statusKey];

        return (
          <div key={item.snIdx || idx} className="flex gap-4">
            {/* 타임라인 선 + 아이콘 */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
                  iconBg,
                  isLatest && "ring-2 ring-offset-2 ring-offset-background ring-primary/40 dark:ring-primary/30"
                )}
              >
                <Icon size={17} className={cn(iconColor, isLatest && "animate-pulse")} />
              </div>
              {!isLast && (
                <div className="relative mt-1 w-px flex-1 bg-border min-h-[2rem]">
                  {/* 소요 시간 표시 */}
                  {elapsedLabel && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-background border border-border rounded-full px-1.5 py-0.5 whitespace-nowrap">
                      <IconArrowRight size={9} className="text-muted-foreground/60" />
                      <span className="text-[9px] text-muted-foreground">{elapsedLabel}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 내용 */}
            <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
              <button
                type="button"
                className={cn(
                  "w-full text-left",
                  hasDetails && "cursor-pointer"
                )}
                onClick={() => hasDetails && setExpandedIdx(isExpanded ? null : idx)}
                disabled={!hasDetails}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isLatest ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {item.prgsSttsNm || item.csclPrgsSttsNm || mapped?.label || "진행중"}
                      </p>
                      {hasDetails && (
                        <IconChevronDown
                          size={13}
                          className={cn(
                            "text-muted-foreground transition-transform shrink-0",
                            isExpanded && "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(item.prcsDttm ?? item.prcsDt ?? "")}
                  </time>
                </div>
                {isLatest && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-medium text-primary">현재 상태</span>
                  </div>
                )}
              </button>

              {/* 펼침 상세 */}
              {isExpanded && (
                <div className="mt-2 rounded-lg border bg-muted/30 p-3 space-y-2 text-xs text-muted-foreground">
                  {STATUS_GUIDANCE[statusKey] && (
                    <p className="leading-relaxed">{STATUS_GUIDANCE[statusKey]}</p>
                  )}
                  {item.dclrNo && (
                    <div className="flex items-center gap-1.5">
                      <IconHash size={11} className="shrink-0" />
                      <span className="font-mono">신고번호: {item.dclrNo}</span>
                    </div>
                  )}
                  {item.shedNm && (
                    <div className="flex items-center gap-1.5">
                      <IconBuilding size={11} className="shrink-0" />
                      <span>장치장: {item.shedNm} {item.shedSgn ? `(${item.shedSgn})` : ""}</span>
                    </div>
                  )}
                  {item.rlbrCn && (
                    <p className="leading-relaxed">{item.rlbrCn}</p>
                  )}
                  {item.bfnnGdncCn && (
                    <p className="leading-relaxed border-t pt-2">{item.bfnnGdncCn}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
