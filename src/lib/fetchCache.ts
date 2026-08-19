// 包一層記憶體快取在 Strapi fetch 外面：同一個 request URL 在 TTL 內重複打，直接回快取，不重打 Strapi。
// 這是 per-pod 的記憶體快取（不同 replica 各自維護一份、不共用；重啟或部署就會清空）——
// 換取的是實作簡單、不用碰 ops-tech 的 nginx sidecar 或 CDN 層。專案目前完全沒有其他快取層，
// 每個請求都是即時打 Strapi，這裡先解決最大宗的重複打（同一份導覽列/區塊資料被每個訪客重複打）。
const cache = new Map<string, { expires: number; data: unknown }>();

// 只分兩檔：新聞流（最新 N 篇這類，讀者期待「差不多馬上看得到」新文章）跟導覽列／人工套版
// （後台手動關聯挑選、改動頻率低，可以放久一點）。文章/專家內頁單篇內容發布後基本不太會再改，
// 也歸在 NAV 這檔，減少對高流量單篇頁面的 Strapi 打擾。
export const CACHE_TTL = {
    NEWS: 3 * 60 * 1000,
    NAV: 10 * 60 * 1000,
} as const;

// 呼叫端寫法跟原本裸 fetch 幾乎一樣：await cachedFetchJson<T>(url, { headers }, CACHE_TTL.XXX)，
// 回傳值就是 res.json() 的結果；non-2xx response 回 null，呼叫端原本的 `if (res.ok)` 判斷改成判斷回傳值是否為 null。
// import.meta.env.DEV 在 `astro dev` 時是 true、`astro build` 出來的版本是 false（不受環境變數影響，
// build time 就決定了），所以本機開發永遠繞過快取直接打 Strapi，看到的都是最新資料；
// 快取只在 build 出來、實際部署（testing/production）的版本上生效。
export async function cachedFetchJson<T>(
    url: string,
    init: RequestInit,
    ttlMs: number,
): Promise<T | null> {
    if (import.meta.env.DEV) {
        const res = await fetch(url, init);
        return res.ok ? ((await res.json()) as T) : null;
    }

    const now = Date.now();
    const hit = cache.get(url);
    if (hit && hit.expires > now) {
        return hit.data as T;
    }
    const res = await fetch(url, init);
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    cache.set(url, { expires: now + ttlMs, data });
    return data;
}
