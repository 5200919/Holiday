import { jsonResponse, preflightResponse, requestOrigin } from '../../src/http/edge.js';
import { usagePayload } from '../../src/http/pages.js';

export default function onRequest(context) {
    if (context.request.method.toUpperCase() === 'OPTIONS') {
        return preflightResponse();
    }

    return jsonResponse(usagePayload(requestOrigin(context.request)));
}
