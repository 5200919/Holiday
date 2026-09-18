import { jsonResponse, preflightResponse } from '../src/http/edge.js';

export default function onRequest(context) {
    if (context.request.method.toUpperCase() === 'OPTIONS') {
        return preflightResponse();
    }

    return jsonResponse({ code: 404, message: '接口不存在', data: null }, { status: 404 });
}
