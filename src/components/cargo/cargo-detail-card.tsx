import * as React from "react";
import {
  IconShip,
  IconPackageImport,
  IconAnchor,
  IconPackage,
  IconMapPin,
  IconCalendar,
  IconHash,
  IconArrowRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { StatusTimeline } from "./status-timeline";
import { formatDateTime, getCurrentClearanceStatus, calcProgressPercent } from "@/lib/utils";
import { CARGO_STATUS_MAP } from "@/lib/types";
import type { CargoInfo } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CargoDetailCardProps {
  cargo: CargoInfo;
  className?: string;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/12 border border-primary/15">
        <Icon size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

export function CargoDetailCard({ cargo, className }: CargoDetailCardProps) {
  const currentStatus = getCurrentClearanceStatus(cargo.csclPrgsStts);
  const progress = calcProgressPercent(cargo.csclPrgsStts);
  const cargoStatusLabel = cargo.cargSttus
    ? CARGO_STATUS_MAP[cargo.cargSttus] ?? cargo.cargSttus
    : undefined;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 상단 요약 카드 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {cargo.cargNm || "화물명 미확인"}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground font-mono truncate">
                {cargo.cargMtNo || cargo.hblNo || cargo.mblNo || "-"}
              </p>
            </div>
            <StatusBadge status={currentStatus} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* 진행률 바 */}
          {currentStatus !== "REJECTED" && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1.5">
                <span>통관 진행률</span>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                <span>신고접수</span>
                <span>통관완료</span>
              </div>
            </div>
          )}

          {/* 항구 정보 */}
          {(cargo.ldprNm || cargo.dsprNm) && (
            <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 dark:bg-primary/8 p-3 mb-4">
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">출발항</p>
                <p className="text-sm font-semibold mt-0.5">{cargo.ldprNm ?? "-"}</p>
                {cargo.ldprCd && (
                  <p className="text-[10px] text-muted-foreground font-mono">{cargo.ldprCd}</p>
                )}
              </div>
              <IconArrowRight size={18} className="text-muted-foreground shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">도착항</p>
                <p className="text-sm font-semibold mt-0.5">{cargo.dsprNm ?? "-"}</p>
                {cargo.dsprCd && (
                  <p className="text-[10px] text-muted-foreground font-mono">{cargo.dsprCd}</p>
                )}
              </div>
            </div>
          )}

          {/* 상세 정보 목록 */}
          <Separator className="mb-2" />
          <div>
            <InfoRow icon={IconHash} label="화물관리번호" value={cargo.cargMtNo} />
            <InfoRow icon={IconAnchor} label="B/L번호" value={cargo.hblNo} />
            <InfoRow icon={IconShip} label="마스터 B/L번호" value={cargo.mblNo} />
            <InfoRow icon={IconPackage} label="포장 개수" value={cargo.pckGcnt ? `${cargo.pckGcnt}${cargo.wghtUt ?? ""}` : undefined} />
            <InfoRow icon={IconMapPin} label="화물 상태" value={cargoStatusLabel} />
            <InfoRow icon={IconCalendar} label="입항일시" value={cargo.etprDt ? formatDateTime(cargo.etprDt) : undefined} />
          </div>
        </CardContent>
      </Card>

      {/* 통관 진행 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 border border-primary/25">
              <IconPackageImport size={13} className="text-primary" />
            </div>
            통관 진행 내역
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <StatusTimeline items={cargo.csclPrgsStts} />
        </CardContent>
      </Card>
    </div>
  );
}
