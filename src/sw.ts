import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, StaleWhileRevalidate, CacheFirst } from "serwist";
import { defaultCache } from "@serwist/next/worker";

declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

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
