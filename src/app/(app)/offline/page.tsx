"use client";

import { IconWifiOff, IconPackageImport, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <IconWifiOff size={36} className="text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold">인터넷 연결 없음</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        화물 통관 조회를 위해서는 인터넷 연결이 필요합니다.
        <br />
        네트워크 상태를 확인한 후 다시 시도해 주세요.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/app">
            <IconPackageImport size={16} />
            홈으로
          </Link>
        </Button>
        <Button onClick={() => window.location.reload()} className="gap-2">
          <IconRefresh size={16} />
          다시 시도
        </Button>
      </div>
    </div>
  );
}
