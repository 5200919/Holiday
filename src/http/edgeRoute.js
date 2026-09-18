import { ApiController } from './apiController.js';
import { cachePolicy, jsonResponse, preflightResponse, queryFromRequest, statusFromCode } from './edge.js';

const controller = new ApiController();

export function createRoute(action) {
    return function onRequest(context) {
        const request = context.request;
        const method = request.method.toUpperCase();

        if (method === 'OPTIONS') {
            return preflightResponse();
        }

        if (method !== 'GET' && method !== 'POST') {
            return jsonResponse(
                { code: 405, message: '仅支持 GET / POST', data: null },
                { status: 405 }
            );
        }

        const query = queryFromRequest(request);
        const result = controller.handle(action, query);

        return jsonResponse(result, {
            status: statusFromCode(result.code),
            cache: cachePolicy(action, query),
        });
    };
}
