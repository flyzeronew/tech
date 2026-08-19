import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { resolveSummary } from './articleSummary';
import { resolveArticleImage } from './articleImage';
import { cachedFetchJson, CACHE_TTL } from './fetchCache';

export interface ArticleAuthor {
    name: string;
    role: string | null;
}

export interface ArticleDetail {
    id: number;
    newsArticleId: string;
    category: string;
    title: string;
    description: string;
    authors: ArticleAuthor[];
    publishedAt: string;
    updatedAt: string;
    publishedAtISO: string | null;
    updatedAtISO: string | null;
    image: string;
    youtubeId: string | null;
    contentHtml: string;
    tags: string[];
    isAdult: boolean;
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// news_summary 是後台可選填的摘要欄位，優先用它；沒填才退回用 news_content_html 截斷全文
function stripHtml(html: string | null, maxLength: number): string {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

// 後台部分文章的 news_youtube_id 存的是字串 "null"（不是真正的 null），
// 判斷有沒有影片時要一併排除，不然會誤判成有 YouTube 影片可嵌入
function normalizeYoutubeId(id: unknown): string | null {
    return typeof id === 'string' && id && id !== 'null' ? id : null;
}

// 找不到 findOne 權限（Content API token 只有 find），用 list + filters[news_article_id] 代替單筆查詢。
// URL 的 {id} 段是 news_article_id（TVBS 原站的文章 ID），不是 Strapi 自己的內部 id——
// 前者才是跨系統穩定不變的識別碼，換 Strapi 內容也不會變動連結。
// 同時用 filters[news_category] 確保 /money/{id} 不會撈到實際上是 tech 分類的文章（反之亦然）
export async function fetchArticleDetail(category: string, newsArticleId: string): Promise<ArticleDetail | null> {
    try {
        const json = await cachedFetchJson<{ data?: unknown[] }>(
            `${STRAPI_URL}/api/article-libs?filters[news_article_id][$eq]=${encodeURIComponent(newsArticleId)}&filters[news_category][$eq]=${encodeURIComponent(category)}&populate=*`,
            { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } },
            CACHE_TTL.NAV,
        );
        const raw = json?.data?.[0] as any;
        if (!raw) return null;

        const image = resolveArticleImage(raw.news_image, raw.news_featured_image_url, '/main-img.jpg');

        const rawAuthors = raw.news_authors;
        const authors: ArticleAuthor[] = Array.isArray(rawAuthors) ? rawAuthors : rawAuthors ? [rawAuthors] : [];

        return {
            id: raw.id,
            newsArticleId: raw.news_article_id,
            category: raw.news_category,
            title: raw.news_title,
            description: resolveSummary(raw.news_summary, stripHtml(raw.news_content_html, 150)),
            authors,
            publishedAt: formatDateTime(raw.news_published_at),
            updatedAt: formatDateTime(raw.news_updated_at),
            publishedAtISO: raw.news_published_at ?? null,
            updatedAtISO: raw.news_updated_at ?? null,
            image,
            youtubeId: normalizeYoutubeId(raw.news_youtube_id),
            contentHtml: raw.news_content_html ?? '',
            tags: (raw.news_tag ?? []).map((t: { name: string }) => t.name),
            isAdult: raw.status_18 === true,
        };
    } catch {
        return null;
    }
}
