import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { resolveSummary } from './articleSummary';
import { resolveArticleImage, type RawNewsImage } from './articleImage';
import { cachedFetchJson, CACHE_TTL } from './fetchCache';

export interface CategoryArticleItem {
    date: string;
    image: string;
    title: string;
    description: string;
    href: string;
}

export const CATEGORY_ARTICLES_PAGE_SIZE = 10;

// description 是頁面上顯示的分類簡介文字；metaDescription 是給 <meta name="description">／
// og:description 用的 SEO 摘要，兩者用途不同，內容故意分開維護，不要合併成同一個欄位。
export const CATEGORY_META: Record<string, { title: string; en: string; description: string; metaDescription: string }> = {
    money: {
        title: '科技×財經觀點',
        en: 'THE CROSSOVER',
        description: '從掌中裝置到資本浪潮，解碼消費科技背後的產業商機。',
        metaDescription: 'TVBS TECH 財經類報導，涵蓋半導體、科技股市場動態與產業財經觀點。',
    },
    tech: {
        title: '科技生活',
        en: 'EVERYDAY TECH',
        description: '從掌中裝置到資本浪潮，解碼消費科技背後的產業商機。',
        metaDescription: 'TVBS TECH 科技類報導，涵蓋半導體、AI 人工智慧與最新科技產業情報。',
    },
};

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

interface CategoryArticleRaw {
    id: number;
    news_article_id: string;
    news_title: string;
    news_article_url: string | null;
    news_featured_image_url: string | null;
    news_image: RawNewsImage[] | null;
    news_published_at: string | null;
    news_content_html: string | null;
    news_summary: string | null;
}

export async function fetchCategoryArticles(
    category: string,
    page: number,
): Promise<{ articles: CategoryArticleItem[]; total: number }> {
    try {
        const json = await cachedFetchJson<{ data?: CategoryArticleRaw[]; meta?: { pagination?: { total?: number } } }>(
            `${STRAPI_URL}/api/article-libs?filters[news_category][$eq]=${encodeURIComponent(category)}` +
                `&sort=news_published_at:desc&pagination[page]=${page}&pagination[pageSize]=${CATEGORY_ARTICLES_PAGE_SIZE}` +
                `&fields[0]=news_title&fields[1]=news_article_url&fields[2]=news_featured_image_url&fields[3]=news_published_at&fields[4]=news_content_html&fields[5]=news_summary&fields[6]=news_article_id` +
                `&populate[news_image][fields][0]=url`,
            { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } },
            CACHE_TTL.NEWS,
        );
        if (!json) return { articles: [], total: 0 };
        // 這裡的文章一定是 news_category = category（本身就是用這個條件查的），一律連到內頁；
        // 連結用 news_article_id（TVBS 原站文章 ID），不是 Strapi 內部 id，見 articleDetail.ts 的說明
        const articles: CategoryArticleItem[] = (json.data ?? []).map((a: CategoryArticleRaw) => ({
            date: formatDate(a.news_published_at),
            image: resolveArticleImage(a.news_image, a.news_featured_image_url, '/news-image-01.jpg'),
            title: a.news_title,
            description: resolveSummary(a.news_summary, stripHtml(a.news_content_html, 60)),
            href: `/${category}/${a.news_article_id}`,
        }));
        return { articles, total: json.meta?.pagination?.total ?? 0 };
    } catch {
        return { articles: [], total: 0 };
    }
}
