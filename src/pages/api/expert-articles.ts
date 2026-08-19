import type { APIRoute } from 'astro';
import { fetchExpertArticles, EXPERT_ARTICLES_PAGE_SIZE } from '../../lib/expertArticles';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
    const name = url.searchParams.get('name');
    const page = Number(url.searchParams.get('page'));

    if (!name || !Number.isInteger(page) || page < 1) {
        return new Response(JSON.stringify({ articles: [], hasMore: false }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const { articles, total } = await fetchExpertArticles(name, page);
    const hasMore = page * EXPERT_ARTICLES_PAGE_SIZE < total;

    return new Response(JSON.stringify({ articles, hasMore }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
};
