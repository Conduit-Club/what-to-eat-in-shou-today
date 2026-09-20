# 今日海大吃什么

收集海大校内及周边餐厅信息与同学体验。前端使用 Docusaurus、React 和 TypeScript，产物可直接静态部署；开发环境由 Pixi 管理 Node.js / pnpm，前端依赖由 pnpm 锁定。

## 开发与构建

```bash
pixi install --locked
pixi run --locked install
pixi run --locked dev
```

默认访问 <http://localhost:3000/>。检查及预览生产构建：

```bash
pixi run --locked typecheck
pixi run --locked build
pixi run --locked serve
```

发布目录为 `website/build/`。安装使用 `website/pnpm-lock.yaml`，不依赖系统 Node.js 或 npm。更新前端依赖时运行 `pixi run --locked pnpm --dir website install --no-frozen-lockfile`，审阅并提交锁文件；更新 Pixi 依赖后运行 `pixi install` 同步 `pixi.lock`。

## 浏览器验证

首次运行需安装 Playwright Chromium（或设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE` 指向已有 Chromium）：

```bash
pixi run --locked pnpm --dir website exec playwright install chromium
pixi run --locked test
# 使用模拟接口验证提交成功与失败，无需真实后台
TEST_CONTRIBUTION_API_URL=https://contribution.example.test/v1/submissions pixi run --locked test
```

测试会重新构建 `/food/` 子路径版本并启动本地静态服务器，覆盖无 JavaScript 浏览、筛选、移动端、深色模式、图片预览和草稿导出。测试完成后发布前请使用实际部署变量重新运行 `build`。

## 部署配置

构建前设置环境变量（以下为 POSIX shell 示例）：

```bash
SITE_URL=https://your-account.github.io BASE_URL=/what-to-eat-in-shou-today/ pixi run --locked build
```

- `SITE_URL`：实际站点源地址；默认 `https://example.com` 仅供本地构建，发布前必须替换。
- `BASE_URL`：以 `/` 开始和结束的部署路径，独立域名使用 `/`。
- `CONTRIBUTION_API_URL`：可选，完整投稿接口 URL，例如 `https://api.example.com/v1/submissions`。未配置时投稿页只导出 JSON 草稿，照片需要另行交给维护者。

这些值在构建时写入前端，修改后需重新构建；不能放入密钥。将产物交给静态托管即可，不需要 Node.js 常驻服务。深层页面使用目录形式的 `index.html`。

### Vercel

前端部署目标为 Vercel：Vercel 项目 Root Directory 设为 `website`，仓库已提供 `website/vercel.json` 声明 Docusaurus 构建命令与产物目录。后端使用 Cloudflare Workers，方案见 [deployment-vercel-cloudflare.md](./deployment-vercel-cloudflare.md)。

### Cloudflare Workers Static Assets

站点已提供 `website/wrangler.jsonc`，将 `website/build/` 作为 Workers Static Assets 目录。部署前先在 Cloudflare 创建对应 Worker、确认站点域名和路由，然后构建并运行：

```bash
pixi run --locked build
pixi run --locked workers-deploy
```

`workers-deploy` 会向 Cloudflare 写入部署，因此不应在未确认帐号和路由时执行。它不配置投稿接口；只有贡献服务完成测试部署与跨域验证后，才在构建环境设置真实的 `CONTRIBUTION_API_URL`。

## 内容与扩展

- `website/docs/`：现有餐厅详情及匿名同学评价，保留原始内容。
- `website/src/data/restaurants.json`：审核后的卡片数据快照，目前 12 个条目。
- `website/src/types/restaurant.ts`：卡片字段定义，未知图片、营业时间、用餐时间和核验时间为 `null`。
- `website/src/components/RestaurantCard/`：可复用卡片，图片缺失时明确显示占位图。
- `website/src/pages/restaurants.tsx`：静态渲染卡片列表，客户端支持名称、位置搜索和校内/校外筛选。
- `website/src/pages/submit.tsx`：图片预览、信息草稿导出和投稿接口适配。
- `website/sidebars.ts`：文档导航；`website/docusaurus.config.ts`：站点与插件配置。

新增餐厅时同步更新详情页、分类概览、侧边栏和卡片快照。口感摘要应归属于同学评价，不虚构照片、价格或时间。

贡献服务已拆至 `what-to-eat-in-shou-contributions`，目前仍是未部署的原型。只有设置了经过验证的 `CONTRIBUTION_API_URL` 时，投稿页才会发送在线投稿；默认继续导出草稿。公开数据的导出格式和接入边界见 [架构与投稿协议](architecture.md) 与 [贡献服务接入说明](contribution-service-integration.md)。

## 许可

内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans)，详见 [LICENSE](LICENSE)。
