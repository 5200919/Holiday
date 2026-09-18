import { markdownResponse, preflightResponse, requestOrigin } from '../src/http/edge.js';
import { renderAiDoc } from '../src/http/pages.js';

export default function onRequest(context) {
    if (context.request.method.toUpperCase() === 'OPTIONS') {
        return preflightResponse();
    }

    return markdownResponse(renderAiDoc(requestOrigin(context.request)));
}
