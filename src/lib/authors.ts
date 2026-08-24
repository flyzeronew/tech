import { STRAPI_URL, STRAPI_API_TOKEN } from 'astro:env/server';
import { experts as localExperts, type Expert } from '../data/experts';
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

function compactName(name: string): string {
    return name.replace(/\s+/g, '');
}

export function findLocalExpertByName(authorName: string): Expert | undefined {
    const name = compactName(authorName);
    return localExperts.find((e) => compactName(`${e.firstName}${e.lastName}`) === name);
}

export function findLocalExpertBySlug(slug: string): Expert | undefined {
    let decoded = slug;
    try {
        decoded = decodeURIComponent(slug);
    } catch {
        decoded = slug;
    }
    return localExperts.find((e) => e.slug === slug || e.slug === decoded);
}

// 後台作者庫沒有獨立 slug 欄位。中文名直接當 path（/experts/王瑀玟），
// 英文名有本地代替資料才沿用既有 slug（richard-brown），其餘轉 ASCII。
export function authorSlug(name: string): string {
    const trimmed = name.trim();
    if (/[\u4e00-\u9fff]/.test(trimmed)) {
        return trimmed.replace(/\s+/g, '');
    }
    const local = findLocalExpertByName(name);
    if (local) return local.slug;
    const ascii = trimmed
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return ascii || trimmed;
}

export function findAuthorBySlug(authors: Author[], slug: string): Author | undefined {
    let decoded = slug;
    try {
        decoded = decodeURIComponent(slug);
    } catch {
        decoded = slug;
    }
    const byGenerated = authors.find((a) => {
        const generated = authorSlug(a.author_name);
        return generated === slug || generated === decoded;
    });
    if (byGenerated) return byGenerated;

    const byName = authors.find((a) => compactName(a.author_name) === compactName(decoded));
    if (byName) return byName;

    const local = findLocalExpertBySlug(slug);
    if (!local) return undefined;
    const localName = compactName(`${local.firstName}${local.lastName}`);
    return authors.find((a) => compactName(a.author_name) === localName);
}

// 英文用空白切開（Richard / Brown）；中文姓名預設第一個字是姓。
export function splitAuthorName(name: string): { firstName: string; lastName: string } {
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    }
    if (/^[\u4e00-\u9fff]{2,}$/.test(trimmed)) {
        return { firstName: trimmed.slice(0, 1), lastName: trimmed.slice(1) };
    }
    return { firstName: trimmed, lastName: '' };
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
