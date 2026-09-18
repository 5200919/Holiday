import { createRoute } from '../../src/http/edgeRoute.js';

const handler = createRoute('check');

export default function onRequest(context) {
    return handler(context);
}
