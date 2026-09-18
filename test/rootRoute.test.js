import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import onRequest from '../edge-functions/index.js';
import { prefersHtml, rootPayload } from '../src/http/rootRoute.js';
import { todayString } from '../src/date.js';

const browserHeaders = () => new Headers({
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36',
});

const curlHeaders = () => new Headers({ accept: '*/*', 'user-agent': 'curl/8.4.0' });

const nodeHeaders = (headers) => headers;

describe('prefersHtml', () => {
    test('浏览器声明 text/html 时返回首页', () => {
        assert.equal(prefersHtml(browserHeaders()), true);
        assert.equal(prefersHtml(nodeHeaders({ accept: 'text/html', 'user-agent': 'Mozilla/5.0' })), true);
    });

    test('curl / wget 等命令行客户端返回 JSON', () => {
        assert.equal(prefersHtml(curlHeaders()), false);
        assert.equal(prefersHtml(new Headers({ accept: '*/*', 'user-agent': 'Wget/1.21' })), false);
        assert.equal(prefersHtml(new Headers({ accept: '*/*', 'user-agent': 'python-requests/2.31.0' })), false);
    });

    test('显式声明 application/json 时返回 JSON', () => {
        assert.equal(prefersHtml(new Headers({ accept: 'application/json' })), false);
    });

    test('format 参数可强制覆盖协商结果', () => {
        assert.equal(prefersHtml(curlHeaders(), { format: 'html' }), true);
        assert.equal(prefersHtml(browserHeaders(), { format: 'json' }), false);
    });

    test('无 Accept 头时按首页处理', () => {
        assert.equal(prefersHtml(new Headers({})), true);
    });
});

describe('rootPayload', () => {
    test('返回当天判定结果，且与 /holiday/check 同构', () => {
        const payload = rootPayload();

        assert.equal(payload.code, 0);
        assert.equal(payload.message, 'ok');
        assert.equal(payload.data.date, todayString());
        assert.equal(typeof payload.data.is_workday, 'boolean');
        assert.equal(typeof payload.data.day_type, 'string');
    });
});

describe('根路由内容协商（edge 入口）', () => {
    test('浏览器访问返回 HTML', async () => {
        const response = await onRequest({
            request: new Request('https://holiday.wxm.wang/', { headers: browserHeaders() }),
        });

        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /text\/html/);
        assert.equal(response.headers.get('vary'), 'Accept');

        const body = await response.text();

        assert.match(body, /^<!DOCTYPE html>/);
    });

    test('curl 访问返回当天 JSON', async () => {
        const response = await onRequest({
            request: new Request('https://holiday.wxm.wang/', { headers: curlHeaders() }),
        });

        assert.equal(response.status, 200);
        assert.match(response.headers.get('content-type'), /application\/json/);
        assert.equal(response.headers.get('vary'), 'Accept');

        const payload = await response.json();

        assert.equal(payload.code, 0);
        assert.equal(payload.data.date, todayString());
    });

    test('curl 带 format=html 也能拿到首页', async () => {
        const response = await onRequest({
            request: new Request('https://holiday.wxm.wang/?format=html', { headers: curlHeaders() }),
        });

        assert.match(response.headers.get('content-type'), /text\/html/);
    });

    test('OPTIONS 预检返回 204', async () => {
        const response = await onRequest({
            request: new Request('https://holiday.wxm.wang/', { method: 'OPTIONS' }),
        });

        assert.equal(response.status, 204);
    });
});
