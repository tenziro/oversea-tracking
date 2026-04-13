'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconPackageImport,
  IconHistory,
  IconSettings,
} from '@tabler/icons-react';
import { ThemeIconToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

const PAGE_META: Record<string, { title: string; icon: React.ElementType }> = {
  '/app': { title: '화물통관 조회', icon: IconPackageImport },
  '/history': { title: '검색 기록', icon: IconHistory },
  '/settings': { title: '설정', icon: IconSettings },
};

export function Header() {
  const pathname = usePathname();
  const meta = PAGE_META[pathname] ?? PAGE_META['/app'];
  const Icon = meta.icon;
  const isHome = pathname === '/app';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60',
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 items-center px-4 gap-3">
        {/* 로고/타이틀 */}
        <Link href="/app" className="flex items-center gap-2.5 font-bold">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 border border-primary/25 text-primary">
            <Icon size={17} />
          </div>
          <span className="text-[15px] font-bold text-foreground">
            {meta.title}
          </span>
        </Link>

        <div className="flex-1" />

        {/* 우측 액션 */}
        <div className="flex items-center gap-1">
          <ThemeIconToggle />
        </div>
      </div>
    </header>
  );
}
