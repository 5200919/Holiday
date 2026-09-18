import http from 'node:http';
import { ApiController } from './src/http/apiController.js';
import { statusFromCode } from './src/http/edge.js';
import { renderAiDoc, renderHomePage, usagePayload } from './src/http/pages.js';

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

    const html = (body) => {
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(body);
    };

    const markdown = (body) => {
        response.writeHead(200, { 'Content-Type': 'text/markdown; charset=utf-8' });
        response.end(body);
    };

    if (path === '/') {
        return html(renderHomePage(origin));
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

    function json(payload) {
        response.writeHead(statusFromCode(payload.code), { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify(payload));
    }
});

server.listen(port, () => {
    console.log(`holiday api listening on http://127.0.0.1:${port}`);
});
