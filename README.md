# Holiday（Node / Edge Functions 版）

中国**工作日 / 节假日**查询 API，基于腾讯云 **Makers Edge Functions**（EdgeOne）。零第三方依赖，数据用 JS 模块人工维护，不依赖 MySQL / Redis。

- 入口目录：`edge-functions/`（Makers 自动按目录生成路由）
- 运行时：EdgeOne 边缘函数（V8 isolate，仅 JavaScript）
- Node：>= 18（本地调试/测试用）

接口行为与仓库内 PHP 版逐条对齐（字段、`day_type`、`makeup`、降级、中文名、默认当天）。

## 目录结构

```
node/
├── package.json                  零依赖，type: module
├── src/                          核心逻辑（框架无关）
│   ├── HolidayCalendar.js        门面
│   ├── DayResult.js
│   ├── YearConfig.js
│   ├── date.js                   日期/时区工具（UTC+8）
│   ├── exception.js
│   ├── config/ModuleConfigLoader.js
│   └── http/
│       ├── apiController.js      纯逻辑，返回 {code,message,data}
│       ├── edge.js               Web Response / CORS / 缓存策略
│       └── edgeRoute.js          Edge Function 路由工厂
├── data/holidays/                年度数据（ESM）
│   ├── 2024.js 2025.js 2026.js
│   └── index.js                  注册表
├── edge-functions/               ===== 部署入口 =====
│   ├── index.js                  GET /
│   ├── holiday/check.js          GET /holiday/check
│   ├── holiday/range.js          GET /holiday/range
│   ├── holiday/month.js          GET /holiday/month
│   └── holiday/year.js           GET /holiday/year
├── server.js                     本地调试用原生 http 服务
└── test/holiday.test.js          node:test
```

## 本地运行

```bash
cd node
node --test          # 跑测试
npm run dev          # 默认端口 443，可用 PORT 覆盖
```

## 部署到 Makers

Edge Functions 的路由由 `edge-functions/` 目录结构生成，因此需满足以下任一方式：

1. **将 Makers 项目根目录指向 `node/`**（推荐）：这样 `node/edge-functions` 即项目根下的 `edge-functions`。
2. 或把 `edge-functions/`（及 `src/`、`data/`）移动到 Makers 项目根目录。

路由映射：

| 文件 | 路由 |
| --- | --- |
| `edge-functions/index.js` | `/` |
| `edge-functions/holiday/check.js` | `/holiday/check` |
| `edge-functions/holiday/range.js` | `/holiday/range` |
| `edge-functions/holiday/month.js` | `/holiday/month` |
| `edge-functions/holiday/year.js` | `/holiday/year` |

处理函数为 `export default function onRequest(context)`，通过 `context.request`（标准 Web `Request`）读取 URL 与查询参数，返回标准 `Response`。

## 接口

统一返回 `{ "code": 0, "message": "ok", "data": ... }`。

| 接口 | 参数 | 说明 |
| --- | --- | --- |
| `GET /holiday/check` | `date`（可选，默认当天）、`makeup` | 单日 |
| `GET /holiday/range` | `start`、`end`（可选）、`makeup` | 区间（含首尾，最多 1000 天） |
| `GET /holiday/month` | `year`、`month`、`makeup` | 整月 |
| `GET /holiday/year` | `year` | 全年节假日 + 调休 |
| `GET /` | — | 健康检查 |

示例：

```
/holiday/check?date=2025-10-01
/holiday/check?date=2025-01-26&makeup=0
/holiday/range?start=2025-10-01&end=2025-10-08
/holiday/month?year=2025&month=10
/holiday/year?year=2025
```

`makeup`：是否把调休补班的周末算作工作日，默认 `1`（算）。取 `0` 时调休周末按休息日处理。

单日 `data`：

```json
{
  "date": "2025-10-01",
  "is_workday": false,
  "is_holiday": true,
  "day_type": "holiday",
  "holiday_name": "国庆节",
  "makeup_workday": false,
  "fallback": false
}
```

- `is_holiday`：是否休息日（非工作日，含周末与法定节假日）；
- `day_type`：`workday` / `weekend` / `holiday` / `makeup_workday`；
- `fallback`：该年份无配置时为 `true`（仅按周末判断）。

## 判定规则

| 优先级 | 条件 | day_type | is_workday |
| --- | --- | --- | --- |
| 1 | 在 `workdays` 且 `makeup=1` | `makeup_workday` | true |
| 2 | 在 `workdays` 且 `makeup=0` | `weekend` | false |
| 3 | 在 `holidays` | `holiday` | false |
| 4 | 周六 / 周日 | `weekend` | false |
| 5 | 其他 | `workday` | true |

## 数据维护

新增年份：在 `data/holidays/` 下建 `{year}.js`，并在 `index.js` 注册。

```js
export default {
    year: 2027,
    holidays: { '2027-01-01': '元旦' },
    workdays: { '2027-02-07': '调休补班' },
};
```

已内置 2024 / 2025 / 2026，请按国务院办公厅通知核对增补。

## 注意事项

- EdgeOne Edge Functions 单函数代码包上限 5 MB、CPU 200 ms、请求 body 1 MB，本项目数据量极小，远低于限制。
- 日期时区固定按 **UTC+8** 计算，不依赖运行环境时区，中国无夏令时。
- 带明确 `date` / `start` / `end` / `year` 的请求返回 `Cache-Control: public, max-age=86400`；依赖「当天」的请求返回 `no-store`。
