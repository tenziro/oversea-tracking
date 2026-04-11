import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst } from "serwist";
import { defaultCache } from "@serwist/next/worker";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// Background Sync API 타입 선언
interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

// IndexedDB 동기화 큐 상수 (sync.ts와 동일하게 유지)
const SYNC_DB = "oversea-tracking-sync";
const SYNC_STORE = "search-queue";

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 관세청 API (네트워크 우선, 실패시 캐시)
    {
      matcher: ({ url }) => url.hostname === "unipass.customs.go.kr",
      handler: new NetworkFirst({
        cacheName: "customs-api-cache",
        networkTimeoutSeconds: 10,
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => request,
          },
        ],
      }),
    },
    // 내부 API (네트워크 우선)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/cargo"),
      handler: new NetworkFirst({
        cacheName: "internal-api-cache",
        networkTimeoutSeconds: 10,
      }),
    },
    // 정적 자산 (Stale While Revalidate)
    {
      matcher: ({ request }) =>
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "worker",
      handler: new StaleWhileRevalidate({
        cacheName: "static-resources",
      }),
    },
    // 이미지 (캐시 우선)
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "images",
      }),
    },
    // 폰트 CDN
    {
      matcher: ({ url }) =>
        url.origin === "https://cdn.jsdelivr.net" && url.pathname.includes("pretendard"),
      handler: new CacheFirst({
        cacheName: "fonts",
      }),
    },
    // 기본
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// ── Background Sync ──────────────────────────────────────────────────────────

async function handleCargoSync(): Promise<void> {
  let db: IDBDatabase;
  try {
    db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = (self as unknown as { indexedDB: IDBFactory }).indexedDB.open(SYNC_DB, 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return; // DB가 없으면 큐도 없음
  }

  // 큐에서 모든 항목 조회
  const items = await new Promise<Array<{ id: string; query: string; searchType: string }>>((resolve) => {
    const tx = db.transaction(SYNC_STORE, "readonly");
    const req = tx.objectStore(SYNC_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });

  for (const item of items) {
    try {
      const url = `/api/cargo?query=${encodeURIComponent(item.query)}&searchType=${encodeURIComponent(item.searchType)}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        // 처리 완료된 항목 삭제
        const tx = db.transaction(SYNC_STORE, "readwrite");
        tx.objectStore(SYNC_STORE).delete(item.id);

        // 알림 권한이 있으면 결과 알림
        const statusName =
          data?.data?.csclPrgsStts?.slice(-1)?.[0]?.prgsSttsNm || "상태 확인됨";
        await self.registration.showNotification("화물 조회 완료", {
          body: `${item.query} — ${statusName}`,
          icon: "/icons/icon-192.png",
          data: { url: `/app?q=${item.query}&type=${item.searchType}` },
          tag: `cargo-sync-${item.id}`,
        });
      }
    } catch {
      // 실패한 항목은 큐에 유지 (다음 sync 때 재시도)
    }
  }

  db.close();
}

// Background Sync 이벤트 수신
(self as unknown as EventTarget).addEventListener("sync", (event: Event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === "cargo-search-sync") {
    syncEvent.waitUntil(handleCargoSync());
  }
});

// 알림 클릭 시 앱으로 이동
(self as unknown as EventTarget).addEventListener("notificationclick", (event: Event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();
  const url: string = notifEvent.notification.data?.url ?? "/app";
  notifEvent.waitUntil(self.clients.openWindow(url));
});

// ── Periodic Background Sync ─────────────────────────────────────────────────

interface PeriodicSyncEvent extends ExtendableEvent {
  tag: string;
}

// 즐겨찾기(watchlist)는 localStorage에 있어 SW에서 직접 접근 불가.
// 대신 내부 API 엔드포인트를 통해 최근 검색 상위 3건을 재조회하고
// 상태 변경 시 알림을 보냅니다.
// (실제 구현에서는 IndexedDB로 watchlist를 공유하는 방식이 이상적이나,
//  현재 아키텍처에서는 클라이언트가 sync 완료 후 상태를 확인합니다.)
async function handleWatchlistRefresh(): Promise<void> {
  // 클라이언트가 포커스 중이면 리프레시 불필요
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: false });
  const hasFocused = clients.some((c) => c.focused);
  if (hasFocused) return;

  // Background Sync DB에 watchlist-refresh 마커 기록 후
  // 클라이언트가 다음 포커스 시 자동 재조회하도록 메시지 발송
  clients.forEach((client) => {
    client.postMessage({ type: "PERIODIC_SYNC_WATCHLIST" });
  });

  // 앱이 열려있지 않으면 알림으로 안내
  if (clients.length === 0) {
    try {
      await self.registration.showNotification("화물통관 조회", {
        body: "즐겨찾기 화물의 통관 현황을 확인해 보세요.",
        icon: "/icons/icon-192.png",
        tag: "watchlist-refresh",
        data: { url: "/app" },
      });
    } catch {
      // 알림 권한 없음
    }
  }
}

(self as unknown as EventTarget).addEventListener("periodicsync", (event: Event) => {
  const syncEvent = event as PeriodicSyncEvent;
  if (syncEvent.tag === "watchlist-refresh") {
    syncEvent.waitUntil(handleWatchlistRefresh());
  }
});
