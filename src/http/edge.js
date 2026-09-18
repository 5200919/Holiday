const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
};

export function preflightResponse() {
    return new Response(null, { status: 204, headers: { ...CORS_HEADERS } });
}

export function jsonResponse(payload, { status = 200, cache = 'no-store' } = {}) {
    return new Response(JSON.stringify(payload), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': cache,
            ...CORS_HEADERS,
        },
    });
}

export function htmlResponse(html, { status = 200, cache = 'public, max-age=3600' } = {}) {
    return new Response(html, {
        status,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': cache,
            ...CORS_HEADERS,
        },
    });
}

export function markdownResponse(markdown, { status = 200, cache = 'public, max-age=3600' } = {}) {
    return new Response(markdown, {
        status,
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': cache,
            ...CORS_HEADERS,
        },
    });
}

export function requestOrigin(request) {
    const url = new URL(request.url);

    return `${url.protocol}//${url.host}`;
}

export function queryFromRequest(request) {
    const url = new URL(request.url);
    const query = {};

    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    return query;
}

export function statusFromCode(code) {
    if (code === 0) {
        return 200;
    }

    return code >= 400 && code < 600 ? code : 500;
}

export function cachePolicy(action, query) {
    const hasKey = (key) => Object.prototype.hasOwnProperty.call(query, key);

    if (action === 'check' && !hasKey('date')) {
        return 'no-store';
    }

    if (action === 'range' && !hasKey('start') && !hasKey('end')) {
        return 'no-store';
    }

    if ((action === 'month' || action === 'year') && !hasKey('year')) {
        return 'no-store';
    }

    return 'public, max-age=86400';
}
