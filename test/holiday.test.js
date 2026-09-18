import { test } from 'node:test';
import assert from 'node:assert/strict';

import { HolidayCalendar } from '../src/HolidayCalendar.js';
import { todayString } from '../src/date.js';
import { InvalidDateError } from '../src/exception.js';
import { ApiController } from '../src/http/apiController.js';

const calendar = HolidayCalendar.create();

test('statutory holiday returns holiday type and chinese name', () => {
    const result = calendar.check('2025-10-01');
    assert.equal(result.isWorkday, false);
    assert.equal(result.isHoliday, true);
    assert.equal(result.dayType, 'holiday');
    assert.equal(result.holidayName, '国庆节');
});

test('weekend is rest day', () => {
    const result = calendar.check('2025-03-01');
    assert.equal(result.isWorkday, false);
    assert.equal(result.dayType, 'weekend');
    assert.equal(result.holidayName, '周末');
});

test('plain weekday is workday', () => {
    const result = calendar.check('2025-03-03');
    assert.equal(result.isWorkday, true);
    assert.equal(result.dayType, 'workday');
    assert.equal(result.holidayName, '工作日');
});

test('makeup weekend counts as workday by default', () => {
    const result = calendar.check('2025-01-26');
    assert.equal(result.isWorkday, true);
    assert.equal(result.dayType, 'makeup_workday');
    assert.equal(result.makeupWorkday, true);
    assert.equal(result.holidayName, '春节前补班');
});

test('makeup weekend disabled by makeup=false', () => {
    const result = calendar.check('2025-01-26', { makeup: false });
    assert.equal(result.isWorkday, false);
    assert.equal(result.dayType, 'weekend');
    assert.equal(result.holidayName, '周末');
});

test('makeup string values are parsed', () => {
    assert.equal(calendar.check('2025-01-26', { makeup: '0' }).isWorkday, false);
    assert.equal(calendar.check('2025-01-26', { makeup: '1' }).isWorkday, true);
});

test('unknown year degrades to weekend-only with fallback flag', () => {
    const weekday = calendar.check('2030-06-03');
    const weekend = calendar.check('2030-06-01');
    assert.equal(weekday.isWorkday, true);
    assert.equal(weekday.fallback, true);
    assert.equal(weekend.isWorkday, false);
    assert.equal(weekend.fallback, true);
});

test('empty date defaults to today', () => {
    assert.equal(calendar.check('').date, todayString());
});

test('invalid date format throws', () => {
    assert.throws(() => calendar.check('2025/10/01'), InvalidDateError);
});

test('non-existent date throws', () => {
    assert.throws(() => calendar.check('2025-02-30'), InvalidDateError);
});

test('range is inclusive', () => {
    const results = calendar.checkRange('2025-10-01', '2025-10-08');
    assert.equal(results.length, 8);
    assert.ok(results.every((item) => item.isWorkday === false));
});

test('month has correct day count', () => {
    const results = calendar.checkMonth(2025, 2);
    assert.equal(results.length, 28);
    assert.equal(results[0].date, '2025-02-01');
    assert.equal(results[27].date, '2025-02-28');
});

test('getYear returns holidays and workdays', () => {
    const year = calendar.getYear(2025);
    assert.equal(year.year, 2025);
    assert.equal(year.fallback, false);
    assert.ok(year.holidays.length > 0);
    assert.ok(year.workdays.length > 0);
});

test('getYear fallback for unknown year', () => {
    const year = calendar.getYear(2030);
    assert.equal(year.fallback, true);
    assert.deepEqual(year.holidays, []);
});

test('custom registry can be injected', () => {
    const custom = HolidayCalendar.create({
        years: { 2030: { year: 2030, holidays: { '2030-03-04': '自定义节日' }, workdays: {} } },
    });
    const result = custom.check('2030-03-04');
    assert.equal(result.isWorkday, false);
    assert.equal(result.holidayName, '自定义节日');
    assert.equal(result.fallback, false);
});

test('api controller check endpoint shape', () => {
    const controller = new ApiController(calendar);
    const response = controller.handle('check', { date: '2025-10-01' });
    assert.equal(response.code, 0);
    assert.equal(response.data.holiday_name, '国庆节');
    assert.equal(response.data.is_workday, false);
});

test('api controller defaults date to today', () => {
    const controller = new ApiController(calendar);
    const response = controller.handle('check', {});
    assert.equal(response.data.date, todayString());
});

test('api controller invalid date returns code 400', () => {
    const controller = new ApiController(calendar);
    const response = controller.handle('check', { date: '2025-13-01' });
    assert.equal(response.code, 400);
    assert.equal(response.data, null);
});

test('api controller unknown action returns 404', () => {
    const controller = new ApiController(calendar);
    assert.equal(controller.handle('nope', {}).code, 404);
});
