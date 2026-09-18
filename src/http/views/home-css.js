/**
 * 首页样式常量。
 * 边缘运行环境没有静态资源托管能力，样式必须随 HTML 一并下发。
 * 修改本文件即可直接生效，无需构建步骤。
 */
export const HOME_CSS = `/* =========================================================
   Holiday API Landing · Stylesheet
   设计基线：浅色内容区 + 深色 Hero / CTA，靛蓝主色，卡片化信息层次
   ========================================================= */

:root {
  --indigo: #4f46e5;
  --indigo-600: #4338ca;
  --blue: #2563eb;
  --sky: #0ea5e9;
  --cyan: #06b6d4;
  --amber: #f59e0b;
  --rose: #f43f5e;
  --teal: #14b8a6;

  --c-work: #94a3b8;
  --c-weekend: #60a5fa;
  --c-holiday: #ef4444;
  --c-makeup: #f59e0b;
  --c-today: #4f46e5;

  --ink: #0f172a;
  --ink-2: #334155;
  --ink-3: #64748b;
  --ink-4: #94a3b8;
  --line: #e6e9f2;
  --line-2: #eef1f7;
  --bg: #ffffff;
  --bg-soft: #f7f8fc;
  --bg-alt: #f8f9fd;

  --radius: 16px;
  --radius-lg: 22px;
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, .04), 0 2px 8px rgba(15, 23, 42, .04);
  --shadow: 0 4px 12px rgba(15, 23, 42, .05), 0 16px 36px rgba(15, 23, 42, .06);
  --shadow-lg: 0 8px 20px rgba(15, 23, 42, .06), 0 28px 60px rgba(15, 23, 42, .10);

  --font: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", sans-serif;
  --mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: var(--font);
  color: var(--ink);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  line-height: 1.7;
}
h1, h2, h3, h4 { margin: 0; line-height: 1.25; letter-spacing: -.02em; font-weight: 700; }
p { margin: 0; }
a { color: inherit; text-decoration: none; }
code, pre { font-family: var(--mono); }
ul { margin: 0; padding: 0; list-style: none; }
.wrap { width: min(1200px, 92vw); margin: 0 auto; }

/* ---------- 通用组件 ---------- */
.card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 26px;
}
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: 11px;
  font-size: 14.5px; font-weight: 600; cursor: pointer;
  border: 1px solid transparent; transition: .2s ease;
  white-space: nowrap;
}
.btn-sm { padding: 8px 14px; font-size: 13.5px; border-radius: 9px; }
.btn-primary {
  background: linear-gradient(135deg, #5b52f0, #2f6ef5);
  color: #fff; box-shadow: 0 6px 18px rgba(79, 70, 229, .32);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(79, 70, 229, .40); }
.btn-ghost { background: rgba(255,255,255,.10); color: #fff; border-color: rgba(255,255,255,.28); backdrop-filter: blur(6px); }
.btn-ghost:hover { background: rgba(255,255,255,.18); transform: translateY(-2px); }
.btn-light { background: #fff; color: var(--indigo-600); }
.btn-light:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(0,0,0,.18); }
.btn-outline-light { color: #fff; border-color: rgba(255,255,255,.5); }
.btn-outline-light:hover { background: rgba(255,255,255,.12); transform: translateY(-2px); }

.section { padding: 96px 0; }
.section-alt { background: var(--bg-alt); border-block: 1px solid var(--line-2); }
.sec-head { max-width: 760px; margin-bottom: 46px; }
.sec-head h2 { font-size: clamp(26px, 3.4vw, 40px); margin: 12px 0 14px; }
.sec-head p { color: var(--ink-3); font-size: 16px; }
.eyebrow {
  display: inline-block; font-size: 12.5px; font-weight: 700; letter-spacing: .16em;
  text-transform: uppercase; color: var(--indigo);
  background: #eef0ff; padding: 5px 12px; border-radius: 999px;
}
.note { font-size: 13.5px; color: var(--ink-3); margin-top: 12px; }
.h3-inline { display: flex; align-items: center; gap: 10px; font-size: 17px; margin-bottom: 16px; }
.h3-inline .bar { width: 4px; height: 16px; border-radius: 3px; background: linear-gradient(180deg, var(--indigo), var(--blue)); }

/* ---------- 导航 ---------- */
.nav {
  position: sticky; top: 0; z-index: 60;
  background: rgba(255,255,255,.82); backdrop-filter: saturate(180%) blur(14px);
  border-bottom: 1px solid transparent; transition: .25s ease;
}
.nav.scrolled { border-bottom-color: var(--line); box-shadow: 0 6px 20px rgba(15,23,42,.05); }
.nav-inner { display: flex; align-items: center; gap: 24px; height: 66px; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 17.5px; letter-spacing: -.03em; }
.brand-mark { display: inline-flex; }
.brand-text { color: var(--ink); }
.brand-dot { color: var(--indigo); }
.brand-by {
  font-size: 11.5px; font-weight: 500; color: var(--ink-4); white-space: nowrap;
  padding-left: 11px; border-left: 1px solid var(--line); letter-spacing: .02em;
}
.nav-links { display: flex; gap: 4px; margin-left: auto; }
.nav-links a {
  padding: 7px 13px; border-radius: 9px; font-size: 14.5px; font-weight: 500;
  color: var(--ink-2); transition: .18s ease;
}
.nav-links a:hover { background: #f1f3fb; color: var(--indigo); }
.nav-actions { display: flex; align-items: center; gap: 12px; }
.status-chip {
  display: inline-flex; align-items: center; gap: 7px; cursor: pointer;
  font-size: 12.5px; font-weight: 600; color: var(--ink-3);
  background: #fff; border: 1px solid var(--line); padding: 6px 12px; border-radius: 999px;
}
.status-chip .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink-4); box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
.status-chip.online .dot { background: #10b981; animation: ping 2s infinite; }
.status-chip.offline .dot { background: #ef4444; }
@keyframes ping { 0%{box-shadow:0 0 0 0 rgba(16,185,129,.45)} 70%{box-shadow:0 0 0 7px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
.nav-toggle { display: none; background: none; border: 0; padding: 8px; cursor: pointer; }
.nav-toggle span { display: block; width: 20px; height: 2px; background: var(--ink); margin: 4px 0; border-radius: 2px; }

/* ---------- Hero ---------- */
.hero { position: relative; padding: 88px 0 108px; overflow: hidden; color: #fff;
  background: radial-gradient(120% 120% at 12% 10%, #24215e 0%, #1b1d4d 42%, #131a44 100%); }
.hero-bg { position: absolute; inset: 0; }
.grid-mask {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(75% 65% at 30% 30%, #000 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(75% 65% at 30% 30%, #000 40%, transparent 100%);
}
.orb { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; }
.orb-a { width: 420px; height: 420px; background: #4f46e5; top: -120px; left: -80px; }
.orb-b { width: 380px; height: 380px; background: #06b6d4; bottom: -140px; right: 8%; }
.orb-c { width: 300px; height: 300px; background: #f43f5e; top: 30%; left: 42%; opacity: .28; }
.hero-inner { position: relative; display: grid; grid-template-columns: 1.15fr .85fr; gap: 56px; align-items: center; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600;
  padding: 6px 14px; border-radius: 999px; color: #d7dbff;
  background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.16);
}
.hero-badge .pulse { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 4px rgba(52,211,153,.22); }
.hero-title { font-size: clamp(34px, 5vw, 60px); margin: 22px 0 18px; letter-spacing: -.035em; font-weight: 800; }
.grad {
  background: linear-gradient(100deg, #a5b4fc 0%, #7dd3fc 45%, #5eead4 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.hero-desc { font-size: 17px; color: rgba(255,255,255,.76); max-width: 560px; }
.hero-desc .hl { color: #fff; font-weight: 600; border-bottom: 1px dashed rgba(255,255,255,.4); }
.hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 30px; }
.tag {
  font-size: 12.5px; font-weight: 500; padding: 5px 11px; border-radius: 8px;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.14); color: rgba(255,255,255,.85);
}
.tag b { color: #a5b4fc; }
.hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-meta {
  margin-top: 26px; display: flex; align-items: center; gap: 10px;
  background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.12);
  padding: 10px 12px 10px 14px; border-radius: 12px; max-width: 600px; overflow: hidden;
}
.hero-meta code { flex: 1; min-width: 0; font-size: 12.5px; color: #a5b4fc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.copy-btn {
  margin-left: auto; flex: none; cursor: pointer; font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.16); color: #fff;
  padding: 4px 10px; border-radius: 7px; transition: .18s;
}
.copy-btn:hover { background: rgba(255,255,255,.2); }
.copy-btn.done { background: #10b981; border-color: #10b981; color: #fff; }
.hero-wave { position: absolute; bottom: -1px; left: 0; right: 0; line-height: 0; }

/* Hero 卡片 */
.glass {
  background: linear-gradient(160deg, rgba(255,255,255,.12), rgba(255,255,255,.05));
  border: 1px solid rgba(255,255,255,.18);
  box-shadow: 0 24px 60px rgba(0,0,0,.36);
  backdrop-filter: blur(18px);
  border-radius: 22px; padding: 26px; color: #fff;
}
.hc-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
.hc-label { font-size: 12px; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.6); font-weight: 700; }
.hc-date { font-size: 34px; font-weight: 800; letter-spacing: -.03em; margin-top: 4px; }
.hc-week { font-size: 13px; color: rgba(255,255,255,.62); margin-top: 2px; }
.hc-ring { flex: none; }
.hc-status { display: flex; align-items: center; gap: 10px; margin: 18px 0 14px; }
.hc-badge {
  font-size: 13px; font-weight: 700; padding: 5px 12px; border-radius: 999px;
  background: rgba(255,255,255,.16); border: 1px solid rgba(255,255,255,.2);
}
.hc-badge.t-holiday { background: rgba(239,68,68,.28); border-color: rgba(239,68,68,.5); color: #fecaca; }
.hc-badge.t-weekend { background: rgba(96,165,250,.26); border-color: rgba(96,165,250,.45); color: #bfdbfe; }
.hc-badge.t-makeup { background: rgba(245,158,11,.28); border-color: rgba(245,158,11,.5); color: #fde68a; }
.hc-badge.t-workday { background: rgba(148,163,184,.24); border-color: rgba(148,163,184,.42); color: #e2e8f0; }
.hc-name { font-size: 14px; color: rgba(255,255,255,.8); }
.hc-field { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.hc-field span {
  font-size: 11.5px; font-family: var(--mono); padding: 3px 8px; border-radius: 6px;
  background: rgba(0,0,0,.26); border: 1px solid rgba(255,255,255,.12); color: #c7d2fe;
}
.hc-picker { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,.14); padding-top: 14px; }
.hc-picker label { font-size: 12.5px; color: rgba(255,255,255,.7); }
.hc-picker input[type="date"] {
  background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.18); color: #fff;
  padding: 5px 9px; border-radius: 8px; font-size: 12.5px; font-family: var(--mono);
  color-scheme: dark;
}
.switch { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; user-select: none; font-size: 12.5px; }
.switch input { width: 15px; height: 15px; accent-color: var(--indigo); cursor: pointer; }
.hc-src { margin-top: 10px; font-size: 11.5px; color: rgba(255,255,255,.5); }
.hc-year { margin-top: 16px; border-top: 1px solid rgba(255,255,255,.14); padding-top: 14px; }
.hy-row { display: flex; justify-content: space-between; font-size: 12.5px; color: rgba(255,255,255,.72); }
.hy-row b { color: #fff; font-family: var(--mono); }
.hy-row.sub { margin-top: 10px; }
.hy-bar { height: 6px; border-radius: 4px; background: rgba(255,255,255,.14); margin-top: 6px; overflow: hidden; }
.hy-bar i { display: block; height: 100%; border-radius: 4px; background: linear-gradient(90deg, #f43f5e, #fb923c); transition: width .8s cubic-bezier(.2,.8,.2,1); }
.hy-bar.alt i { background: linear-gradient(90deg, #6366f1, #38bdf8); }

/* ---------- 数据条 ---------- */
.strip { background: var(--bg-soft); padding: 30px 0; border-bottom: 1px solid var(--line-2); }
.strip-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
.stat { text-align: center; }
.stat b { display: block; font-size: 30px; font-weight: 800; letter-spacing: -.035em;
  background: linear-gradient(135deg, var(--indigo), var(--sky)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.stat span { font-size: 13px; color: var(--ink-3); }

/* ---------- 能力矩阵 ---------- */
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.feature { position: relative; overflow: hidden; transition: .28s cubic-bezier(.2,.8,.2,1); }
.feature::after {
  content: ""; position: absolute; inset: 0; opacity: 0; transition: .28s;
  background: radial-gradient(500px 200px at 80% 0%, rgba(99,102,241,.09), transparent 70%);
}
.feature:hover { transform: translateY(-5px); box-shadow: var(--shadow); border-color: #d9def5; }
.feature:hover::after { opacity: 1; }
.f-icon { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; margin-bottom: 16px; }
.f-indigo { background: #eef0ff; color: var(--indigo); }
.f-sky { background: #e6f6fe; color: #0284c7; }
.f-violet { background: #f3ecff; color: #7c3aed; }
.f-amber { background: #fff5e6; color: #d97706; }
.f-teal { background: #e4fbf7; color: #0f766e; }
.f-rose { background: #feeef1; color: #e11d48; }
.feature h3 { font-size: 17.5px; margin-bottom: 8px; }
.feature p { font-size: 14.5px; color: var(--ink-3); }
.f-api { display: inline-block; margin-top: 12px; font-size: 12px; padding: 3px 9px; border-radius: 6px;
  background: #f4f6fb; border: 1px solid var(--line); color: var(--ink-2); }

/* ---------- 架构图 ---------- */
.arch-wrap { padding: 22px; overflow-x: auto; }
.arch-svg { width: 100%; min-width: 900px; height: auto; display: block; }
.n-t { font: 700 15px var(--font); fill: #0f172a; }
.n-s { font: 400 12.5px var(--font); fill: #64748b; }
.n-t-white { font: 700 15px var(--font); fill: #fff; }
.n-s-white { font: 400 12.5px var(--font); fill: rgba(255,255,255,.85); }
.n-t-sm { font: 600 12.5px var(--mono); }
.rule-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 20px; margin-top: 22px; }
.rule-card h3 { display: flex; align-items: center; gap: 10px; font-size: 17px; margin-bottom: 16px; }
.num { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--indigo);
  background: #eef0ff; padding: 3px 8px; border-radius: 6px; }

/* ---------- 表格 ---------- */
.tbl { width: 100%; border-collapse: collapse; font-size: 14px; }
.tbl th, .tbl td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line-2); vertical-align: top; }
.tbl th { font-size: 12.5px; font-weight: 700; color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; background: #fafbfe; }
.tbl th:first-child { border-top-left-radius: 10px; }
.tbl th:last-child { border-top-right-radius: 10px; }
.tbl tbody tr:hover { background: #fafbff; }
.tbl.compact td, .tbl.compact th { padding: 9px 10px; }
.tbl code { font-size: 12.5px; background: #f1f4fb; padding: 2px 6px; border-radius: 5px; color: var(--indigo-600); }
.tbl code.ok { background: #e7f8f0; color: #047857; }
.tbl code.warn { background: #fff5e6; color: #b45309; }
.tbl code.err { background: #feeef1; color: #be123c; }

/* ---------- 图例 ---------- */
.legend-list { display: grid; gap: 12px; }
.legend-item { display: flex; gap: 12px; align-items: flex-start; }
.legend-item b { font-size: 14.5px; }
.legend-item i { font-family: var(--mono); font-size: 12px; color: var(--indigo); font-style: normal; margin-left: 8px; }
.legend-item em { display: block; font-size: 12.5px; color: var(--ink-3); font-style: normal; margin-top: 2px; }
.lg { width: 13px; height: 13px; border-radius: 4px; flex: none; margin-top: 5px; display: inline-block; }
.lg-holiday { background: #fed7d7; border: 1px solid #fca5a5; }
.lg-weekend { background: #dbeafe; border: 1px solid #93b8f7; }
.lg-makeup { background: var(--c-makeup); border: 1px solid #d97706; }
.lg-workday { background: #eaedf4; border: 1px solid #cbd5e1; }
.lg-today { background: transparent; border: 2px solid var(--indigo); }
.tip { display: flex; gap: 10px; margin-top: 16px; padding: 12px 14px; border-radius: 12px;
  background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; font-size: 13.5px; }
.tip svg { flex: none; margin-top: 3px; }
.tip code { background: rgba(255,255,255,.7); padding: 1px 5px; border-radius: 4px; }

/* ---------- 日历 ---------- */
.cal-bar { display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 22px; }
.cal-tabs { display: inline-flex; gap: 4px; padding: 4px; background: #fff; border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow-sm); }
.cal-tabs button {
  border: 0; background: transparent; cursor: pointer; font-family: var(--font);
  font-size: 14px; font-weight: 600; color: var(--ink-3); padding: 7px 18px; border-radius: 9px; transition: .2s;
}
.cal-tabs button.active { background: linear-gradient(135deg, #5b52f0, #2f6ef5); color: #fff; box-shadow: 0 4px 12px rgba(79,70,229,.28); }
.cal-legend { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--ink-3); }
.cal-legend span { display: inline-flex; align-items: center; gap: 6px; }
.cal-legend .lg { width: 11px; height: 11px; margin: 0; }

.cal-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
.cal-stat { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 16px 18px; box-shadow: var(--shadow-sm); }
.cal-stat small { display: block; font-size: 12.5px; color: var(--ink-3); }
.cal-stat b { font-size: 24px; font-weight: 800; letter-spacing: -.03em; }
.cal-stat b small { display: inline; font-size: 13px; color: var(--ink-4); font-weight: 600; margin-left: 3px; }

.cal-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.month { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 14px; box-shadow: var(--shadow-sm); }
.month-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.month-head b { font-size: 14.5px; }
.month-head span { font-size: 11.5px; color: var(--ink-4); }
.month-dow { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; margin-bottom: 4px; }
.month-dow i { font-style: normal; text-align: center; font-size: 10.5px; color: var(--ink-4); font-weight: 600; }
.month-dow i.wk { color: var(--c-weekend); }
.month-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.day {
  position: relative;
  aspect-ratio: 1; border-radius: 7px; display: grid; place-items: center;
  font-size: 11.5px; font-weight: 600; cursor: pointer; border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s; background: #f8fafc; color: var(--ink-2);
}
/* 调休补班日：右上角琥珀角标，便于快速辨认 */
.day.t-makeup { font-weight: 700; }
.day.t-makeup::after {
  content: ""; position: absolute; top: 2px; right: 2px;
  width: 4px; height: 4px; border-radius: 50%; background: #fff; opacity: .95;
}
/* 颜色示例：法定节假日=红 · 周末=蓝 · 调休补班=橙 · 工作日=灰 */
.day.empty { background: transparent; cursor: default; }
.day.t-workday { background: #eaedf4; color: #64748b; }
.day.t-holiday { background: #fed7d7; color: #b91c1c; }
.day.t-weekend { background: #dbeafe; color: #1d4ed8; }
.day.t-makeup { background: var(--c-makeup); color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.45); }
.day:hover:not(.empty) { transform: scale(1.18); box-shadow: var(--shadow); z-index: 2; position: relative; }
.day.today { border: 2px solid var(--indigo); font-weight: 800; color: var(--indigo); }
.tooltip {
  position: fixed; z-index: 90; pointer-events: none;
  background: #0f172a; color: #fff; padding: 9px 12px; border-radius: 10px;
  font-size: 12.5px; box-shadow: 0 12px 30px rgba(0,0,0,.28); max-width: 260px;
}
.tooltip b { display: block; font-size: 13px; margin-bottom: 2px; }
.tooltip span { color: rgba(255,255,255,.7); }

.holiday-blocks { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; margin-top: 26px; }
.hb {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px; cursor: pointer;
  background: #fff; border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow-sm);
  transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s, border-color .22s;
}
.hb:hover { transform: translateY(-3px); border-color: #c7cdec; box-shadow: var(--shadow); }
.hb:active { transform: translateY(-1px); }
.hb:focus-visible { outline: 2px solid var(--indigo); outline-offset: 2px; }
.hb-ico {
  width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; flex: none;
  background: #fff; border: 1px solid var(--line-2); box-shadow: var(--shadow-sm);
}
.hb-ico svg { display: block; }
.hb-body { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.hb-body b { font-size: 15px; line-height: 1.4; }
.hb-range { font-size: 12.5px; color: var(--ink-3); font-family: var(--mono); }
.hb-mk {
  margin-top: 4px; width: fit-content; font-family: var(--mono); font-size: 11.5px; font-weight: 600;
  color: #b45309; background: #fff7ed; border: 1px solid #fed7aa; padding: 1px 8px; border-radius: 6px;
}
.hb-days { margin-left: auto; font-family: var(--mono); font-size: 15px; font-weight: 800; color: var(--indigo); }

/* 点击节日后的定位高亮 */
.month.focus {
  border-color: var(--indigo);
  box-shadow: 0 0 0 3px rgba(79,70,229,.16), var(--shadow);
  animation: monthPop .45s cubic-bezier(.2,.8,.2,1);
}
@keyframes monthPop { 0% { transform: translateY(0) scale(1); } 45% { transform: translateY(-4px) scale(1.015); } 100% { transform: none; } }
.day.hl { position: relative; z-index: 1; animation: hlPulse 1.1s ease-in-out infinite alternate; }
@keyframes hlPulse {
  from { box-shadow: 0 0 0 0 rgba(79,70,229,.05); }
  to { box-shadow: 0 0 0 3px rgba(79,70,229,.42); }
}

/* ---------- 调试台 ---------- */
.pg-wrap { display: grid; grid-template-columns: .95fr 1.05fr; gap: 20px; align-items: start; }
.pg-panel { padding: 22px; }
.pg-row label { display: block; font-size: 12.5px; font-weight: 700; color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 7px; }
.pg-row.inline { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 18px; }
.pg-row.inline label { margin: 0; }
.pg-panel select, .pg-panel input[type="text"], .pg-panel input[type="date"] {
  width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line);
  font-family: var(--mono); font-size: 13.5px; color: var(--ink); background: #fbfcfe; outline: none;
}
.pg-panel select:focus, .pg-panel input:focus { border-color: var(--indigo); box-shadow: 0 0 0 3px rgba(79,70,229,.12); }
.pg-desc { font-size: 13.5px; color: var(--ink-3); margin: 12px 0 16px; }
.pg-params { display: grid; gap: 12px; }
.pg-params .p-item small { display: block; font-size: 11.5px; color: var(--ink-4); margin-top: 4px; }
.pg-url { display: flex; align-items: center; gap: 10px; margin-top: 16px; padding: 10px 12px;
  background: #f6f8fd; border: 1px solid var(--line); border-radius: 10px; }
.pg-url span { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #047857;
  background: #e7f8f0; padding: 2px 7px; border-radius: 5px; }
.pg-url code { font-size: 12.5px; color: var(--ink-2); flex: 1; word-break: break-all; }
.pg-url .copy-btn { background: #fff; border-color: var(--line); color: var(--ink-2); }
.pg-url .copy-btn:hover { background: #f1f3fb; }
.pg-quick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.pg-quick button {
  cursor: pointer; font-family: var(--mono); font-size: 12px; padding: 5px 10px; border-radius: 7px;
  background: #fff; border: 1px solid var(--line); color: var(--ink-2); transition: .18s;
}
.pg-quick button:hover { border-color: var(--indigo); color: var(--indigo); background: #f5f6ff; }
.pg-result { background: #0f172a; border-color: #1e293b; }
.pg-res-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.pg-title { font-size: 13.5px; font-weight: 700; color: #e2e8f0; }
.pg-meta { font-size: 12px; font-family: var(--mono); color: #94a3b8; }
.pg-meta.ok { color: #34d399; }
.pg-meta.err { color: #fb7185; }
.pg-code {
  margin: 0; max-height: 340px; overflow: auto; font-size: 12.5px; line-height: 1.75;
  color: #cbd5e1; background: #131c33; border: 1px solid #24304d; border-radius: 12px; padding: 14px 16px;
  white-space: pre-wrap; word-break: break-word;
}
.pg-code .k { color: #7dd3fc; }
.pg-code .s { color: #86efac; }
.pg-code .n { color: #fca5a5; }
.pg-code .b { color: #c4b5fd; }
.pg-visual { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
.pv-chip { font-size: 11.5px; font-family: var(--mono); padding: 4px 9px; border-radius: 7px; background: #1e293b; color: #cbd5e1; }
.pv-chip.hl { background: #312e81; color: #c7d2fe; }

/* ---------- 快速开始 ---------- */
.qs-wrap { padding: 0; overflow: hidden; }
.qs-tabs { display: flex; gap: 2px; padding: 12px 12px 0; background: #fafbfe; border-bottom: 1px solid var(--line-2); flex-wrap: wrap; }
.qs-tabs button {
  cursor: pointer; border: 0; background: transparent; font-family: var(--font); font-size: 13.5px; font-weight: 600;
  color: var(--ink-3); padding: 10px 16px; border-radius: 10px 10px 0 0; border-bottom: 2px solid transparent; transition: .2s;
}
.qs-tabs button.active { color: var(--indigo); border-bottom-color: var(--indigo); background: #fff; }
.qs-body { position: relative; padding: 20px 22px; }
.qs-code {
  margin: 0; font-size: 13px; line-height: 1.85; color: #1e293b; white-space: pre; overflow: auto; max-height: 420px;
}
.copy-btn.float { position: absolute; top: 16px; right: 16px; background: #fff; border-color: var(--line); color: var(--ink-2); }
.copy-btn.float:hover { background: #f1f3fb; }

/* ---------- 文档 ---------- */
.doc-list { display: grid; gap: 18px; }
.doc { padding: 24px 26px; }
.doc-head { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.method { font-family: var(--mono); font-size: 11px; font-weight: 700; color: #047857;
  background: #e7f8f0; border: 1px solid #a7f3d0; padding: 3px 9px; border-radius: 6px; }
.doc-head h3 { font-family: var(--mono); font-size: 16px; font-weight: 700; }
.doc-head h3 small { font-family: var(--font); font-size: 13px; font-weight: 500; color: var(--ink-4); margin-left: 8px; }
.doc > p { font-size: 14.5px; color: var(--ink-3); margin-bottom: 14px; }
.doc .tbl td code { white-space: nowrap; }
.doc-code { display: flex; align-items: center; gap: 10px; margin-top: 14px; padding: 11px 12px;
  background: #131c33; border-radius: 11px; }
.doc-code code { flex: 1; font-size: 12.5px; color: #a5b4fc; overflow: auto; white-space: nowrap; }
.doc-code .copy-btn { flex: none; background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.16); color: #fff; }
.doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }

/* ---------- 使用场景 ---------- */
.usage-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.usage { position: relative; padding-top: 22px; }
.u-num { font-family: var(--mono); font-size: 34px; font-weight: 800; color: transparent; line-height: 1;
  -webkit-text-stroke: 1.4px #cdd4f5; letter-spacing: -.05em; }
.usage h3 { font-size: 16.5px; margin: 10px 0 8px; }
.usage p { font-size: 14px; color: var(--ink-3); }
.usage code { font-size: 12.5px; background: #f1f4fb; padding: 1px 5px; border-radius: 5px; color: var(--indigo-600); }

.faq { margin-top: 26px; padding: 26px 28px; }
.faq-list { display: grid; gap: 4px; }
.faq-item { border-bottom: 1px solid var(--line-2); }
.faq-item:last-child { border-bottom: 0; }
.faq-q {
  width: 100%; text-align: left; cursor: pointer; background: none; border: 0; padding: 15px 0;
  font-family: var(--font); font-size: 15px; font-weight: 600; color: var(--ink);
  display: flex; justify-content: space-between; align-items: center; gap: 16px;
}
.faq-q i { font-style: normal; color: var(--indigo); font-size: 18px; transition: .2s; flex: none; }
.faq-item.open .faq-q i { transform: rotate(45deg); }
.faq-a { max-height: 0; overflow: hidden; transition: max-height .3s ease; }
.faq-item.open .faq-a { max-height: 260px; }
.faq-a p { padding-bottom: 15px; font-size: 14px; color: var(--ink-3); max-width: 860px; }
.faq-a code { background: #f1f4fb; padding: 1px 5px; border-radius: 5px; color: var(--indigo-600); font-size: 12.5px; }

/* ---------- CTA & Footer ---------- */
.cta { padding: 74px 0; color: #fff; background: radial-gradient(120% 140% at 20% 0%, #24215e, #141a45 60%, #0f1338); }
.cta-inner { display: flex; align-items: center; justify-content: space-between; gap: 30px; flex-wrap: wrap; }
.cta-copy h2 { font-size: clamp(24px, 3vw, 34px); margin-bottom: 10px; }
.cta-copy p { color: rgba(255,255,255,.72); max-width: 560px; }
.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.footer { background: #0b1020; color: #94a3b8; padding: 54px 0 22px; font-size: 14px; }
.footer-inner { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; }
.f-brand .brand-text { color: #fff; font-size: 18px; font-weight: 800; }
.f-brand .brand-dot { color: #818cf8; }
.f-brand p { margin-top: 10px; font-size: 13.5px; max-width: 420px; line-height: 1.8; }
.f-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.f-links h4 { color: #fff; font-size: 13.5px; margin-bottom: 10px; }
.f-links a, .f-links span { display: block; font-size: 13px; padding: 3px 0; color: #94a3b8; }
.f-links a:hover { color: #a5b4fc; }
.f-bottom { display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;
  margin-top: 34px; padding-top: 18px; border-top: 1px solid #1c2338; font-size: 12.5px; color: #64748b; }
.f-bottom b { color: #cbd5e1; font-weight: 600; }
.f-bottom b a { color: #a5b4fc; }
.f-bottom b a:hover { color: #c7d2fe; text-decoration: underline; }

/* ---------- 滚动出现动画 ---------- */
.reveal { opacity: 0; transform: translateY(22px); transition: opacity .6s cubic-bezier(.2,.8,.2,1), transform .6s cubic-bezier(.2,.8,.2,1); }
.reveal.in { opacity: 1; transform: none; }

/* ---------- 响应式 ---------- */
@media (max-width: 1080px) {
  .feature-grid, .usage-grid { grid-template-columns: repeat(2, 1fr); }
  .cal-grid { grid-template-columns: repeat(3, 1fr); }
  .strip-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 36px; }
  .pg-wrap, .rule-grid, .doc-grid, .footer-inner { grid-template-columns: 1fr; }
  .cal-stats { grid-template-columns: repeat(2, 1fr); }
  .nav-links { display: none; }
  .brand-by { display: none; }
  .nav-toggle { display: block; margin-left: auto; }
  .nav-actions { order: -1; }
  .nav.open .nav-links {
    display: flex; position: absolute; top: 66px; left: 0; right: 0; flex-direction: column; gap: 2px;
    background: #fff; padding: 12px; border-bottom: 1px solid var(--line); box-shadow: var(--shadow);
  }
  .nav.open .nav-links a { padding: 11px 14px; }
  .section { padding: 68px 0; }
}
@media (max-width: 620px) {
  .feature-grid, .usage-grid, .cal-grid { grid-template-columns: 1fr; }
  .cal-stats { grid-template-columns: 1fr; }
  .strip-grid { grid-template-columns: repeat(2, 1fr); }
  .cta-inner { flex-direction: column; align-items: flex-start; }
  .f-links { grid-template-columns: 1fr 1fr; }
  .card { padding: 20px; }
  .day { font-size: 10.5px; border-radius: 6px; }
}

/* ---- 服务端预渲染分组（由 view 添加） ---- */
.cal-year[hidden] { display: none; }
`;
