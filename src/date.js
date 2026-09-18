import { InvalidDateError } from './exception.js';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const COMPACT_DATE_RE = /^(\d{4})(\d{2})(\d{2})$/;

const MS_PER_DAY = 86400000;

const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;

export function todayString(now = new Date()) {
    const shifted = new Date(now.getTime() + SHANGHAI_OFFSET_MS);
    return formatUtc(shifted);
}

export function normalizeDate(date) {
    if (typeof date !== 'string') {
        throw new InvalidDateError(`日期格式非法：${String(date)}，应为 Y-m-d 或 Ymd`);
    }

    const match = DATE_RE.exec(date) ?? COMPACT_DATE_RE.exec(date);

    if (match === null) {
        throw new InvalidDateError(`日期格式非法：${date}，应为 Y-m-d 或 Ymd`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const probe = new Date(Date.UTC(year, month - 1, day));

    if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
        throw new InvalidDateError(`日期不存在：${date}`);
    }

    return `${match[1]}-${match[2]}-${match[3]}`;
}

export function isWeekend(date) {
    const match = DATE_RE.exec(date);
    const dayOfWeek = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))).getUTCDay();

    return dayOfWeek === 0 || dayOfWeek === 6;
}

export function toUtcMs(date) {
    const match = DATE_RE.exec(date);

    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function fromUtcMs(ms) {
    return formatUtc(new Date(ms));
}

export function daysInMonth(year, month) {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function msPerDay() {
    return MS_PER_DAY;
}

function formatUtc(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
