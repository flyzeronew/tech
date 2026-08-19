import { STRAPI_URL } from 'astro:env/server';

export interface RawNewsImage {
    url: string;
}

// news_image（後台上傳圖片，Media 欄位）如果有值優先使用，沒有才退回 news_featured_image_url
// （外部圖片網址，TVBS 原站爬回來的圖）。news_image 是媒體庫上傳，url 可能是相對路徑，要補上 STRAPI_URL；
// news_featured_image_url 是完整外部網址，不用再處理。
export function resolveArticleImage(
    newsImage: RawNewsImage[] | null | undefined,
    featuredImageUrl: string | null | undefined,
    fallback: string,
): string {
    const rawUrl = newsImage?.[0]?.url ?? featuredImageUrl ?? null;
    if (!rawUrl) return fallback;
    return rawUrl.startsWith('http') ? rawUrl : `${STRAPI_URL}${rawUrl}`;
}
