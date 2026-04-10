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
  IconCopy,
  IconCheck,
  IconShare,
  IconStar,
  IconStarFilled,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "./status-badge";
import { StatusTimeline } from "./status-timeline";
import {
  formatDateTime,
  getCurrentClearanceStatus,
  calcProgressPercent,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "@/lib/utils";
import { CARGO_STATUS_MAP } from "@/lib/types";
import type { CargoInfo, SearchType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CargoDetailCardProps {
  cargo: CargoInfo;
  query?: string;
  searchType?: SearchType;
  onWatchlistChange?: () => void;
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

export function CargoDetailCard({ cargo, query, searchType, onWatchlistChange, className }: CargoDetailCardProps) {
  const currentStatus = getCurrentClearanceStatus(cargo.csclPrgsStts);
  const progress = calcProgressPercent(cargo.csclPrgsStts);
  const cargoStatusLabel = cargo.cargSttus
    ? CARGO_STATUS_MAP[cargo.cargSttus] ?? cargo.cargSttus
    : undefined;

  const cargoNumber = cargo.cargMtNo || cargo.hblNo || cargo.mblNo || "";
  const [copied, setCopied] = React.useState(false);
  const [hasClipboard, setHasClipboard] = React.useState(false);
  const [isWatchlisted, setIsWatchlisted] = React.useState(false);

  React.useEffect(() => {
    setHasClipboard("clipboard" in navigator);
  }, []);

  React.useEffect(() => {
    if (query && searchType) {
      setIsWatchlisted(isInWatchlist(query, searchType));
    }
  }, [query, searchType]);

  const handleCopyNumber = async () => {
    if (!cargoNumber || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(cargoNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    const latestStatus =
      cargo.csclPrgsStts[cargo.csclPrgsStts.length - 1]?.prgsSttsNm || "";
    const shareText = [
      `화물명: ${cargo.cargNm || cargoNumber}`,
      `화물번호: ${cargoNumber}`,
      latestStatus && `상태: ${latestStatus}`,
      `진행률: ${progress}%`,
    ]
      .filter(Boolean)
      .join("\n");
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/app` : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: `화물 통관 현황 - ${cargo.cargNm || cargoNumber}`,
          text: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // AbortError(사용자 취소) 등 무시
    }
  };

  const handleToggleWatchlist = () => {
    if (!query || !searchType) return;
    if (isWatchlisted) {
      removeFromWatchlist(query, searchType);
      setIsWatchlisted(false);
    } else {
      addToWatchlist({
        query,
        searchType,
        cargoName: cargo.cargNm,
        lastStatus:
          cargo.csclPrgsStts[cargo.csclPrgsStts.length - 1]?.prgsSttsNm,
      });
      setIsWatchlisted(true);
    }
    onWatchlistChange?.();
  };

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
              <div className="mt-1 flex items-center gap-1">
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {cargoNumber || "-"}
                </p>
                {hasClipboard && cargoNumber && (
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                    aria-label="화물번호 복사"
                  >
                    {copied ? (
                      <IconCheck size={12} className="text-green-500" />
                    ) : (
                      <IconCopy size={12} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <StatusBadge status={currentStatus} />
              <div className="flex items-center gap-0.5">
                {query && searchType && (
                  <button
                    type="button"
                    onClick={handleToggleWatchlist}
                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                    aria-label={isWatchlisted ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    {isWatchlisted ? (
                      <IconStarFilled size={15} className="text-amber-400" />
                    ) : (
                      <IconStar size={15} className="text-muted-foreground" />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleShare}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label="공유"
                >
                  <IconShare size={15} className="text-muted-foreground" />
                </button>
              </div>
            </div>
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
