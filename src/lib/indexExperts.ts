import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { resolveArticleLink } from './articleLink';
import { cachedFetchJson, CACHE_TTL } from './fetchCache';
import {
    fetchAuthors,
    authorSlug,
    parseAuthorTags,
    resolveAuthorImage,
    authorNameMatches,
    parseArticleAuthorNames,
    buildNewsAuthorsNameFilter,
} from './authors';

interface AuthorArticle {
    news_article_id: string;
    news_title: string;
    news_article_url: string | null;
    news_category: string | null;
}

interface AuthorProfile {
    author_name: string;
    author_tag: string | null;
    author_description: string | null;
    author_image: { url: string } | null;
}

interface AuthorColumnItem {
    author: AuthorProfile | null;
    author_article: AuthorArticle[] | null;
}

export interface IndexExpertCard {
    slug: string;
    name: string;
    tags: string[];
    description: string;
    avatar: string;
    articles: { title: string; href: string; external: boolean }[];
}

interface ArticleRaw {
    news_article_id: string;
    news_title: string;
    news_article_url: string | null;
    news_category: string | null;
    news_published_at: string | null;
    news_authors: { name?: string }[] | { name?: string } | null;
}

const ARTICLES_PER_AUTHOR = 3;

const ARTICLE_FIELDS =
    'fields[0]=news_title&fields[1]=news_article_url&fields[2]=news_category&fields[3]=news_article_id&fields[4]=news_published_at&fields[5]=news_authors';

async function fetchLatestArticlesForAuthor(authorName: string): Promise<ArticleRaw[]> {
    const json = await cachedFetchJson<{ data?: ArticleRaw[] }>(
        `${STRAPI_URL}/api/article-libs?${buildNewsAuthorsNameFilter(authorName)}` +
            `&sort=news_published_at:desc&pagination[page]=1&pagination[pageSize]=10` +
            `&${ARTICLE_FIELDS}`,
        { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } },
        CACHE_TTL.NEWS,
    );
    return (json?.data ?? [])
        .filter((article) =>
            parseArticleAuthorNames(article.news_authors).some((name) => authorNameMatches(name, authorName)),
        )
        .slice(0, ARTICLES_PER_AUTHOR);
}

function mapArticles(articles: ArticleRaw[]): IndexExpertCard['articles'] {
    return articles.map((a) => {
        const link = resolveArticleLink(a.news_category, a.news_article_id, a.news_article_url);
        return { title: a.news_title, href: link.href, external: link.external };
    });
}

// /experts 列表：作者庫 api::author.author + 文章庫 article-lib，
// 以 news_authors.name 對應作者姓名，每人取最新 3 篇（不限 article_source）。
export async function fetchExpertsList(): Promise<IndexExpertCard[]> {
    try {
        const authors = await fetchAuthors();
        const articleLists = await Promise.all(
            authors.map((author) => fetchLatestArticlesForAuthor(author.author_name)),
        );
        return authors.map((author, i) => ({
            slug: authorSlug(author.author_name),
            name: author.author_name,
            tags: parseAuthorTags(author.author_tag),
            description: author.author_description || '',
            avatar: resolveAuthorImage(author.author_image?.url),
            articles: mapArticles(articleLists[i] ?? []),
        }));
    } catch {
        return [];
    }
}

// 首頁「專家觀點」只吃後台「首頁設定」index-page.experts
//（作者 + 隨選 author_article），不另外打作者庫、也不套本地代替資料。
export async function fetchIndexExperts(): Promise<IndexExpertCard[]> {
    try {
        const json = await cachedFetchJson<{ data?: { experts?: AuthorColumnItem[] } }>(
            `${STRAPI_URL}/api/index-page?populate[experts][populate][author][populate]=*&populate[experts][populate][author_article][fields][0]=news_title&populate[experts][populate][author_article][fields][1]=news_article_url&populate[experts][populate][author_article][fields][2]=news_category&populate[experts][populate][author_article][fields][3]=news_article_id`,
            { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } },
            CACHE_TTL.NAV,
        );
        return (json?.data?.experts ?? [])
            .filter((item): item is AuthorColumnItem & { author: AuthorProfile } => item.author !== null)
            .map((item) => ({
                slug: authorSlug(item.author.author_name),
                name: item.author.author_name,
                tags: parseAuthorTags(item.author.author_tag),
                description: item.author.author_description || '',
                avatar: resolveAuthorImage(item.author.author_image?.url),
                articles: (item.author_article ?? []).slice(0, 3).map((a) => {
                    const link = resolveArticleLink(a.news_category, a.news_article_id, a.news_article_url);
                    return { title: a.news_title, href: link.href, external: link.external };
                }),
            }));
    } catch {
        return [];
    }
}
