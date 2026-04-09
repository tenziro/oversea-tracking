import * as React from "react";
import { Badge } from "@/components/ui/badge";
import type { ClearanceStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ClearanceStatus,
  { label: string; variant: "pending" | "info" | "warning" | "success" | "destructive" }
> = {
  PRE_DECLARATION: { label: "신고전", variant: "pending" },
  DECLARED: { label: "신고접수", variant: "info" },
  INSPECTION: { label: "검사진행", variant: "warning" },
  EXAMINATION: { label: "심사진행", variant: "warning" },
  DUTY_PAYMENT: { label: "납세대기", variant: "warning" },
  CLEARED: { label: "통관완료", variant: "success" },
  REJECTED: { label: "반송/취하", variant: "destructive" },
  UNKNOWN: { label: "상태미확인", variant: "pending" },
};

interface StatusBadgeProps {
  status: ClearanceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNKNOWN;
  return (
    <Badge variant={config.variant} className={cn("font-medium", className)}>
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };
