import { Providers } from "../providers";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { InstallPrompt } from "@/components/install/install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { UpdateBanner } from "@/components/pwa/update-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
        <BottomNav />
      </div>
      <OfflineBanner />
      <UpdateBanner />
      <InstallPrompt />
    </Providers>
  );
}
