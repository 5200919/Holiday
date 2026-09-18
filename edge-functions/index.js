import { htmlResponse, jsonResponse, preflightResponse, queryFromRequest, requestOrigin } from '../src/http/edge.js';
import { renderHomePage } from '../src/http/pages.js';
import { VARY_ACCEPT, prefersHtml, rootPayload } from '../src/http/rootRoute.js';

/**
 * 根路径 `/`：
 * - 浏览器 → 首页 HTML
 * - curl / wget 等命令行客户端 → 当天判定结果（等价于 /holiday/check）
 */
export default function onRequest(context) {
    const method = (context.request.method || 'GET').toUpperCase();

    if (method === 'OPTIONS') {
        return preflightResponse();
    }

    if (method !== 'GET' && method !== 'POST') {
        return jsonResponse({ code: 405, message: 'Method Not Allowed', data: null }, { status: 405 });
    }

    if (prefersHtml(context.request.headers, queryFromRequest(context.request))) {
        return htmlResponse(renderHomePage(requestOrigin(context.request)), { headers: VARY_ACCEPT });
    }

    return jsonResponse(rootPayload(), { cache: 'no-store', headers: VARY_ACCEPT });
}
