import { htmlResponse, preflightResponse, requestOrigin } from '../src/http/edge.js';
import { renderHomePage } from '../src/http/pages.js';

export default function onRequest(context) {
    if (context.request.method.toUpperCase() === 'OPTIONS') {
        return preflightResponse();
    }

    return htmlResponse(renderHomePage(requestOrigin(context.request)));
}
