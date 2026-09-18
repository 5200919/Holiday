import { DayResult, DAY_TYPE } from './DayResult.js';
import { ModuleConfigLoader } from './config/ModuleConfigLoader.js';
import { InvalidDateError } from './exception.js';
import {
    daysInMonth,
    fromUtcMs,
    isWeekend,
    msPerDay,
    normalizeDate,
    todayString,
    toUtcMs,
} from './date.js';

export const NAME_WORKDAY = '工作日';
export const NAME_WEEKEND = '周末';
export const NAME_MAKEUP_DEFAULT = '调休补班';
export const MAX_RANGE_DAYS = 1000;

export class HolidayCalendar {
    constructor(loader = new ModuleConfigLoader(), makeupDefault = true) {
        this.loader = loader;
        this.makeupDefault = makeupDefault;
    }

    static create(options = {}) {
        const loader = options.loader ?? new ModuleConfigLoader(options.years);

        return new HolidayCalendar(loader, options.makeupDefault ?? true);
    }

    check(date = '', options = {}) {
        if (date === '' || date === null || date === undefined) {
            date = todayString();
        }

        date = normalizeDate(date);

        const makeup = this.resolveMakeup(options);
        const config = this.loader.load(Number(date.slice(0, 4)));
        const weekend = isWeekend(date);

        if (config === null) {
            return this.fallbackResult(date, weekend);
        }

        if (config.isMakeupWorkday(date)) {
            if (makeup) {
                return new DayResult(
                    date,
                    DAY_TYPE.MAKEUP_WORKDAY,
                    true,
                    config.makeupName(date, NAME_MAKEUP_DEFAULT),
                    true,
                    false
                );
            }

            return new DayResult(date, DAY_TYPE.WEEKEND, false, NAME_WEEKEND, false, false);
        }

        if (config.isHoliday(date)) {
            return new DayResult(
                date,
                DAY_TYPE.HOLIDAY,
                false,
                config.holidayName(date) ?? NAME_WEEKEND,
                false,
                false
            );
        }

        if (weekend) {
            return new DayResult(date, DAY_TYPE.WEEKEND, false, NAME_WEEKEND, false, false);
        }

        return new DayResult(date, DAY_TYPE.WORKDAY, true, NAME_WORKDAY, false, false);
    }

    checkRange(start = '', end = null, options = {}) {
        start = normalizeDate(start === '' ? todayString() : start);
        end = normalizeDate(end === null || end === '' ? start : end);

        const startMs = toUtcMs(start);
        const endMs = toUtcMs(end);

        if (endMs < startMs) {
            throw new InvalidDateError('结束日期不能早于起始日期');
        }

        const days = Math.floor((endMs - startMs) / msPerDay()) + 1;

        if (days > MAX_RANGE_DAYS) {
            throw new InvalidDateError(`查询区间不能超过 ${MAX_RANGE_DAYS} 天`);
        }

        const results = [];

        for (let ms = startMs; ms <= endMs; ms += msPerDay()) {
            results.push(this.check(fromUtcMs(ms), options));
        }

        return results;
    }

    checkMonth(year, month, options = {}) {
        if (!Number.isInteger(year) || !Number.isInteger(month)) {
            throw new InvalidDateError('year 和 month 必须为整数');
        }

        if (month < 1 || month > 12) {
            throw new InvalidDateError('月份必须在 1-12 之间');
        }

        const start = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
        const end = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(
            daysInMonth(year, month)
        ).padStart(2, '0')}`;

        return this.checkRange(start, end, options);
    }

    getYear(year) {
        const numericYear = Number(year);
        const config = this.loader.load(numericYear);

        if (config === null) {
            return { year: numericYear, fallback: true, holidays: [], workdays: [] };
        }

        return {
            year: numericYear,
            fallback: false,
            holidays: Object.entries(config.holidays).map(([date, name]) => ({ date, name })),
            workdays: Object.entries(config.workdays).map(([date, name]) => ({ date, name })),
        };
    }

    resolveMakeup(options) {
        if (!options || !Object.prototype.hasOwnProperty.call(options, 'makeup') || options.makeup === null) {
            return this.makeupDefault;
        }

        const value = options.makeup;

        if (typeof value === 'string') {
            return !['0', 'false', 'no', 'off', ''].includes(value.toLowerCase());
        }

        return Boolean(value);
    }

    fallbackResult(date, weekend) {
        if (weekend) {
            return new DayResult(date, DAY_TYPE.WEEKEND, false, NAME_WEEKEND, false, true);
        }

        return new DayResult(date, DAY_TYPE.WORKDAY, true, NAME_WORKDAY, false, true);
    }
}
