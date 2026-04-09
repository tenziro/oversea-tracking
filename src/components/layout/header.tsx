"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconShip, IconSettings } from "@tabler/icons-react";
import { ThemeIconToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const PAGE_TITLES: Record<string, string> = {
  "/": "화물통관 조회",
  "/settings": "설정",
};

export function Header() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "화물통관 조회";
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex h-14 items-center px-4 gap-3">
        {/* 로고/타이틀 */}
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <IconShip size={18} />
          </div>
          {isHome && (
            <span className="text-base font-bold text-foreground hidden sm:block">
              화물통관 조회
            </span>
          )}
        </Link>

        {/* 페이지 제목 (모바일) */}
        {!isHome && (
          <h1 className="flex-1 text-base font-semibold">{title}</h1>
        )}

        <div className="flex-1" />

        {/* 우측 액션 */}
        <div className="flex items-center gap-1">
          <ThemeIconToggle />
          {isHome && (
            <Link href="/settings">
              <button
                className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
                aria-label="설정"
              >
                <IconSettings size={18} className="text-muted-foreground" />
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
