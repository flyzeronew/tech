// news_summary 是後台可選填的摘要欄位，填了就優先用這個，沒填才退回用 news_content_html
// 硬截斷的做法（各元件自己的 stripHtml，因為每個元件截斷長度不同，不集中在這裡）。
export function resolveSummary(summary: string | null | undefined, strippedFallback: string): string {
    const trimmed = summary?.trim();
    return trimmed ? trimmed : strippedFallback;
}
