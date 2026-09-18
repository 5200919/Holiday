import { ApiController } from './apiController.js';

/**
 * 根路径 `/` 的内容协商。
 *
 * - 浏览器（Accept 含 text/html）→ 首页 HTML
 * - curl / wget / Python requests 等命令行客户端 → 当天判定结果，等价于 `/holiday/check`
 *
 * 由于同一个 URL 会返回两种内容类型，响应必须带 `Vary: Accept`，
 * 否则 CDN 可能把 JSON 结果缓存后回给浏览器用户。
 */

const CLI_UA = /^(?:curl|wget|httpie|python-requests|python-urllib|go-http-client|okhttp|libwww-perl|axios|node-fetch|undici|postmanruntime|powershell|dart|java|ruby|faraday|restsharp|apache-httpclient)\//i;

export const VARY_ACCEPT = { Vary: 'Accept' };

function headerValue(headers, name) {
    if (!headers) {
        return '';
    }

    if (typeof headers.get === 'function') {
        const value = headers.get(name);

        return value === null || value === undefined ? '' : String(value);
    }

    const direct = headers[String(name).toLowerCase()];

    return direct === undefined || direct === null ? '' : String(direct);
}

export function prefersHtml(headers, query = {}) {
    const format = String(query && query.format ? query.format : '').toLowerCase();

    if (format === 'html') {
        return true;
    }

    if (format === 'json') {
        return false;
    }

    const accept = String(headerValue(headers, 'accept') || '').toLowerCase();
    const userAgent = String(headerValue(headers, 'user-agent') || '').toLowerCase().trim();

    // 浏览器一定会在 Accept 里声明 text/html，优先据此判断。
    if (/text\/html|application\/xhtml\+xml/.test(accept)) {
        return true;
    }

    if (CLI_UA.test(userAgent)) {
        return false;
    }

    if (/application\/json|[^+\w]json/.test(accept)) {
        return false;
    }

    // curl / wget 等工具默认发送 */*
    if (accept.includes('*/*')) {
        return false;
    }

    return accept === '';
}

let controller = null;

/** 当天判定结果，与 `GET /holiday/check` 不带参数时完全一致。 */
export function rootPayload() {
    if (controller === null) {
        controller = new ApiController();
    }

    return controller.handle('check', {});
}
