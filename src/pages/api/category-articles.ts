import type { APIRoute } from 'astro';
import { fetchCategoryArticles, CATEGORY_ARTICLES_PAGE_SIZE, CATEGORY_META } from '../../lib/categoryArticles';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const category = url.searchParams.get('category');
    const page = Number(url.searchParams.get('page'));

    if (!category || !(category in CATEGORY_META) || !Number.isInteger(page) || page < 1) {
        return new Response(JSON.stringify({ articles: [], hasMore: false }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { articles, total } = await fetchCategoryArticles(category, page);
    const hasMore = page * CATEGORY_ARTICLES_PAGE_SIZE < total;

    return new Response(JSON.stringify({ articles, hasMore }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
