import { HolidayCalendar } from '../HolidayCalendar.js';
import { HolidayError } from '../exception.js';
import { todayString } from '../date.js';

export class ApiController {
    constructor(calendar = HolidayCalendar.create()) {
        this.calendar = calendar;
    }

    handle(action, query = {}) {
        try {
            switch (action) {
                case 'check':
                    return this.ok(this.single(query));
                case 'range':
                    return this.ok(this.range(query));
                case 'month':
                    return this.ok(this.month(query));
                case 'year':
                    return this.ok(this.year(query));
                default:
                    return this.fail(404, `接口不存在：${action}`);
            }
        } catch (error) {
            if (error instanceof HolidayError) {
                return this.fail(400, error.message);
            }

            return this.fail(500, '服务内部错误');
        }
    }

    single(query) {
        return this.calendar.check(this.str(query, 'date'), this.options(query)).toObject();
    }

    range(query) {
        const start = this.str(query, 'start');
        const end = this.str(query, 'end');

        return this.calendar
            .checkRange(start, end === '' ? null : end, this.options(query))
            .map((item) => item.toObject());
    }

    month(query) {
        const today = todayString();
        const year = this.int(query, 'year', Number(today.slice(0, 4)));
        const month = this.int(query, 'month', Number(today.slice(5, 7)));

        return {
            year,
            month,
            days: this.calendar.checkMonth(year, month, this.options(query)).map((item) => item.toObject()),
        };
    }

    year(query) {
        const today = todayString();

        return this.calendar.getYear(this.int(query, 'year', Number(today.slice(0, 4))));
    }

    options(query) {
        const options = {};

        if (Object.prototype.hasOwnProperty.call(query, 'makeup')) {
            options.makeup = query.makeup;
        }

        return options;
    }

    str(query, key) {
        if (query[key] === undefined || query[key] === null) {
            return '';
        }

        return String(query[key]).trim();
    }

    int(query, key, fallback) {
        const value = query[key];

        if (value === undefined || value === null || value === '') {
            return fallback;
        }

        if (!/^-?\d+$/.test(String(value))) {
            throw new HolidayError(`参数 ${key} 必须为数字`);
        }

        return Number.parseInt(String(value), 10);
    }

    ok(data) {
        return { code: 0, message: 'ok', data };
    }

    fail(code, message) {
        return { code, message, data: null };
    }
}
