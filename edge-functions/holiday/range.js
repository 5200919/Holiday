import { createRoute } from '../../src/http/edgeRoute.js';

const handler = createRoute('range');

export default function onRequest(context) {
    return handler(context);
}
