import { test } from 'node:test';
import assert from 'node:assert/strict';

import { htmlResponse, markdownResponse, requestOrigin } from '../src/http/edge.js';
import {
    ENDPOINTS,
    SUPPORTED_YEARS,
    renderAiDoc,
    renderHomePage,
    usagePayload,
} from '../src/http/pages.js';

const ORIGIN = 'https://holiday.example.com';

test('supported years are exposed', () => {
    assert.ok(SUPPORTED_YEARS.includes(2025));
    assert.deepEqual(SUPPORTED_YEARS, [...SUPPORTED_YEARS].sort((a, b) => a - b));
});

test('usage payload keeps endpoint examples and adds docs link', () => {
    const payload = usagePayload(`${ORIGIN}/`);

    assert.equal(payload.code, 0);
    assert.equal(payload.data.service, 'holiday');
    assert.equal(payload.data.docs, `${ORIGIN}/llms.txt`);
    assert.deepEqual(
        payload.data.endpoints,
        ENDPOINTS.map((endpoint) => endpoint.example)
    );
});

test('usage payload endpoints are json serializable', () => {
    const payload = usagePayload(ORIGIN);
    assert.ok(JSON.stringify(payload).includes('/holiday/check?date='));
});

test('home page is html with absolute urls and all endpoints', () => {
    const html = renderHomePage(ORIGIN);

    assert.match(html, /^<!DOCTYPE html>/);
    assert.ok(html.includes(`curl "${ORIGIN}/holiday/check?date=2025-10-01"`));
    assert.ok(html.includes('功能介绍'));
    assert.ok(html.includes('API 文档'));
    assert.ok(html.includes('/llms.txt'));
    assert.ok(html.includes('/ai.md'));

    for (const endpoint of ENDPOINTS) {
        assert.ok(html.includes(endpoint.path), `missing ${endpoint.path}`);
    }
});

test('home page escapes html in origin', () => {
    const html = renderHomePage('https://evil.example.com"><script>alert(1)</script>');

    assert.ok(!html.includes('<script>alert(1)'));
    assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});

test('ai doc is markdown with base url and endpoints', () => {
    const doc = renderAiDoc(`${ORIGIN}/`);

    assert.match(doc, /^# Holiday API 接入文档/);
    assert.ok(doc.includes(`Base URL**：\`${ORIGIN}\``));
    assert.ok(doc.includes(`GET ${ORIGIN}/holiday/check?date=2025-10-01`));
    assert.ok(doc.includes('makeup'));
    assert.ok(doc.includes('day_type'));
    assert.ok(doc.includes('fallback'));

    for (const endpoint of ENDPOINTS) {
        assert.ok(doc.includes(endpoint.path), `missing ${endpoint.path}`);
    }
});

test('request origin is derived from the request url', () => {
    const request = new Request(`${ORIGIN}/holiday/check?date=2025-10-01`);
    assert.equal(requestOrigin(request), ORIGIN);
});

test('html response sets content type and cors', async () => {
    const response = htmlResponse('<h1>hi</h1>');

    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    assert.equal(await response.text(), '<h1>hi</h1>');
});

test('markdown response sets content type', async () => {
    const response = markdownResponse('# doc');

    assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8');
    assert.equal(await response.text(), '# doc');
});
