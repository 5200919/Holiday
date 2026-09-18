import registry from '../../data/holidays/index.js';

/**
 * 首页与 AI 文档共用的静态描述数据。
 * 独立成模块，避免 pages.js 与 views/home.js 之间形成循环依赖。
 */

export const SERVICE_NAME = 'Holiday';
export const SERVICE_DESCRIPTION = '中国工作日 / 节假日查询 API';

export const SUPPORTED_YEARS = Object.keys(registry)
    .map((year) => Number(year))
    .sort((a, b) => a - b);

export const ENDPOINTS = [
    {
        path: '/holiday/check',
        name: '单日查询',
        description: '查询某一天是工作日还是休息日。不传 date 时默认查询当天。',
        params: [
            { name: 'date', required: false, default: '当天', description: '日期，支持 2026-09-18 与 20260918 两种格式' },
            { name: 'makeup', required: false, default: '1', description: '调休补班的周末是否算工作日：1 算，0 不算' },
        ],
        example: '/holiday/check?date=2025-10-01',
        response: 'DayResult 对象',
    },
    {
        path: '/holiday/range',
        name: '区间查询',
        description: '查询一段日期（含首尾），最多 1000 天。不传 start 时默认从当天开始。',
        params: [
            { name: 'start', required: false, default: '当天', description: '起始日期，支持 Y-m-d / Ymd' },
            { name: 'end', required: false, default: '等于 start', description: '结束日期，支持 Y-m-d / Ymd' },
            { name: 'makeup', required: false, default: '1', description: '调休补班的周末是否算工作日：1 算，0 不算' },
        ],
        example: '/holiday/range?start=2025-10-01&end=2025-10-08',
        response: 'DayResult 对象数组',
    },
    {
        path: '/holiday/month',
        name: '整月查询',
        description: '查询某年某月的每一天。不传 year / month 时默认当前年月。',
        params: [
            { name: 'year', required: false, default: '当前年份', description: '四位年份，如 2026' },
            { name: 'month', required: false, default: '当前月份', description: '月份 1-12' },
            { name: 'makeup', required: false, default: '1', description: '调休补班的周末是否算工作日：1 算，0 不算' },
        ],
        example: '/holiday/month?year=2025&month=10',
        response: '{ year, month, days: DayResult[] }',
    },
    {
        path: '/holiday/year',
        name: '全年节假日与调休',
        description: '返回某年全部法定节假日与调休补班日期，不传 year 时默认当前年份。',
        params: [{ name: 'year', required: false, default: '当前年份', description: '四位年份，如 2026' }],
        example: '/holiday/year?year=2025',
        response: '{ year, fallback, holidays: [], workdays: [] }',
    },
];

export const SAMPLE_SINGLE = {
    code: 0,
    message: 'ok',
    data: {
        date: '2025-10-01',
        is_workday: false,
        is_holiday: true,
        day_type: 'holiday',
        holiday_name: '国庆节',
        makeup_workday: false,
        fallback: false,
    },
};

export const SAMPLE_YEAR = {
    code: 0,
    message: 'ok',
    data: {
        year: 2025,
        fallback: false,
        holidays: [
            { date: '2025-10-01', name: '国庆节' },
            { date: '2025-10-02', name: '国庆节' },
        ],
        workdays: [{ date: '2025-01-26', name: '春节前补班' }],
    },
};

export const FIELDS = [
    { name: 'date', type: 'string', description: '日期，统一格式为 Y-m-d' },
    { name: 'is_workday', type: 'boolean', description: '是否为工作日' },
    { name: 'is_holiday', type: 'boolean', description: '是否为休息日（is_workday 的反值）' },
    {
        name: 'day_type',
        type: 'string',
        description: 'workday / weekend / holiday / makeup_workday',
    },
    { name: 'holiday_name', type: 'string', description: '中文名称，如 国庆节、周末、工作日' },
    { name: 'makeup_workday', type: 'boolean', description: '当天是否为调休补班日' },
    { name: 'fallback', type: 'boolean', description: '该年份无配置时为 true，仅按周末判断' },
];

export const SAMPLE_ERROR = {
    code: 400,
    message: '参数错误',
    data: null,
};

export const RULES = [
    ['1', '在调休补班表，且 makeup=1', 'makeup_workday', 'true'],
    ['2', '在调休补班表，且 makeup=0', 'weekend', 'false'],
    ['3', '在法定节假日表', 'holiday', 'false'],
    ['4', '周六 / 周日', 'weekend', 'false'],
    ['5', '其他', 'workday', 'true'],
];

export const ERRORS = [
    ['0', 'ok', '请求成功'],
    ['400', '参数错误', '日期格式非法、日期不存在、end 早于 start、区间超过 1000 天、year/month 非整数、月份越界'],
    ['404', '接口不存在', '访问了未定义的 /holiday/* 路径'],
    ['405', 'Method Not Allowed', '仅支持 GET / POST / OPTIONS'],
    ['500', '服务内部错误', '未预期的异常'],
];

export function normalizeOrigin(origin = '') {
    return String(origin).replace(/\/+$/, '');
}

export function absolute(origin, path) {
    return `${normalizeOrigin(origin)}${path}`;
}

export function usagePayload(origin) {
    return {
        code: 0,
        message: 'ok',
        data: {
            service: 'holiday',
            docs: absolute(origin, '/llms.txt'),
            endpoints: ENDPOINTS.map((endpoint) => endpoint.example),
        },
    };
}

export function renderAiDoc(origin) {
    const base = normalizeOrigin(origin);
    const years = SUPPORTED_YEARS.join(' / ');
    const endpointSections = ENDPOINTS.map((endpoint) => {
        const params = endpoint.params
            .map(
                (param) =>
                    `| \`${param.name}\` | ${param.required ? '是' : '否'} | ${param.default} | ${param.description} |`
            )
            .join('\n');

        return `### ${endpoint.path}

${endpoint.description}

**请求**

\`\`\`http
GET ${base}${endpoint.example}
\`\`\`

**参数**

| 参数 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
${params}

**响应**：${endpoint.response}`;
    }).join('\n\n');

    const rules = RULES.map((rule) => `| ${rule.join(' | ')} |`).join('\n');
    const errors = ERRORS.map((error) => `| ${error.join(' | ')} |`).join('\n');
    const fields = FIELDS.map((field) => `| \`${field.name}\` | ${field.type} | ${field.description} |`).join('\n');

    return `# Holiday API 接入文档

> ${SERVICE_DESCRIPTION}。本文件供 AI 编程工具直接读取，用于生成接入代码。无需鉴权、无需 SDK，直接发起 HTTP GET 请求即可。

## 基本信息

- **Base URL**：\`${base}\`
- **协议**：HTTP / HTTPS，GET（也接受 POST，参数同样放在 query string）
- **鉴权**：无
- **跨域**：已开启 CORS，\`Access-Control-Allow-Origin: *\`
- **数据覆盖年份**：${years}
- **发现入口**：\`GET ${base}/holiday/\` 返回可用端点列表（JSON）
- **在线文档**：\`${base}/llms.txt\` 与 \`${base}/ai.md\`
- **根路径**：\`GET ${base}/\` 按 \`Accept\` 协商——浏览器返回功能介绍页，命令行客户端（curl / wget 等）直接返回当天判定结果，等价于 \`/holiday/check\`；追加 \`?format=json\` 可强制获取 JSON

## 统一响应结构

所有接口返回：

\`\`\`json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
\`\`\`

- \`code\` 为 \`0\` 表示成功，非 0 为错误码（同时作为 HTTP 状态码）。
- 失败时 \`data\` 为 \`null\`。

成功示例（单日查询）：

\`\`\`json
${JSON.stringify(SAMPLE_SINGLE, null, 2)}
\`\`\`

## 日期格式

- 支持 \`Y-m-d\`（如 \`2026-09-18\`）与 \`Ymd\`（如 \`20260918\`）。
- 响应中的 \`date\` 统一为 \`Y-m-d\`。
- 时区固定为 **UTC+8**，不依赖运行环境时区。
- 不传日期类参数时，默认使用 **中国时区的当天**。

## 接口列表

| 接口 | 说明 |
| --- | --- |
| \`GET /holiday/check\` | 单日查询 |
| \`GET /holiday/range\` | 区间查询（含首尾，最多 1000 天） |
| \`GET /holiday/month\` | 整月查询 |
| \`GET /holiday/year\` | 全年节假日与调休 |

## 接口详情

${endpointSections}

## 返回字段说明（单日对象）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
${fields}

## 判定规则（优先级从高到低）

| 优先级 | 条件 | day_type | is_workday |
| --- | --- | --- | --- |
${rules}

## makeup 参数语义

- \`makeup=1\`（默认）：调休补班的周末算作工作日，\`day_type\` 为 \`makeup_workday\`。
- \`makeup=0\`：调休补班的周末仍按休息日处理，\`day_type\` 为 \`weekend\`。
- 取值支持：\`1/0\`、\`true/false\`、\`yes/no\`、\`on/off\`（大小写不敏感）。

## 错误码

| code | message | 说明 |
| --- | --- | --- |
${errors}

## 缓存策略

- 请求带明确 \`date\` / \`start\` / \`end\` / \`year\`：\`Cache-Control: public, max-age=86400\`。
- 依赖“当天”的请求：\`Cache-Control: no-store\`。

## 接入示例

### cURL

\`\`\`bash
# 单日
curl "${base}/holiday/check?date=2025-10-01"

# 区间
curl "${base}/holiday/range?start=2025-10-01&end=2025-10-08"

# 整月
curl "${base}/holiday/month?year=2025&month=10"

# 全年
curl "${base}/holiday/year?year=2025"
\`\`\`

### JavaScript / TypeScript

\`\`\`js
const BASE = '${base}';

async function isWorkday(date) {
    const res = await fetch(\`\${BASE}/holiday/check?date=\${date}\`);
    const json = await res.json();

    if (json.code !== 0) {
        throw new Error(json.message);
    }

    return json.data.is_workday;
}

const workdays = await fetch(
    \`\${BASE}/holiday/range?start=2025-10-01&end=2025-10-08\`
).then((res) => res.json()).then((json) => json.data);
\`\`\`

### Python

\`\`\`python
import requests

BASE = "${base}"

def is_workday(date: str) -> bool:
    resp = requests.get(f"{BASE}/holiday/check", params={"date": date}, timeout=5)
    payload = resp.json()
    if payload["code"] != 0:
        raise RuntimeError(payload["message"])
    return payload["data"]["is_workday"]
\`\`\`

### PHP

\`\`\`php
<?php
$base = '${base}';
$url  = $base . '/holiday/check?' . http_build_query(['date' => '2025-10-01']);
$json = json_decode(file_get_contents($url), true);

if ($json['code'] !== 0) {
    throw new RuntimeException($json['message']);
}

var_dump($json['data']['is_workday']);
\`\`\`

## 注意事项

- 未知年份（未维护数据的年份）不会报错，而是降级为仅按周末判断，此时 \`fallback\` 为 \`true\`。
- 区间查询单次最多 1000 天，超出返回 \`code=400\`。
- 若需最新节假日数据，请以国务院办公厅通知为准，本服务数据为人工维护。
`;
}
