/**
 * 首页交互脚本常量（内联下发，随 HTML 一起返回，无需构建步骤）。
 *
 * 内容是 ES 模板字符串，因此内部出现模板固有符号时必须转义：
 *   - 反引号        `    → \`
 *   - 插值起始 ${   ${   → \$\{
 * 直接在编辑器中修改即可，改动若包含上述符号请保持转义形式。
 */
export const HOME_SCRIPT = `/* Holiday 首页交互脚本
 * 服务端已完成日历预渲染与当日判定，本脚本只负责：
 * 年份切换、日期 tooltip、节日卡定位、在线调试台、代码示例、复制与 FAQ。
 * 所有动态判定均回查同源接口 /holiday/*，页面不再内置任何节假日数据。
 */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const ORIGIN = String(window.__HOLIDAY_ORIGIN__ || '').replace(/\\/+$/, '');
  const API = '';
  const TODAY = document.body.dataset.today || '';

  /* ---------- 复制按钮 ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const src = btn.dataset.copySrc ? $(btn.dataset.copySrc) : null;
    const text = btn.dataset.copy || (src ? src.textContent.trim() : '');
    if (!text) return;
    const original = btn.textContent;
    copyText(text).then(() => {
      btn.textContent = '已复制';
      btn.classList.add('done');
    }).catch(() => { btn.textContent = '复制失败'; }).finally(() => {
      setTimeout(() => { btn.textContent = original; btn.classList.remove('done'); }, 1600);
    });
  });

  /* ---------- 导航 ---------- */
  const nav = $('#nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 12), { passive: true });
  $('#navToggle').addEventListener('click', () => nav.classList.toggle('open'));
  $$('.nav-links a').forEach((a) => a.addEventListener('click', () => nav.classList.remove('open')));

  /* ---------- 滚动出现 ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  function observeReveals() {
    $$('.card, .sec-head, .cal-grid > *, .hb, .stat, .usage').forEach((el, i) => {
      if (el.dataset.revealed) return;
      el.dataset.revealed = '1';
      el.style.transitionDelay = Math.min(i % 6, 5) * 45 + 'ms';
      io.observe(el);
    });
  }

  /* ---------- 今日状态卡 ---------- */
  const TYPE_LABEL = {
    holiday: '法定节假日', weekend: '周末休息', makeup_workday: '调休补班', workday: '正常上班'
  };
  function ringSVG(type) {
    const color = type === 'holiday' ? '#f43f5e'
      : type === 'makeup_workday' ? '#f59e0b'
      : type === 'weekend' ? '#60a5fa' : '#94a3b8';
    const work = type === 'workday' || type === 'makeup_workday';
    return '<svg width="72" height="72" viewBox="0 0 72 72">'
      + '<circle cx="36" cy="36" r="26" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="6"/>'
      + '<circle cx="36" cy="36" r="26" fill="none" stroke="' + color + '" stroke-width="6" stroke-linecap="round"'
      + ' stroke-dasharray="' + (2 * Math.PI * 26) + '" stroke-dashoffset="' + (2 * Math.PI * 26 * (work ? 0 : 0.66))
      + '" transform="rotate(-90 36 36)"/>'
      + '<text x="36" y="42" text-anchor="middle" font-size="19" font-weight="800" fill="#fff"'
      + ' font-family="ui-sans-serif,system-ui">' + (work ? '班' : '休') + '</text></svg>';
  }
  const WEEK_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  function weekLabel(dateStr) {
    return WEEK_CN[new Date(dateStr + 'T00:00:00Z').getUTCDay()] || '';
  }
  function applyToday(data) {
    if (!data) return;
    $('#todayDate').textContent = data.date;
    $('#todayWeek').textContent = weekLabel(data.date);
    const badge = $('#todayBadge');
    badge.textContent = TYPE_LABEL[data.day_type] || data.day_type;
    badge.className = 'hc-badge t-' + data.day_type;
    $('#todayName').textContent = data.holiday_name || '';
    $('#todayField').innerHTML = [
      'day_type: ' + data.day_type,
      'is_workday: ' + data.is_workday,
      'makeup_workday: ' + data.makeup_workday,
      'fallback: ' + data.fallback
    ].map((s) => '<span>' + s + '</span>').join('');
    $('#todayRing').innerHTML = ringSVG(data.day_type);
  }
  async function loadToday(dateStr) {
    const makeup = $('#todayMakeup').checked ? 1 : 0;
    const src = $('#todaySrc');
    src.textContent = '正在请求 ' + ORIGIN + ' …';
    try {
      const t0 = performance.now();
      const res = await fetch(API + '/holiday/check?date=' + dateStr + '&makeup=' + makeup, { cache: 'no-store' });
      const json = await res.json();
      const ms = Math.round(performance.now() - t0);
      if (json && json.code === 0) {
        applyToday(json.data);
        src.textContent = '数据来源：同源接口实时返回 · HTTP ' + res.status + ' · ' + ms + 'ms';
        setChip(true);
        return;
      }
      src.textContent = '接口返回异常（code ' + (json && json.code) + '）';
    } catch (err) {
      src.textContent = '请求失败，请检查服务是否可用（' + ORIGIN + '）';
      setChip(false);
    }
  }
  const todayInput = $('#todayInput');
  todayInput.addEventListener('change', () => loadToday(todayInput.value));
  $('#todayMakeup').addEventListener('change', () => loadToday(todayInput.value));

  /* ---------- 服务状态 ---------- */
  function setChip(online) {
    const chip = $('#apiChip');
    chip.classList.toggle('online', online);
    chip.classList.toggle('offline', !online);
    $('#apiChipText').textContent = online ? '服务在线' : '服务不可用';
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('#apiChip')) {
      $('#apiChipText').textContent = '重新检测中';
      loadToday(todayInput.value || TODAY);
    }
  });
  function probe() {
    fetch(API + '/holiday/check?date=' + TODAY, { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setChip(j && j.code === 0))
      .catch(() => setChip(false));
  }

  /* ---------- 日历年份切换 ---------- */
  const years = $$('#yearTabs button').map((b) => b.dataset.year);
  function switchYear(year) {
    $$('#yearTabs button').forEach((b) => b.classList.toggle('active', b.dataset.year === year));
    $$('.cal-year').forEach((el) => { el.hidden = el.dataset.year !== year; });
    clearHighlights();
  }
  $('#yearTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn) switchYear(btn.dataset.year);
  });
  switchYear(years[years.length - 1]);

  /* ---------- 日期 tooltip ---------- */
  const tooltip = $('#tooltip');
  const TYPE_TEXT = { holiday: '法定节假日', weekend: '周末', makeup_workday: '调休补班', workday: '工作日' };
  $('#calWrap').addEventListener('mouseover', (e) => {
    const cell = e.target.closest('.day:not(.empty)');
    if (!cell) return;
    tooltip.innerHTML = '<b>' + cell.dataset.date + ' · ' + (TYPE_TEXT[cell.dataset.type] || cell.dataset.type) + '</b>'
      + '<span>' + cell.dataset.name + ' · ' + (cell.dataset.work === 'true' ? '需要上班' : '休息') + '</span>';
    tooltip.hidden = false;
    const rect = cell.getBoundingClientRect();
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tooltip.offsetWidth / 2, window.innerWidth - tooltip.offsetWidth - 8));
    tooltip.style.left = left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
  });
  $('#calWrap').addEventListener('mouseout', (e) => { if (e.target.closest('.day')) tooltip.hidden = true; });

  /* ---------- 节日卡定位到月份 ---------- */
  function clearHighlights() {
    $$('.month.focus').forEach((el) => el.classList.remove('focus'));
    $$('.day.hl').forEach((el) => el.classList.remove('hl'));
  }
  function focusBlock(start, end) {
    const group = $$('.cal-year').find((el) => !el.hidden) || $('.cal-year');
    if (!group) return;
    const year = group.dataset.year;
    clearHighlights();
    const touched = new Set();
    $$('.day[data-date]', group).forEach((day) => {
      const value = day.dataset.date;
      if (value >= year + '-' + start && value <= year + '-' + end) {
        day.classList.add('hl');
        touched.add(Number(value.split('-')[1]));
      }
    });
    const targets = $$('.month', group).filter((el) => touched.has(Number(el.dataset.month)));
    targets.forEach((el) => el.classList.add('focus'));
    if (targets[0]) targets[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    clearTimeout(focusBlock._t);
    focusBlock._t = setTimeout(clearHighlights, 3200);
  }
  $('#calWrap').addEventListener('click', (e) => {
    const block = e.target.closest('.hb');
    if (block) { focusBlock(block.dataset.start, block.dataset.end); return; }
    const cell = e.target.closest('.day:not(.empty)');
    if (!cell) return;
    selectEndpoint('check');
    const input = $('#pg-date');
    if (input) input.value = cell.dataset.date;
    syncURL();
    $('#pgSend').click();
    $('#playground').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#calWrap').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const block = e.target.closest('.hb');
    if (!block) return;
    e.preventDefault();
    focusBlock(block.dataset.start, block.dataset.end);
  });

  /* ---------- 在线调试台 ---------- */
  const ENDPOINTS = {
    check: { path: '/holiday/check', desc: '查询某一天是工作日还是休息日。不传 date 时默认查询当天。', keys: ['date'], makeup: true, presets: [['2026-10-01'], [TODAY]] },
    range: { path: '/holiday/range', desc: '查询一段日期（含首尾，最多 1000 天）。不传 start 时默认从当天开始。', keys: ['start', 'end'], makeup: true, presets: [['2026-09-25', '2026-10-07'], ['2026-02-15', '2026-02-23']] },
    month: { path: '/holiday/month', desc: '查询某年某月的每一天。不传 year / month 时默认当前年月。', keys: ['year', 'month'], makeup: true, presets: [['2026', '10'], ['2025', '2']] },
    year: { path: '/holiday/year', desc: '返回某年全部法定节假日与调休补班日期。不传 year 时默认当前年份。', keys: ['year'], makeup: false, presets: [['2026'], ['2025']] }
  };
  const LABELS = { date: '支持 2026-10-01 / 20261018 两种格式', start: '起始日期', end: '结束日期', year: '四位年份', month: '月份 1–12' };
  let currentEP = 'check';

  $('#pgEndpoint').innerHTML = Object.entries(ENDPOINTS)
    .map(([k, v]) => '<option value="' + k + '">GET ' + v.path + '</option>').join('');

  function selectEndpoint(key) {
    currentEP = key;
    const ep = ENDPOINTS[key];
    $('#pgEndpoint').value = key;
    $('#pgDesc').textContent = ep.desc;
    $('#pgMakeup').closest('.pg-row').style.display = ep.makeup ? '' : 'none';
    $('#pgParams').innerHTML = ep.keys
      .map((k) => '<div class="p-item"><input type="text" id="pg-' + k + '" placeholder="' + (ep.presets[0][ep.keys.indexOf(k)] || '') + '" value="' + (ep.presets[0][ep.keys.indexOf(k)] || '') + '" /><small>' + k + ' · ' + LABELS[k] + '</small></div>')
      .join('');
    $('#pgQuick').innerHTML = ep.presets
      .map((p, i) => '<button data-idx="' + i + '">' + p.join(' → ') + '</button>').join('');
    syncURL();
  }
  function syncURL() {
    const ep = ENDPOINTS[currentEP];
    const query = [];
    ep.keys.forEach((k) => {
      const el = $('#pg-' + k);
      if (el && el.value.trim()) query.push(k + '=' + encodeURIComponent(el.value.trim()));
    });
    if (ep.makeup) query.push($('#pgMakeup').checked ? 'makeup=1' : 'makeup=0');
    const url = (ORIGIN || '') + ep.path + (query.length ? '?' + query.join('&') : '');
    $('#pgUrl').textContent = url;
    return API + ep.path + (query.length ? '?' + query.join('&') : '');
  }
  function highlightJSON(value) {
    let json = JSON.stringify(value, null, 2).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    return json.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g,
      (m) => {
        let cls = 'n';
        if (/^"/.test(m)) cls = /:$/.test(m) ? 'k' : 's';
        else if (/true|false/.test(m)) cls = 'b';
        return '<span class="' + cls + '">' + m + '</span>';
      });
  }
  function renderVisual(ep, data) {
    const box = $('#pgVisual');
    box.innerHTML = '';
    const chip = (txt, hl) => {
      const span = document.createElement('span');
      span.className = 'pv-chip' + (hl ? ' hl' : '');
      span.textContent = txt;
      box.appendChild(span);
    };
    if (ep === 'check' && data && data.date) {
      chip(data.date + ' · ' + data.holiday_name, true);
      chip('day_type = ' + data.day_type);
      chip(data.is_workday ? '需要上班' : '休息日', true);
      if (data.makeup_workday) chip('调休补班', true);
      if (data.fallback) chip('fallback 降级数据', true);
      return;
    }
    const list = Array.isArray(data) ? data : (data && Array.isArray(data.days) ? data.days : null);
    if (list) {
      const work = list.filter((d) => d.is_workday).length;
      chip('共 ' + list.length + ' 天', true);
      chip('工作日 ' + work + ' 天');
      chip('休息 ' + (list.length - work) + ' 天');
      chip('法定节假日 ' + list.filter((d) => d.day_type === 'holiday').length + ' 天');
      chip('调休补班 ' + list.filter((d) => d.day_type === 'makeup_workday').length + ' 天');
      return;
    }
    if (ep === 'year' && data && Array.isArray(data.holidays)) {
      chip(data.year + ' 年', true);
      chip('法定节假日 ' + data.holidays.length + ' 天');
      chip('调休补班 ' + data.workdays.length + ' 天');
      [...new Set(data.holidays.map((h) => h.name))].forEach((n) => chip(n));
    }
  }
  async function sendRequest() {
    const requestUrl = syncURL();
    const out = $('#pgOut');
    const meta = $('#pgMeta');
    meta.className = 'pg-meta';
    meta.textContent = '请求中…';
    const t0 = performance.now();
    try {
      const res = await fetch(requestUrl, { cache: 'no-store' });
      const ms = Math.round(performance.now() - t0);
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : (json.data && Array.isArray(json.data.days) ? json.data.days : null);
      if (list && list.length > 40) {
        out.textContent = JSON.stringify({
          code: json.code, message: json.message,
          data: list.slice(0, 12).concat([{ '…': '已折叠 ' + (list.length - 20) + ' 条' }], list.slice(-8))
        }, null, 2);
        meta.className = 'pg-meta ok';
        meta.textContent = 'HTTP ' + res.status + ' · ' + ms + 'ms · 共 ' + list.length + ' 条（已折叠展示）';
        renderVisual(currentEP, json.data);
        return;
      }
      out.innerHTML = highlightJSON(json);
      meta.className = 'pg-meta ok';
      meta.textContent = 'HTTP ' + res.status + ' · ' + ms + 'ms · code ' + json.code;
      renderVisual(currentEP, json.data);
    } catch (err) {
      out.textContent = '请求失败：' + err.message + '\\n\\n请确认服务已启动，且当前页面与接口同源。';
      meta.className = 'pg-meta err';
      meta.textContent = '请求失败';
      $('#pgVisual').innerHTML = '';
    }
  }
  $('#pgEndpoint').addEventListener('change', (e) => selectEndpoint(e.target.value));
  $('#pgSend').addEventListener('click', sendRequest);
  $('#pgMakeup').addEventListener('change', syncURL);
  document.addEventListener('input', (e) => { if (e.target.closest('#pgParams')) syncURL(); });
  $('#pgParams').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendRequest(); });
  $('#pgQuick').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const preset = ENDPOINTS[currentEP].presets[+btn.dataset.idx];
    ENDPOINTS[currentEP].keys.forEach((k, i) => {
      const el = $('#pg-' + k);
      if (el) el.value = preset[i] || '';
    });
    syncURL();
    sendRequest();
  });
  selectEndpoint('check');

  /* ---------- 代码示例 ---------- */
  const snippets = () => ({
    cURL: '# 单日\\ncurl "' + ORIGIN + '/holiday/check?date=2026-10-01"\\n\\n'
      + '# 区间\\ncurl "' + ORIGIN + '/holiday/range?start=2026-09-25&end=2026-10-07"\\n\\n'
      + '# 整月 / 全年\\ncurl "' + ORIGIN + '/holiday/month?year=2026&month=10"\\n'
      + 'curl "' + ORIGIN + '/holiday/year?year=2026"',
    JavaScript: '// 浏览器 / Node 18+ 均可，无需任何依赖\\nconst BASE = \\'' + ORIGIN + '/holiday\\';\\n\\n'
      + 'async function check(date, makeup = 1) {\\n'
      + '  const res = await fetch(\`\${BASE}/check?date=\${date}&makeup=\${makeup}\`);\\n'
      + '  const { code, data } = await res.json();\\n'
      + '  if (code !== 0) throw new Error(\\'查询失败\\');\\n'
      + '  return data;\\n}\\n\\n'
      + '// { date:\\'2026-10-01\\', is_workday:false, day_type:\\'holiday\\', holiday_name:\\'国庆节\\', ... }\\n'
      + 'const day = await check(\\'2026-10-01\\');\\n'
      + 'console.log(day.is_workday ? \\'今天要上班\\' : \`放假：\${day.holiday_name}\`);\\n\\n'
      + '// 计算两个日期之间的工作日数量\\n'
      + 'async function workdaysBetween(start, end) {\\n'
      + '  const res = await fetch(\`\${BASE}/range?start=\${start}&end=\${end}\`);\\n'
      + '  const { data } = await res.json();\\n'
      + '  return data.filter((d) => d.is_workday).length;\\n}',
    Python: 'import requests\\n\\nBASE = "' + ORIGIN + '/holiday"\\n\\n'
      + 'def check(date: str, makeup: int = 1) -> dict:\\n'
      + '    """返回单日判定结果"""\\n'
      + '    r = requests.get(f"{BASE}/check", params={"date": date, "makeup": makeup}, timeout=5)\\n'
      + '    r.raise_for_status()\\n'
      + '    body = r.json()\\n'
      + '    if body["code"] != 0:\\n'
      + '        raise ValueError(body["message"])\\n'
      + '    return body["data"]\\n\\n'
      + 'day = check("2026-10-01")\\n'
      + 'print(day["holiday_name"], "工作日" if day["is_workday"] else "休息日")\\n\\n'
      + '# 定时任务 / 报表推送前先判断是否跳过节假日\\n'
      + 'if not check("2026-10-01")["is_workday"]:\\n    print("节假日不予执行")',
    Go: 'package main\\n\\nimport (\\n\\t"encoding/json"\\n\\t"fmt"\\n\\t"net/http"\\n\\t"net/url"\\n)\\n\\n'
      + 'const base = "' + ORIGIN + '/holiday"\\n\\n'
      + 'type Resp struct {\\n\\tCode int    \`json:"code"\`\\n\\tMsg  string \`json:"message"\`\\n'
      + '\\tData struct {\\n\\t\\tDate        string \`json:"date"\`\\n\\t\\tIsWorkday   bool   \`json:"is_workday"\`\\n'
      + '\\t\\tDayType     string \`json:"day_type"\`\\n\\t\\tHolidayName string \`json:"holiday_name"\`\\n\\t} \`json:"data"\`\\n}\\n\\n'
      + 'func Check(date string) (*Resp, error) {\\n'
      + '\\tu := fmt.Sprintf("%s/check?date=%s", base, url.QueryEscape(date))\\n'
      + '\\tres, err := http.Get(u)\\n\\tif err != nil {\\n\\t\\treturn nil, err\\n\\t}\\n\\tdefer res.Body.Close()\\n\\n'
      + '\\tvar r Resp\\n\\tif err := json.NewDecoder(res.Body).Decode(&r); err != nil {\\n\\t\\treturn nil, err\\n\\t}\\n\\treturn &r, nil\\n}\\n\\n'
      + 'func main() {\\n\\tr, _ := Check("2026-10-01")\\n\\tfmt.Println(r.Data.HolidayName, r.Data.IsWorkday)\\n}',
    'AI 提示词': '# 把下面这段话直接发给任意 AI 编程助手即可完成接入\\n\\n'
      + '请阅读 ' + ORIGIN + '/ai.md ，\\n使用其中定义的接口为我实现一个 \`isWorkday(date)\` 工具函数：\\n\\n'
      + '1. 输入支持 "2026-10-01" 与 "20261001" 两种格式；\\n'
      + '2. 返回是否为工作日，并附带 day_type 与 holiday_name；\\n'
      + '3. 请求失败时按本地周末规则兜底，并标记 fallback；\\n'
      + '4. 带单元测试，覆盖法定节假日、调休补班、普通周末三种情况。'
  });

  const SNIPPETS = snippets();
  $('#qsTabs').innerHTML = Object.keys(SNIPPETS)
    .map((k, i) => '<button data-k="' + k + '" class="' + (i === 0 ? 'active' : '') + '">' + k + '</button>').join('');
  function paintCode(k) { $('#qsCode').textContent = SNIPPETS[k]; }
  paintCode('cURL');
  $('#qsTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    $$('#qsTabs button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    paintCode(btn.dataset.k);
  });

  /* ---------- FAQ ---------- */
  $('#faqList').addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-q');
    if (btn) btn.parentElement.classList.toggle('open');
  });

  requestAnimationFrame(observeReveals);
  probe();
})();
`;
