import { DAY_TYPE } from '../../DayResult.js';
import { daysInMonth } from '../../date.js';
import { iconFor } from './icons.js';

const DOW = ['日', '一', '二', '三', '四', '五', '六'];
const TYPE_TEXT = {
    [DAY_TYPE.WORKDAY]: '工作日',
    [DAY_TYPE.WEEKEND]: '周末',
    [DAY_TYPE.HOLIDAY]: '法定节假日',
    [DAY_TYPE.MAKEUP_WORKDAY]: '调休补班',
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function firstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
}

function previousDate(date) {
    const current = new Date(`${date}T00:00:00Z`);
    current.setUTCDate(current.getUTCDate() - 1);

    return current.toISOString().slice(0, 10);
}

function shortDate(date) {
    const [, month, day] = date.split('-');

    return `${month}/${day}`;
}

/**
 * 按「日期连续」合并连休区间，并关联名称匹配的补班日。
 * @param {{date:string,name:string}[]} holidays
 * @param {{date:string,name:string}[]} workdays
 */
function buildBlocks(holidays, workdays) {
    const blocks = [];

    [...holidays]
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .forEach((entry) => {
            const last = blocks[blocks.length - 1];

            if (last && previousDate(entry.date) === last.endRaw) {
                last.endRaw = entry.date;
                last.days += 1;
                last.counts[entry.name] = (last.counts[entry.name] ?? 0) + 1;
                return;
            }

            blocks.push({
                startRaw: entry.date,
                endRaw: entry.date,
                days: 1,
                counts: { [entry.name]: 1 },
            });
        });

    return blocks.map((block) => {
        const names = Object.entries(block.counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

        return {
            name: names.join(' · '),
            names,
            days: block.days,
            start: block.startRaw.slice(5),
            end: block.endRaw.slice(5),
            startRaw: block.startRaw,
            endRaw: block.endRaw,
            startMonth: Number(block.startRaw.slice(5, 7)),
            makeup: workdays
                .filter((item) => names.some((name) => item.name.includes(name)))
                .sort((a, b) => (a.date < b.date ? -1 : 1))
                .map((item) => ({ short: shortDate(item.date), name: item.name })),
        };
    });
}

/**
 * 用服务端判定引擎生成某一年的日历模型。数据始终来自 data/holidays。
 */
export function buildYearModel(calendar, year, today = null) {
    const fullYear = calendar.getYear(year);
    const months = [];

    for (let month = 1; month <= 12; month += 1) {
        const results = calendar.checkMonth(year, month);
        const cells = [];

        for (let blank = 0; blank < firstDayOfWeek(year, month); blank += 1) {
            cells.push({ blank: true });
        }

        results.forEach((result) => {
            cells.push({
                day: Number(result.date.slice(8, 10)),
                date: result.date,
                type: result.dayType,
                name: result.holidayName,
                work: result.isWorkday,
                isToday: result.date === today,
            });
        });

        months.push({
            month,
            cells,
            days: daysInMonth(year, month),
            holidayCount: results.filter((item) => item.dayType === DAY_TYPE.HOLIDAY).length,
            makeupCount: results.filter((item) => item.dayType === DAY_TYPE.MAKEUP_WORKDAY).length,
        });
    }

    const workdayCount = months.reduce(
        (total, month) => total + month.cells.filter((cell) => !cell.blank && cell.work).length,
        0
    );

    const total = months.reduce((sum, month) => sum + month.days, 0);

    return {
        year,
        total,
        holidayCount: fullYear.holidays.length,
        makeupCount: fullYear.workdays.length,
        workdayCount,
        months,
        blocks: buildBlocks(fullYear.holidays, fullYear.workdays),
    };
}

function renderMonth(month) {
    const counts = [
        month.holidayCount ? `假 ${month.holidayCount}` : '',
        month.makeupCount ? `班 ${month.makeupCount}` : '',
    ]
        .filter(Boolean)
        .join(' · ');

    const cells = month.cells
        .map((cell) => {
            if (cell.blank) {
                return '<div class="day empty"></div>';
            }

            const classes = ['day', `t-${cell.type}`];

            if (cell.isToday) {
                classes.push('today');
            }

            return `<div class="${classes.join(' ')}" data-date="${cell.date}" data-type="${cell.type}" data-name="${escapeHtml(
                cell.name
            )}" data-work="${cell.work}">${cell.day}</div>`;
        })
        .join('');

    return `<div class="month" data-month="${month.month}">
        <div class="month-head"><b>${month.month} 月</b><span>${month.days} 天${counts ? ` · ${counts}` : ''}</span></div>
        <div class="month-dow">${DOW.map((label, index) => `<i class="${index === 0 || index === 6 ? 'wk' : ''}">${label}</i>`).join(
            ''
        )}</div>
        <div class="month-days">${cells}</div>
      </div>`;
}

function renderBlock(block) {
    const icon = iconFor(block.names);
    const makeup = block.makeup.length
        ? `<span class="hb-mk">补班 ${block.makeup.map((item) => item.short).join('、')}</span>`
        : '';

    return `<div class="hb" role="button" tabindex="0" data-start="${block.start}" data-end="${block.end}">
        <div class="hb-ico" style="color:${icon.color}">${icon.svg}</div>
        <div class="hb-body"><b>${escapeHtml(block.name)}</b><span class="hb-range">${shortDate(block.startRaw)} – ${shortDate(
        block.endRaw
    )}</span>${makeup}</div>
        <div class="hb-days">${block.days}天</div>
      </div>`;
}

function renderStats(model) {
    return `<div class="cal-stat"><small>全年天数</small><b>${model.total}<small>天</small></b></div>
      <div class="cal-stat"><small>法定节假日</small><b style="color:var(--c-holiday)">${model.holidayCount}<small>天</small></b></div>
      <div class="cal-stat"><small>调休补班</small><b style="color:var(--c-makeup)">${model.makeupCount}<small>天</small></b></div>
      <div class="cal-stat"><small>实际工作日</small><b style="color:var(--indigo)">${model.workdayCount}<small>天</small></b></div>`;
}

/**
 * 渲染三年日历（服务端预渲染，非当前年份的分组由前端按 data-year 切换显隐）。
 * @returns {{html: string, models: Map<number, object>}}
 */
export function renderCalendarSections(calendar, years, today = null) {
    const models = new Map();

    const html = years
        .map((year) => {
            const model = buildYearModel(calendar, year, today);
            models.set(year, model);

            return `<div class="cal-year" data-year="${model.year}">
      <div class="cal-stats">${renderStats(model)}</div>
      <div class="cal-grid">${model.months.map(renderMonth).join('')}</div>
      <div class="holiday-blocks">${model.blocks.map(renderBlock).join('')}</div>
    </div>`;
        })
        .join('\n');

    return { html, models };
}

export { TYPE_TEXT };
