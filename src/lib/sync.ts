// Background Sync — 오프라인 검색 큐
// Chrome/Edge/Android 전용. 미지원 환경에서는 graceful degradation.

const SYNC_DB = "oversea-tracking-sync";
const SYNC_STORE = "search-queue";
export const SYNC_TAG = "cargo-search-sync";

export interface SyncQueueItem {
  id: string;
  query: string;
  searchType: string;
  timestamp: number;
}

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(SYNC_DB, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(SYNC_STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * 오프라인 검색을 IndexedDB에 큐잉하고 Background Sync 등록
 * @returns Background Sync 등록 성공 여부 (미지원 브라우저는 false)
 */
export async function queueSearch(query: string, searchType: string): Promise<boolean> {
  if (typeof indexedDB === "undefined") return false;
  try {
    const db = await openSyncDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(SYNC_STORE, "readwrite");
      const item: SyncQueueItem = {
        id: crypto.randomUUID(),
        query,
        searchType,
        timestamp: Date.now(),
      };
      tx.objectStore(SYNC_STORE).put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();

    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      // Background Sync API는 Chrome/Edge/Android에서만 지원
      if ("sync" in reg) {
        await (
          reg as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          }
        ).sync.register(SYNC_TAG);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
