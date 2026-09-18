/**
 * JSON 语法高亮。
 *
 * 注意顺序：必须先按 token 切分、逐段转义，再拼接。
 * 若先整体 escapeHtml，`"` 会变成 `&quot;`，token 正则将全部失配。
 */

const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function highlightJson(value) {
    const raw = JSON.stringify(value, null, 2);
    const parts = [];
    let last = 0;

    raw.replace(TOKEN, (match, str, colon, bool, nul, num, offset) => {
        parts.push(escapeHtml(raw.slice(last, offset)));

        if (str !== undefined) {
            parts.push(`<span class="${colon ? 'j-key' : 'j-str'}">${escapeHtml(str)}</span>`);

            if (colon) {
                parts.push(escapeHtml(colon));
            }
        } else if (bool !== undefined) {
            parts.push(`<span class="j-bool">${bool}</span>`);
        } else if (nul !== undefined) {
            parts.push(`<span class="j-null">${nul}</span>`);
        } else {
            parts.push(`<span class="j-num">${num}</span>`);
        }

        last = offset + match.length;

        return match;
    });

    parts.push(escapeHtml(raw.slice(last)));

    return parts.join('');
}
