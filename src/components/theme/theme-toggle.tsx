'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const themeOptions = [
  { value: 'light', label: '라이트', icon: IconSun },
  { value: 'dark', label: '다크', icon: IconMoon },
  { value: 'system', label: '시스템', icon: IconDeviceDesktop },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn('flex rounded-xl border bg-muted p-1 gap-1', className)}
      >
        {themeOptions.map((opt) => (
          <div
            key={opt.value}
            className="h-9 w-20 rounded-lg bg-muted-foreground/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex rounded-xl border bg-muted p-1 gap-1', className)}>
      {themeOptions.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={`${label} 테마로 변경`}
        >
          <Icon size={15} />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </div>
  );
}

// 헤더용 작은 아이콘 토글
export function ThemeIconToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-8 w-8" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 rounded-xl', className)}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      aria-label="테마 전환"
    >
      {resolvedTheme === 'dark' ? (
        <IconSun size={17} />
      ) : (
        <IconMoon size={17} />
      )}
    </Button>
  );
}
