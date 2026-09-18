/**
 * 首页 / 用法 JSON / AI 文档的渲染入口。
 *
 * - 静态描述数据统一放在 ./docsModel.js（被首页视图与 AI 文档共用）。
 * - 首页 HTML 由 ./views/home.js 生成：完全自包含（样式与脚本内联），
 *   因为边缘运行环境没有静态资源托管能力。
 */
export * from './docsModel.js';

import { renderHomeView } from './views/home.js';

export function renderHomePage(origin = '') {
    return renderHomeView(origin);
}
