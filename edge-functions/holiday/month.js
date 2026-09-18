import { createRoute } from '../../src/http/edgeRoute.js';

const handler = createRoute('month');

export default function onRequest(context) {
    return handler(context);
}
