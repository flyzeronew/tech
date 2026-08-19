// 文章庫（article-lib）目前只有 news_category 為 money 或 tech 的文章有對應的內頁
// （/money/{id}、/tech/{id}，見 src/pages/[category]/[id].astro）。其餘分類的文章
// 還是連到 news_article_url（外部原始新聞頁），跟原本的行為一致。
const INTERNAL_CATEGORIES = new Set(['money', 'tech']);

export interface ArticleLinkInfo {
    href: string;
    external: boolean;
}

export function resolveArticleLink(
    category: string | null | undefined,
    newsArticleId: string | null | undefined,
    externalUrl: string | null | undefined,
): ArticleLinkInfo {
    if (category && INTERNAL_CATEGORIES.has(category) && newsArticleId) {
        return { href: `/${category}/${newsArticleId}`, external: false };
    }
    return { href: externalUrl ?? '#', external: true };
}
