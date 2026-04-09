import * as React from "react";
import {
  IconFileText,
  IconSearch,
  IconMicroscope,
  IconCoinEuro,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
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
  EXAMINATION: IconMicroscope,
  DUTY_PAYMENT: IconCoinEuro,
  CLEARED: IconCircleCheck,
  REJECTED: IconAlertTriangle,
};

const STATUS_COLORS: Record<string, string> = {
  PRE_DECLARATION: "text-muted-foreground",
  DECLARED: "text-blue-500",
  INSPECTION: "text-amber-500",
  EXAMINATION: "text-amber-500",
  DUTY_PAYMENT: "text-orange-500",
  CLEARED: "text-green-500",
  REJECTED: "text-red-500",
};

const STATUS_BG: Record<string, string> = {
  PRE_DECLARATION: "bg-muted",
  DECLARED: "bg-blue-100 dark:bg-blue-900/20",
  INSPECTION: "bg-amber-100 dark:bg-amber-900/20",
  EXAMINATION: "bg-amber-100 dark:bg-amber-900/20",
  DUTY_PAYMENT: "bg-orange-100 dark:bg-orange-900/20",
  CLEARED: "bg-green-100 dark:bg-green-900/20",
  REJECTED: "bg-red-100 dark:bg-red-900/20",
};

export function StatusTimeline({ items, className }: StatusTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className={cn("py-8 text-center text-muted-foreground", className)}>
        <IconClock size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">통관 진행 내역이 없습니다.</p>
      </div>
    );
  }

  // 최신 순으로 정렬
  const sortedItems = [...items].sort((a, b) => {
    const aTime = parseInt(a.prcsDt || "0");
    const bTime = parseInt(b.prcsDt || "0");
    return bTime - aTime;
  });

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

        return (
          <div key={item.snIdx || idx} className="flex gap-4">
            {/* 타임라인 선 + 아이콘 */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
                  iconBg,
                  isLatest && "ring-2 ring-offset-2 ring-offset-background ring-primary/50"
                )}
              >
                <Icon size={17} className={cn(iconColor, isLatest && "animate-pulse")} />
              </div>
              {!isLast && (
                <div className="mt-1 w-px flex-1 bg-border min-h-[2rem]" />
              )}
            </div>

            {/* 내용 */}
            <div className={cn("pb-6 flex-1 min-w-0", isLast && "pb-0")}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isLatest ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {item.prgsSttsNm || item.csclPrgsSttsNm || mapped?.label || "진행중"}
                  </p>
                  {item.dclrNo && (
                    <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                      신고번호: {item.dclrNo}
                    </p>
                  )}
                </div>
                <time className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDateTime(item.prcsDt)}
                </time>
              </div>
              {isLatest && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-medium text-primary">현재 상태</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
