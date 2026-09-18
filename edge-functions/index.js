import { jsonResponse, preflightResponse } from '../src/http/edge.js';

export default function onRequest(context) {
    if (context.request.method.toUpperCase() === 'OPTIONS') {
        return preflightResponse();
    }

    return jsonResponse({
        code: 0,
        message: 'ok',
        data: {
            service: 'holiday',
            endpoints: [
                '/holiday/check?date=YYYY-MM-DD&makeup=1',
                '/holiday/range?start=YYYY-MM-DD&end=YYYY-MM-DD&makeup=1',
                '/holiday/month?year=2026&month=10&makeup=1',
                '/holiday/year?year=2026',
            ],
        },
    });
}
