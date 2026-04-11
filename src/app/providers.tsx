"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // 스토리지 지속성 요청 — 브라우저 자동 삭제 방지
    navigator.storage?.persist();
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
