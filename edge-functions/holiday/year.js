import { createRoute } from '../../src/http/edgeRoute.js';

const handler = createRoute('year');

export default function onRequest(context) {
    return handler(context);
}
