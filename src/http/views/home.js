import { HolidayCalendar } from '../../HolidayCalendar.js';
import { todayString } from '../../date.js';
import {
    ENDPOINTS,
    ERRORS,
    FIELDS,
    RULES,
    SAMPLE_SINGLE,
    SAMPLE_YEAR,
    SERVICE_DESCRIPTION,
    SERVICE_NAME,
    SUPPORTED_YEARS,
    normalizeOrigin,
} from '../docsModel.js';
import { HOME_CSS } from './home-css.js';
import { HOME_SCRIPT } from './home-js.js';
import { buildYearModel, renderCalendarSections } from './calendar.js';

const AUTHOR = '魏小墨';
const AUTHOR_SITE = 'https://wxm.wang';
const WEEK_CN = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

const FEATURES = [
    ['f-indigo', '单日查询', '判断指定日期是工作日、周末、法定节假日还是调休补班日，返回结构化判定结果与中文节日名。',
        '<path d="M8 3v4M16 3v4M3 11h18"/><circle cx="12" cy="16" r="1.6" fill="currentColor" stroke="none"/>', '/holiday/check'],
    ['f-sky', '区间查询', '一次获取连续日期（含首尾，最多 1000 天）的完整结果，适合工期计算、SLA 倒计时、请假跨度统计。',
        '<path d="M4 7h16M4 12h10M4 17h13"/><circle cx="20" cy="12" r="1.6" fill="currentColor" stroke="none"/>', '/holiday/range'],
    ['f-violet', '整月视图', '快速拿到某年某月每一天的判定结果，日历组件、排班表格可直接绑定渲染。',
        '<path d="M3 9h18M8 2v4M16 2v4"/><path d="M7 13h3M7 17h3M14 13h3M14 17h3"/>', '/holiday/month'],
    ['f-amber', '全年安排', '返回整年的法定节假日清单与调休补班日期，一眼看清每个假期的起止与需要补班的日子。',
        '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 3v18M3 12h18"/>', '/holiday/year'],
    ['f-teal', '优雅降级', '未维护数据的年份不报错，仅按周末规则判断，并在响应中用 fallback 字段明确标记。',
        '<path d="M4 17l5-5 4 4 7-8"/><path d="M14 8h6v6"/><path d="M4 21h16"/>', 'fallback: true'],
    ['f-rose', 'AI 友好', '提供 /llms.txt 与 /ai.md，可直接投喂给 AI 编程工具完成自动接入。',
        '<path d="M12 3a6 6 0 0 1 6 6c0 2-1 3-1 5a5 5 0 0 1-10 0c0-2-1-3-1-5a6 6 0 0 1 6-6z"/><circle cx="12" cy="14" r="2.4"/><path d="M9 20h6"/>', 'GET /ai.md'],
];

const USAGES = [
    ['01', '考勤与排班系统', '打卡规则、班次生成、工时结算前置判断，避免因调休安排遗漏导致的误判与申诉。'],
    ['02', '流程引擎与 SLA', '审批时效、工单响应、违约倒计时按工作日口径计算，节假日自动顺延。'],
    ['03', '交易与结算日历', '清算日推算、资金到账预估、报价有效期校正，贴合真实开市节奏。'],
    ['04', '前端日历组件', '整月接口一次返回全月数据，直接驱动 UI 渲染，节假日与补班标记零成本实现。'],
    ['05', '自动化脚本', '定时任务、数据同步、报表推送在执行前先问一次接口，节假日自动跳过发送。'],
    ['06', 'AI Agent 工具调用', '把 /ai.md 交给 AI 编程工具，几句话即可完成自然语言日期判断能力的接入。'],
];

const FAQs = [
    ['需要注册或申请 API Key 吗？', '完全不需要。接口无需任何鉴权参数，复制 URL 即可调用，也没有强制的频率限制策略。请合理使用，避免在前端高频轮询。'],
    ['数据从哪来，多久更新一次？', '数据依据国务院办公厅每年公布的节假日安排通知人工维护。新一年的安排发布后统一校准入库，官方口径调整时同步更新。'],
    ['查询未维护的年份会报错吗？', '不会。未配置数据的年份会按纯周末规则返回，并在 fallback 字段标记为 true，上层可以据此决定是否需要告警。'],
    ['为什么调休补班默认是工作日？', '因为国务院安排的补班日在实际考勤口径中确实需要上班。若你的业务希望把补班周末视作休息，传 makeup=0 即可切换。'],
    ['可以商用吗？有没有 SDK？', '可以直接商用。由于接口设计足够简单，本服务不提供 SDK——任意语言的 HTTP 客户端都能在几行内完成封装，页面「一分钟接入」中给出了多门语言的示例。'],
    ['时区怎么处理？有夏令时吗？', '所有日期计算固定按 UTC+8 处理，中国全境不实行夏令时，因此全年判定结果稳定，无需额外校正。'],
];

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function inlineJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

function ringSVG(dayType) {
    const color = dayType === 'holiday' ? '#f43f5e'
        : dayType === 'makeup_workday' ? '#f59e0b'
            : dayType === 'weekend' ? '#60a5fa' : '#94a3b8';
    const circumference = 2 * Math.PI * 26;
    const working = dayType === 'workday' || dayType === 'makeup_workday';
    const offset = circumference * (working ? 0 : 0.66);

    return `<svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="26" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="6"/>
      <circle cx="36" cy="36" r="26" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" transform="rotate(-90 36 36)"/>
      <text x="36" y="43" text-anchor="middle" font-size="19" font-weight="800" fill="#fff"
        font-family="ui-sans-serif,system-ui">${working ? '班' : '休'}</text>
    </svg>`;
}

const TYPE_BADGE = {
    holiday: '法定节假日',
    weekend: '周末休息',
    makeup_workday: '调休补班',
    workday: '正常上班',
};

function renderTodayCard(calendar, today, model) {
    const todayResult = calendar.check(today);
    const fields = [
        `day_type: ${todayResult.dayType}`,
        `is_workday: ${todayResult.isWorkday}`,
        `makeup_workday: ${todayResult.makeupWorkday}`,
        `fallback: ${todayResult.fallback}`,
    ].map((text) => `<span>${escapeHtml(text)}</span>`).join('');

    const holidayPercent = Math.round((model.holidayCount / model.total) * 100 * 3);
    const workdayPercent = Math.round((model.workdayCount / model.total) * 100);

    return `<aside class="hero-card glass" id="todayCard">
      <div class="hc-top">
        <div>
          <div class="hc-label">实时查询 · 默认当天</div>
          <div class="hc-date" id="todayDate">${today}</div>
          <div class="hc-week" id="todayWeek">${WEEK_CN[new Date(`${today}T00:00:00Z`).getUTCDay()]}</div>
        </div>
        <div class="hc-ring" id="todayRing">${ringSVG(todayResult.dayType)}</div>
      </div>
      <div class="hc-status">
        <span class="hc-badge t-${todayResult.dayType}" id="todayBadge">${TYPE_BADGE[todayResult.dayType] ?? todayResult.dayType}</span>
        <span class="hc-name" id="todayName">${escapeHtml(todayResult.holidayName)}</span>
      </div>
      <div class="hc-field" id="todayField">${fields}</div>
      <div class="hc-picker">
        <label for="todayInput">切换日期</label>
        <input type="date" id="todayInput" value="${today}" />
        <label class="switch"><input type="checkbox" id="todayMakeup" checked /><span>makeup=1（补班算工作日）</span></label>
      </div>
      <div class="hc-src" id="todaySrc">数据来源：服务端 HolidayCalendar 实时判定</div>
      <div class="hc-year">
        <div class="hy-row"><span id="restLabel">${model.year} 年法定假期</span><b id="restDays">${model.holidayCount} 天</b></div>
        <div class="hy-bar"><i id="restBar" style="width:${holidayPercent}%"></i></div>
        <div class="hy-row sub"><span id="workLabel">${model.year} 年实际工作日</span><b id="workDays">${model.workdayCount} 天</b></div>
        <div class="hy-bar alt"><i id="workBar" style="width:${workdayPercent}%"></i></div>
      </div>
    </aside>`;
}

function renderEndpointDocs(base) {
    return ENDPOINTS.map((endpoint) => {
        const rows = endpoint.params.map(
            (param) => `<tr><td><code>${escapeHtml(param.name)}</code></td><td>${param.required ? '是' : '否'}</td>` +
                `<td>${escapeHtml(param.default)}</td><td>${escapeHtml(param.description)}</td></tr>`
        ).join('');
        const example = `curl "${escapeHtml(base + endpoint.example)}"`;

        return `<article class="card doc">
        <div class="doc-head"><span class="method">GET</span><h3>${endpoint.path} <small>${escapeHtml(endpoint.name)}</small></h3></div>
        <p>${escapeHtml(endpoint.description)}</p>
        <table class="tbl">
          <thead><tr><th>参数</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="doc-code"><code>${example}</code><button class="copy-btn" data-copy='${example}'>复制</button></div>
      </article>`;
    }).join('\n');
}

/**
 * 首页渲染入口：完全自包含的 HTML，不依赖任何静态资源，可直接由边缘函数返回。
 */
export function renderHomeView(origin = '') {
    const base = escapeHtml(normalizeOrigin(origin));
    const calendar = HolidayCalendar.create();
    const today = todayString();
    const currentYear = Number(today.slice(0, 4));

    const { html: calendarHtml, models } = renderCalendarSections(calendar, SUPPORTED_YEARS, today);
    const statsYear = models.has(currentYear) ? currentYear : SUPPORTED_YEARS[SUPPORTED_YEARS.length - 1];
    const statsModel = models.get(statsYear) ?? buildYearModel(calendar, statsYear, today);

    const featureCards = FEATURES.map(
        ([cls, name, desc, icon, api]) => `<article class="card feature">
        <div class="f-icon ${cls}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></div>
        <h3>${name}</h3>
        <p>${desc}</p>
        <code class="f-api">${escapeHtml(api)}</code>
      </article>`
    ).join('\n');

    const ruleRows = RULES.map(
        (rule) => `<tr><td><span class="num">${rule[0]}</span></td><td>${escapeHtml(rule[1])}</td>` +
            `<td><code>${escapeHtml(rule[2])}</code></td><td><code>${escapeHtml(rule[3])}</code></td></tr>`
    ).join('');

    const fieldRows = FIELDS.map(
        (field) => `<tr><td><code>${escapeHtml(field.name)}</code></td><td>${escapeHtml(field.type)}</td><td>${escapeHtml(field.description)}</td></tr>`
    ).join('');

    const errorRows = ERRORS.map(
        (error) => `<tr><td><code class="${error[0] === '0' ? 'ok' : 'warn'}">${escapeHtml(error[0])}</code></td>` +
            `<td>${escapeHtml(error[1])}</td><td>${escapeHtml(error[2])}</td></tr>`
    ).join('');

    const usageCards = USAGES.map(
        ([num, name, desc]) => `<div class="card usage">
        <div class="u-num">${num}</div>
        <h3>${name}</h3>
        <p>${desc}</p>
      </div>`
    ).join('\n');

    const faqItems = FAQs.map(
        ([question, answer], index) => `<div class="faq-item${index === 0 ? ' open' : ''}">
        <button class="faq-q">${escapeHtml(question)}<i>+</i></button>
        <div class="faq-a"><p>${escapeHtml(answer)}</p></div>
      </div>`
    ).join('');

    const yearTabs = SUPPORTED_YEARS.map((year) => `<button data-year="${year}">${year}</button>`).join('');
    const yearsText = SUPPORTED_YEARS.join(' · ');

    const heroCommand = `curl "${escapeHtml(`${normalizeOrigin(origin)}/holiday/check?date=2026-10-01`)}"`;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${SERVICE_NAME} · ${SERVICE_DESCRIPTION}</title>
<meta name="description" content="零第三方依赖的中国工作日、周末、法定节假日与调休补班查询服务。支持单日、区间、整月、全年四种粒度，CORS 全开，无需鉴权，腾讯云 CDN 全网加速。" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%234f46e5'/%3E%3Crect x='7' y='9' width='18' height='16' rx='3' fill='white'/%3E%3Crect x='7' y='9' width='18' height='4' rx='2' fill='%23f43f5e'/%3E%3Crect x='11' y='6' width='2.5' height='5' rx='1.2' fill='%23fbbf24'/%3E%3Crect x='18.5' y='6' width='2.5' height='5' rx='1.2' fill='%23fbbf24'/%3E%3C/svg%3E" />
<style>${HOME_CSS}</style>
</head>
<body data-today="${today}">
<script>window.__HOLIDAY_ORIGIN__=${inlineJson(normalizeOrigin(origin))};</script>

<header class="nav" id="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="#top">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="26" height="26"><rect width="32" height="32" rx="9" fill="url(#bg1)"/><rect x="7" y="10" width="18" height="15" rx="3.5" fill="#fff"/><path d="M7 14.5h18v3.2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3.2z" fill="#eef2ff"/><rect x="7" y="10" width="18" height="4.5" rx="2.2" fill="#f43f5e"/><rect x="11" y="6.5" width="2.6" height="5.5" rx="1.3" fill="#fbbf24"/><rect x="18.4" y="6.5" width="2.6" height="5.5" rx="1.3" fill="#fbbf24"/><circle cx="16" cy="20.6" r="3.2" fill="#4f46e5" opacity=".14"/><path d="M14.6 20.6l1.1 1.1 2.2-2.3" stroke="#4f46e5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs></svg>
      </span>
      <span class="brand-text">${SERVICE_NAME}</span>
      <span class="brand-by">${AUTHOR}</span>
    </a>
    <nav class="nav-links">
      <a href="#features">能力</a>
      <a href="#rule">判定规则</a>
      <a href="#calendar">假期日历</a>
      <a href="#playground">在线调试</a>
      <a href="#docs">接口文档</a>
      <a href="#usage">使用实践</a>
    </nav>
    <div class="nav-actions">
      <span class="status-chip" id="apiChip" title="点击重新检测服务可用性"><i class="dot"></i><span id="apiChipText">检测服务中</span></span>
      <a class="btn btn-primary btn-sm" href="#playground">立即调用</a>
    </div>
    <button class="nav-toggle" id="navToggle" aria-label="展开导航"><span></span><span></span><span></span></button>
  </div>
</header>

<section class="hero" id="top">
  <div class="hero-bg" aria-hidden="true"><div class="grid-mask"></div><div class="orb orb-a"></div><div class="orb orb-b"></div><div class="orb orb-c"></div></div>
  <div class="wrap hero-inner">
    <div class="hero-copy">
      <div class="hero-badge"><span class="pulse"></span>零第三方依赖 · 腾讯云 CDN 加速 · 无需鉴权</div>
      <h1 class="hero-title">中国工作日与<br /><span class="grad">节假日查询 API</span></h1>
      <p class="hero-desc">
        一行 HTTP 请求，准确判断任意一天是<span class="hl">工作日</span>、<span class="hl">周末</span>、<span class="hl">法定节假日</span>还是<span class="hl">调休补班日</span>。
        数据按国务院办公厅通知人工维护，采用腾讯云 CDN 加速，全球就近命中缓存、毫秒级响应。
      </p>
      <div class="hero-tags">
        <span class="tag"><b>GET</b> / <b>POST</b> 均支持</span>
        <span class="tag">CORS 已开启</span>
        <span class="tag">数据年份 ${yearsText}</span>
        <span class="tag">时区 UTC+8</span>
      </div>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#playground"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l14 9-14 9V3z"/></svg>在线调试 API</a>
        <a class="btn btn-ghost" href="#docs">阅读接口文档</a>
      </div>
      <div class="hero-meta">
        <code>${heroCommand}</code>
        <button class="copy-btn" data-copy='${heroCommand}' title="复制">复制</button>
      </div>
    </div>
    ${renderTodayCard(calendar, today, statsModel)}
  </div>
  <div class="hero-wave" aria-hidden="true"><svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,64 C240,110 420,20 720,48 C1020,76 1200,110 1440,64 L1440,120 L0,120 Z" fill="#f7f8fc"/></svg></div>
</section>

<section class="strip">
  <div class="wrap strip-grid">
    <div class="stat"><b>${SUPPORTED_YEARS.length}<span style="font-size:15px">年</span></b><span>维护数据年份 ${yearsText}</span></div>
    <div class="stat"><b>${ENDPOINTS.length}</b><span>开放查询接口</span></div>
    <div class="stat"><b>0</b><span>第三方运行时依赖</span></div>
    <div class="stat"><b>∞</b><span>无需鉴权 / 无调用门槛</span></div>
    <div class="stat"><b>UTC+8</b><span>固定时区，无夏令时</span></div>
  </div>
</section>

<section class="section" id="features">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Capabilities</span><h2>六种核心能力，覆盖全部排班场景</h2>
      <p>从单日判断到全年安排，一套接口覆盖考勤系统、流程引擎、倒计时组件与自动化脚本的全部需求。</p></div>
    <div class="feature-grid">${featureCards}</div>
  </div>
</section>

<section class="section section-alt" id="rule">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">How it works</span><h2>一次请求背后发生了什么</h2>
      <p>请求经腾讯云 CDN 就近接入后，按固定优先级依次匹配数据表，命中即返回，全程无数据库查询、无外部依赖。</p></div>
    <div class="arch-wrap card">
      <svg class="arch-svg" viewBox="0 0 1080 300" role="img" aria-label="请求处理架构图">
        <defs>
          <linearGradient id="gA" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#2563eb"/></linearGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0ea5e9"/><stop offset="1" stop-color="#06b6d4"/></linearGradient>
          <linearGradient id="gC" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f59e0b"/><stop offset="1" stop-color="#f97316"/></linearGradient>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/></marker>
        </defs>
        <g><rect x="20" y="96" width="180" height="92" rx="16" fill="#fff" stroke="#e2e8f0"/><rect x="20" y="96" width="6" height="92" rx="3" fill="url(#gA)"/>
          <text x="46" y="132" class="n-t">你的服务 / 浏览器</text><text x="46" y="154" class="n-s">GET · POST · CORS 全开</text>
          <path d="M14 118 h14 M14 142 h14 M14 166 h14" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round"/></g>
        <path d="M206 142 H262" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
        <g><rect x="268" y="60" width="240" height="164" rx="18" fill="url(#gA)"/>
          <text x="292" y="94" class="n-t-white">腾讯云 CDN 加速</text><text x="292" y="116" class="n-s-white">全球边缘节点就近缓存命中</text>
          <rect x="290" y="132" width="196" height="30" rx="8" fill="rgba(255,255,255,.18)"/><text x="304" y="152" class="n-s-white">参数解析 · 格式归一</text>
          <rect x="290" y="168" width="196" height="30" rx="8" fill="rgba(255,255,255,.18)"/><text x="304" y="188" class="n-s-white">YYYY-MM-DD / YYYYMMDD</text></g>
        <path d="M514 142 H580" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
        <g><rect x="586" y="60" width="200" height="164" rx="18" fill="url(#gB)"/>
          <text x="610" y="94" class="n-t-white">优先级判定引擎</text>
          <text x="610" y="118" class="n-s-white">① 调休补班（makeup）</text><text x="610" y="140" class="n-s-white">② 法定节假日</text>
          <text x="610" y="162" class="n-s-white">③ 周六 / 周日</text><text x="610" y="184" class="n-s-white">④ 其余 → 工作日</text>
          <text x="610" y="206" class="n-s-white">⑤ 无数据年 → fallback</text></g>
        <path d="M792 142 H848" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow)"/>
        <g><rect x="854" y="60" width="206" height="164" rx="18" fill="url(#gC)"/>
          <text x="878" y="94" class="n-t-white">节假日数据集</text>
          <text x="878" y="118" class="n-s-white">${yearsText} 年度安排</text>
          <text x="878" y="146" class="n-s-white">来源：国务院办公厅</text><text x="878" y="170" class="n-s-white">节假日安排通知</text></g>
        <path d="M957 232 V262 H120" stroke="#94a3b8" stroke-width="2" fill="none" marker-end="url(#arrow)" stroke-dasharray="5 4"/>
        <g><rect x="20" y="248" width="180" height="34" rx="10" fill="#ecfdf5" stroke="#a7f3d0"/>
          <text x="110" y="270" class="n-t-sm" text-anchor="middle" fill="#047857">{ code:0, data:{...} } · 毫秒级</text></g>
        <rect x="268" y="248" width="792" height="34" rx="10" fill="#f1f5f9" stroke="#e2e8f0"/>
        <text x="664" y="270" class="n-t-sm" text-anchor="middle" fill="#475569">统一响应信封 · 明确的 Cache-Control · 精简错误码</text>
      </svg>
    </div>
    <div class="rule-grid">
      <div class="card rule-card"><h3><span class="num">01</span>判定优先级</h3>
        <table class="tbl compact"><thead><tr><th>优先级</th><th>命中条件</th><th>day_type</th><th>是否工作日</th></tr></thead><tbody>${ruleRows}</tbody></table>
        <p class="note">日期时区固定按 UTC+8 计算，中国无夏令时，全年判定结果稳定一致。</p></div>
      <div class="card rule-card"><h3><span class="num">02</span>四种日期类型</h3>
        <div class="legend-list">
          <div class="legend-item"><span class="lg lg-holiday"></span><div><b>法定节假日</b><i>holiday</i><em>国务院公布的放假日期，如国庆节、春节</em></div></div>
          <div class="legend-item"><span class="lg lg-weekend"></span><div><b>周末</b><i>weekend</i><em>未被调休占用的周六周日</em></div></div>
          <div class="legend-item"><span class="lg lg-makeup"></span><div><b>调休补班</b><i>makeup_workday</i><em>假期前后被占用补班的周末，默认计为工作日</em></div></div>
          <div class="legend-item"><span class="lg lg-workday"></span><div><b>工作日</b><i>workday</i><em>其余需要正常上班的日期</em></div></div>
        </div>
        <div class="tip"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
          <span><b>makeup 开关</b>：传 <code>makeup=0</code> 时，补班周末不再算作工作日，可按业务口径自由切换。</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="calendar">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Calendar</span><h2>全年假期日历，一眼看清放假与补班</h2>
      <p>日历由服务端按 <code>data/holidays</code> 的实际数据预渲染，与接口返回结果完全一致。悬停查看详情，点击下方节日卡可定位到对应月份。</p></div>
    <div class="cal-bar">
      <div class="cal-tabs" id="yearTabs">${yearTabs}</div>
      <div class="cal-legend">
        <span><i class="lg lg-workday"></i>工作日</span>
        <span><i class="lg lg-weekend"></i>周末</span>
        <span><i class="lg lg-holiday"></i>法定节假日</span>
        <span><i class="lg lg-makeup"></i>调休补班</span>
        <span><i class="lg lg-today"></i>今天</span>
      </div>
    </div>
    <div id="calWrap">${calendarHtml}</div>
    <div class="tooltip" id="tooltip" hidden></div>
  </div>
</section>

<section class="section section-alt" id="playground">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Playground</span><h2>在线调试台 · 直接发起真实请求</h2>
      <p>接口已开启 CORS，浏览器可直接调用。选择端点、填写参数，立即查看真实响应与耗时。</p></div>
    <div class="pg-wrap">
      <div class="card pg-panel">
        <div class="pg-row"><label>接口</label><select id="pgEndpoint"></select></div>
        <div class="pg-desc" id="pgDesc"></div>
        <div class="pg-params" id="pgParams"></div>
        <div class="pg-row inline">
          <label class="switch"><input type="checkbox" id="pgMakeup" checked /><span>makeup=1</span></label>
          <button class="btn btn-primary" id="pgSend"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>发送请求</button>
        </div>
        <div class="pg-url"><span>GET</span><code id="pgUrl"></code><button class="copy-btn" data-copy-src="#pgUrl" title="复制请求地址">复制</button></div>
        <div class="pg-quick" id="pgQuick"></div>
      </div>
      <div class="card pg-panel pg-result">
        <div class="pg-res-head"><span class="pg-title">响应结果</span><span class="pg-meta" id="pgMeta">等待请求</span></div>
        <pre class="pg-code" id="pgOut">点击「发送请求」查看真实响应。\n\n{\n  "code": 0,\n  "message": "ok",\n  "data": { ... }\n}</pre>
        <div class="pg-visual" id="pgVisual"></div>
      </div>
    </div>
  </div>
</section>

<section class="section" id="quickstart">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Quick Start</span><h2>一分钟接入</h2>
      <p>复制下方任意语言的示例代码，替换日期即可运行。无需注册、无需密钥、无调用频率门槛。</p></div>
    <div class="qs-wrap card">
      <div class="qs-tabs" id="qsTabs"></div>
      <div class="qs-body"><pre class="qs-code" id="qsCode"></pre><button class="copy-btn float" data-copy-src="#qsCode" title="复制代码">复制</button></div>
    </div>
  </div>
</section>

<section class="section section-alt" id="docs">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">API Reference</span><h2>接口文档</h2>
      <p>所有接口统一返回 <code>{ "code": 0, "message": "ok", "data": ... }</code>；<code>code</code> 非 0 时为错误码，并同时作为 HTTP 状态码返回。</p></div>
    <div class="doc-list">${renderEndpointDocs(base)}</div>
    <div class="doc-grid">
      <div class="card"><h3 class="h3-inline"><span class="bar"></span>单日对象返回字段</h3>
        <table class="tbl"><thead><tr><th>字段</th><th>类型</th><th>说明</th></tr></thead><tbody>${fieldRows}</tbody></table>
        <pre class="doc-code"><code>${escapeHtml(JSON.stringify(SAMPLE_SINGLE, null, 2))}</code></pre></div>
      <div class="card"><h3 class="h3-inline"><span class="bar"></span>错误码与缓存策略</h3>
        <table class="tbl"><thead><tr><th>code</th><th>message</th><th>说明</th></tr></thead><tbody>${errorRows}</tbody></table>
        <p class="note">带明确 <code>date</code> / <code>start</code> / <code>end</code> / <code>year</code> 的请求返回 <code>Cache-Control: public, max-age=86400</code>；依赖「当天」的请求返回 <code>no-store</code>。</p></div>
    </div>
  </div>
</section>

<section class="section" id="usage">
  <div class="wrap">
    <div class="sec-head"><span class="eyebrow">Use Cases</span><h2>典型落地场景</h2>
      <p>把「今天要不要上班」这件小事交给确定性数据，业务系统不必再维护一份容易过期的节假日表。</p></div>
    <div class="usage-grid">${usageCards}</div>
    <div class="faq card"><h3 class="h3-inline"><span class="bar"></span>常见问题</h3><div class="faq-list" id="faqList">${faqItems}</div></div>
  </div>
</section>

<section class="cta">
  <div class="wrap cta-inner">
    <div class="cta-copy"><h2>现在就把节假日逻辑交出去</h2>
      <p>无需鉴权、无 SDK、无第三方依赖。复制一条 curl，即可在你的系统里获得一份持续维护的中国节假日日历。</p></div>
    <div class="cta-actions"><a class="btn btn-light" href="#playground">打开在线调试台</a><a class="btn btn-outline-light" href="#docs">查看接口文档</a></div>
  </div>
</section>

<footer class="footer">
  <div class="wrap footer-inner">
    <div class="f-brand">
      <div class="brand-text">${SERVICE_NAME}</div>
      <p>中国工作日 / 节假日查询服务 · 数据人工维护校验 · 腾讯云 CDN 加速</p>
    </div>
    <div class="f-links">
      <div><h4>接口</h4>${ENDPOINTS.map((endpoint) => `<a href="#docs">${endpoint.path}</a>`).join('')}</div>
      <div><h4>资源</h4><a href="/llms.txt">llms.txt</a><a href="/ai.md">ai.md</a><a href="/holiday/">端点列表</a></div>
      <div><h4>数据来源</h4><span>国务院办公厅节假日通知</span><span>时区 UTC+8 · 无夏令时</span><span>覆盖 ${yearsText}</span></div>
    </div>
  </div>
  <div class="wrap f-bottom">
    <span>数据源自国务院办公厅公布的节假日安排通知，人工核对后发布。</span>
    <span>© ${statsYear} ${SERVICE_NAME} · 由 <b><a href="${AUTHOR_SITE}" target="_blank" rel="noopener">${AUTHOR}</a></b> 设计与维护</span>
  </div>
</footer>

<script>${HOME_SCRIPT}</script>
</body>
</html>`;
}
