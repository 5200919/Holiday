import http from 'node:http';
import { ApiController } from './src/http/apiController.js';
import { statusFromCode } from './src/http/edge.js';
import { renderAiDoc, renderHomePage, usagePayload } from './src/http/pages.js';
import { prefersHtml, rootPayload } from './src/http/rootRoute.js';

const port = Number(process.env.PORT || 443);
const controller = new ApiController();

const server = http.createServer((request, response) => {
    const origin = `http://${request.headers.host ?? 'localhost'}`;
    const url = new URL(request.url, origin);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const query = {};

    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    const html = (body, extra = {}) => {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...extra });
        response.end(body);
    };

    const markdown = (body) => {
        response.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
        response.end(body);
    };

    if (path === '/') {
        // 浏览器返回首页；curl / wget 等直接返回当天判定结果
        if (prefersHtml(request.headers, query)) {
            return html(renderHomePage(origin), { Vary: 'Accept' });
        }

        return json(rootPayload(), { Vary: 'Accept', 'Cache-Control': 'no-store' });
    }

    if (path === '/holiday') {
        return json(usagePayload(origin));
    }

    if (path === '/llms.txt' || path === '/ai.md') {
        return markdown(renderAiDoc(origin));
    }

    const match = /^\/holiday\/([A-Za-z]+)$/.exec(path);
    const payload = match
        ? controller.handle(match[1], query)
        : { code: 404, message: '接口不存在', data: null };

    return json(payload);

    function json(payload, extra = {}) {
        response.writeHead(statusFromCode(payload.code), {
            'Content-Type': 'application/json; charset=utf-8',
            ...extra,
        });
        response.end(JSON.stringify(payload));
    }
});

server.listen(port, () => {
    console.log(`holiday api listening on http://127.0.0.1:${port}`);
});
