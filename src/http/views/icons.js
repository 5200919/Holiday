/**
 * 节日图标：全部使用内联 SVG，避免不同系统 emoji 字形差异
 * （例如 🇨🇳 在 Windows 上会退化为 "CN" 字母组合）。
 */

const wrapSVG = (inner) =>
    `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

function starPath(cx, cy, r, rot = 0) {
    let d = '';

    for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 === 0 ? r : r * 0.382;
        const angle = (Math.PI / 5) * i - Math.PI / 2 + rot;
        d += `${i === 0 ? 'M' : 'L'}${round(cx + radius * Math.cos(angle))} ${round(cy + radius * Math.sin(angle))}`;
    }

    return `${d}Z`;
}

function round(value) {
    return Number(value.toFixed(2));
}

/** 中国国旗：红底 + 大星，四颗小星一角朝向大星 */
export function flagSVG() {
    const big = [8.2, 10.2];
    const smalls = [
        [11.8, 7.6],
        [13.1, 9.8],
        [13.1, 12.6],
        [11.8, 14.6],
    ];
    const stars = [
        `<path d="${starPath(big[0], big[1], 2.45)}" fill="#ffde00"/>`,
        ...smalls.map(([x, y]) => {
            const rot = Math.atan2(big[1] - y, big[0] - x) + Math.PI / 2;
            return `<path d="${starPath(x, y, 0.9, rot)}" fill="#ffde00"/>`;
        }),
    ].join('');

    return `<svg viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="中国国旗"><rect x="2.4" y="5.4" width="19.2" height="13.2" rx="1.4" fill="#de2910"/>${stars}</svg>`;
}

export const ICONS = {
    元旦: wrapSVG(`<path d="M12 3.2v3.2M12 17.6v3.2M3.2 12h3.2M17.6 12h3.2"/>
<path d="M6.3 6.3l2.3 2.3M15.4 15.4l2.3 2.3M17.7 6.3l-2.3 2.3M8.6 15.4l-2.3 2.3"/>
<circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>`),
    春节: wrapSVG(`<rect x="4.4" y="6.4" width="15.2" height="13.4" rx="2.2"/>
<path d="M4.4 10.6c2.4 1.9 5.4 1.9 7.6 1.9s5.2 0 7.6-1.9"/>
<circle cx="12" cy="14.6" r="1.5" fill="currentColor" stroke="none"/>`),
    除夕: wrapSVG(`<path d="M12 3.2v2.4"/><rect x="8.6" y="5.6" width="6.8" height="1.8" rx=".9"/>
<ellipse cx="12" cy="12.6" rx="5.6" ry="4.8"/>
<rect x="8.6" y="17.6" width="6.8" height="1.8" rx=".9"/><path d="M12 19.4v2.4"/>
<path d="M12 8.6v7.8" opacity=".45"/>`),
    清明节: wrapSVG(`<path d="M8 13.6a3.2 3.2 0 0 1 .5-6.4 5 5 0 0 1 9.2 1.2 2.9 2.9 0 0 1-.4 5.2"/>
<path d="M9.2 16.6l-1 3M13 16.6l-1 3M16.8 16.6l-1 3"/>`),
    劳动节: wrapSVG(`<circle cx="12" cy="12" r="3.1"/><circle cx="12" cy="12" r="7.2"/>
<path d="M12 3.6v2.2M12 18.2v2.2M3.9 7.7l1.9 1.1M18.2 15.2l1.9 1.1M3.9 16.3l1.9-1.1M18.2 8.8l1.9-1.1"/>`),
    端午节: wrapSVG(`<path d="M5.2 8.6h13.6"/><path d="M5.2 8.6L12 20.4l6.8-11.8z"/>
<path d="M12 8.6L9 14.2M12 8.6L15 14.2" opacity=".5"/>`),
    中秋节: wrapSVG(`<circle cx="12" cy="12.6" r="6.6"/>
<path d="M18.4 4.6l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" fill="currentColor" stroke="none"/>
<path d="M9.4 10.6a1.1 1.1 0 1 0 .1 0M13.6 15a1.4 1.4 0 1 0 .1 0" opacity=".55"/>`),
    default: wrapSVG(`<rect x="3.6" y="5.4" width="16.8" height="15.2" rx="3"/>
<path d="M3.6 10.2h16.8M8.2 3.2v4M15.8 3.2v4"/>
<circle cx="15.6" cy="15.4" r="1.4" fill="currentColor" stroke="none"/>`),
};

export const ICON_COLORS = {
    元旦: '#ef4444',
    春节: '#e11d48',
    除夕: '#f97316',
    清明节: '#16a34a',
    劳动节: '#2563eb',
    端午节: '#0d9488',
    中秋节: '#d97706',
    国庆节: '#dc2626',
};

/**
 * 为一组节日名选择图标：含国庆节优先用国旗，含元旦用新年图标。
 * @param {string[]} names
 */
export function iconFor(names) {
    if (names.includes('国庆节')) {
        return { svg: flagSVG(), color: ICON_COLORS.国庆节 };
    }

    if (names.includes('元旦')) {
        return { svg: ICONS.元旦, color: ICON_COLORS.元旦 };
    }

    return { svg: ICONS[names[0]] ?? ICONS.default, color: ICON_COLORS[names[0]] ?? '#64748b' };
}
