import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { cachedFetchJson, CACHE_TTL } from './fetchCache';

export interface AuthorImage {
    url: string;
}

export interface Author {
    author_name: string;
    author_tag: string | null;
    author_description: string | null;
    author_quotes: string | null;
    author_image: AuthorImage | null;
}

function decodeSlug(slug: string): string {
    try {
        return decodeURIComponent(slug);
    } catch {
        return slug;
    }
}

// news_authors.name 常帶職稱／媒體後綴。搜尋字串用作者庫 author_name 原文，
// 文章欄位只要包含這段文字就算對上，不改寫作者名。
export function authorNameMatches(articleAuthorName: string, authorName: string): boolean {
    const article = articleAuthorName.trim().toLowerCase();
    const author = authorName.trim().toLowerCase();
    return Boolean(article && author && article.includes(author));
}

export function parseArticleAuthorNames(raw: unknown): string[] {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : [raw];
    return list
        .map((item) => {
            if (typeof item === 'string') return item.trim();
            if (item && typeof item === 'object' && 'name' in item) {
                const name = (item as { name?: unknown }).name;
                return typeof name === 'string' ? name.trim() : '';
            }
            return '';
        })
        .filter(Boolean);
}

// article-lib 的 news_authors 是 JSON，不能用 filters[news_authors][name][$eq]。
// 搜尋字串就是 author_name 欄位原文，不分大小寫包含即可。
export function buildNewsAuthorsNameFilter(authorName: string): string {
    return `filters[news_authors][$containsi]=${encodeURIComponent(authorName)}`;
}

function legacyKebabSlug(name: string): string {
    return name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// path 直接用作者庫 author_name，不轉成 richard-brown。
export function authorSlug(name: string): string {
    return name;
}

export function authorHref(name: string): string {
    return `/experts/${encodeURIComponent(name)}`;
}

export function findAuthorBySlug(authors: Author[], slug: string): Author | undefined {
    const decoded = decodeSlug(slug);
    const byName = authors.find((a) => a.author_name === slug || a.author_name === decoded);
    if (byName) return byName;

    // 舊連結 /experts/richard-brown 仍可開，新連結不再產出這種 path
    return authors.find((a) => {
        const kebab = legacyKebabSlug(a.author_name);
        return kebab && (kebab === slug || kebab === decoded);
    });
}

export function parseAuthorTags(tag: string | null | undefined): string[] {
    if (!tag) return [];
    return tag.split(/[,、]/).map((t) => t.trim()).filter(Boolean);
}

export function resolveAuthorImage(rawUrl: string | null | undefined): string {
    if (!rawUrl) return '';
    return rawUrl.startsWith('http') ? rawUrl : `${STRAPI_URL}${rawUrl}`;
}

export async function fetchAuthors(): Promise<Author[]> {
    try {
        const json = await cachedFetchJson<{ data?: Author[] }>(
            `${STRAPI_URL}/api/authors?populate=author_image&pagination[pageSize]=100`,
            { headers: { Authorization: `Bearer ${STRAPI_API_TOKEN}` } },
            CACHE_TTL.NAV,
        );
        return (json?.data ?? []).filter((a) => a.author_name);
    } catch {
        return [];
    }
}
