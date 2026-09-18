import http from 'node:http';
import { ApiController } from './src/http/apiController.js';
import { statusFromCode } from './src/http/edge.js';

const port = Number(process.env.PORT || 443);
const controller = new ApiController();

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const query = {};

    url.searchParams.forEach((value, key) => {
        query[key] = value;
    });

    let payload;

    if (path === '/') {
        payload = { code: 0, message: 'ok', data: { service: 'holiday' } };
    } else {
        const match = /^\/holiday\/([A-Za-z]+)$/.exec(path);
        payload = match
            ? controller.handle(match[1], query)
            : { code: 404, message: '接口不存在', data: null };
    }

    response.writeHead(statusFromCode(payload.code), { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
});

server.listen(port, () => {
    console.log(`holiday api listening on http://127.0.0.1:${port}`);
});
