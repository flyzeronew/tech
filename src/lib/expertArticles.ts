import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { resolveArticleLink } from './articleLink';
import { resolveSummary } from './articleSummary';
import { resolveArticleImage, type RawNewsImage } from './articleImage';
import { cachedFetchJson, CACHE_TTL } from './fetchCache';
import { authorNameMatches, parseArticleAuthorNames, buildNewsAuthorsNameFilter } from './authors';

export interface ExpertArticleItem {
    date: string;
    image: string;
    title: string;
    description: string;
    href: string;
    external: boolean;
}

export const EXPERT_ARTICLES_PAGE_SIZE = 10;

function formatDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

// news_summary 是後台可選填的摘要欄位，優先用它；沒填才退回用 news_content_html 截斷全文
function stripHtml(html: string | null, maxLength: number): string {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

// 文章庫（article-lib）的 news_authors 是 JSON 陣列（如 [{"name":"Richard Brown","role":"作者"}]），
// 不是關聯欄位，用 filters[news_authors][name][$eq] 這種巢狀 key 查會回 400 Invalid key。
// 搜尋字串用作者庫 author_name 原文，再對單一 name 欄位做包含比對。
// 個人頁只用這條路：對不上就不顯示，不要改抓首頁 experts.author_article 隨選。
interface ExpertArticleRaw {
    id: number;
    news_article_id: string;
    news_title: string;
    news_article_url: string | null;
    news_featured_image_url: string | null;
    news_image: RawNewsImage[] | null;
    news_published_at: string | null;
    news_content_html: string | null;
    news_category: string | null;
    news_summary: string | null;
    news_authors?: unknown;
}

const ARTICLE_FIELDS =
    'fields[0]=news_title&fields[1]=news_article_url&fields[2]=news_featured_image_url&fields[3]=news_published_at&fields[4]=news_content_html&fields[5]=news_category&fields[6]=news_summary&fields[7]=news_article_id&fields[8]=news_authors' +
    '&populate[news_image][fields][0]=url';

function mapArticles(raw: ExpertArticleRaw[]): ExpertArticleItem[] {
    return raw.map((a) => {
        const link = resolveArticleLink(a.news_category, a.news_article_id, a.news_article_url);
        return {
            date: formatDate(a.news_published_at),
            image: resolveArticleImage(a.news_image, a.news_featured_image_url, ''),
            title: a.news_title,
            description: resolveSummary(a.news_summary, stripHtml(a.news_content_html, 100)),
            href: link.href,
            external: link.external,
        };
    });
}

export async function fetchExpertArticles(
    authorName: string,
    page: number,
): Promise<{ articles: ExpertArticleItem[]; total: number }> {
    try {
        const json = await cachedFetchJson<{ data?: ExpertArticleRaw[]; meta?: { pagination?: { total?: number } } }>(
            `${STRAPI_URL}/api/article-libs?${buildNewsAuthorsNameFilter(authorName)}` +
                `&sort=news_published_at:desc&pagination[page]=${page}&pagination[pageSize]=${EXPERT_ARTICLES_PAGE_SIZE}` +
                `&${ARTICLE_FIELDS}`,
            { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } },
            CACHE_TTL.NEWS,
        );
        const matched = (json?.data ?? []).filter((article) =>
            parseArticleAuthorNames(article.news_authors).some((name) => authorNameMatches(name, authorName)),
        );
        return {
            articles: mapArticles(matched),
            total: json?.meta?.pagination?.total ?? 0,
        };
    } catch {
        return { articles: [], total: 0 };
    }
}
