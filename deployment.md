# 部署方案

本文给出“今日海大吃什么”站点与贡献服务的部署方案、可直接执行的命令，以及当前还没有满足的前置条件。所有 `wrangler` 命令都没有在真实 Cloudflare 账号上执行过，仓库里也还没有已配置的部署流水线；请把它当成本地方案，而不是已经上线的部署。

## 现状与问题

| 问题 | 现状 |
| --- | --- |
| 没有 CI | 默认分支上没有任何 workflow，Actions 里 0 个 workflow；`website/tests/site.spec.ts` 从未在 CI 跑过，而且其中 `../sidebars.ts`、`../static` 的相对路径写错，本地直接跑就会失败 |
| 站点没有部署目标 | 只有 `website/wrangler.jsonc`（Workers Static Assets）蓝本，没有 Cloudflare 账号、路由、`SITE_URL` 或自定义域名 |
| 贡献服务没有部署 | 另一个仓库 `what-to-eat-in-shou-contributions` 的 `wrangler.jsonc` 里 D1 数据库 ID 仍是占位符，D1、R2、`REVIEWER_TOKEN`、`ALLOWED_ORIGINS` 都没配置 |
| 投稿表单没有后端 | 未设置 `CONTRIBUTION_API_URL`，表单只能导出草稿，不能上传 |
| 没有发布回路 | 审核通过后如何触发站点重建、如何创建站点 PR，都还没有落地的自动化 |
| `dev` 曾经落后 | `dev` 一度停在 MkDocs 时代、比 `main` 落后 3 个提交且没有 `website/`，已快进到 `main`（`e721e20`） |

## 目标形态

```text
浏览器
  ├─ 静态站点：Vercel（website/build，之后绑定自定义域名）
  └─ 投稿表单 → Cloudflare Worker（贡献服务仓库）
                      ├─ D1：投稿记录、审计与限流
                      └─ R2（私有）：待审图片
                              ↓ 审核通过
                      导出任务生成站点 PR → dev → main → 重新构建并部署
```

前端当前选定 Vercel，配置见 `website/vercel.json` 与 `deployment-vercel-cloudflare.md`；Cloudflare Workers Static Assets 保留为备选方案。

## 站点部署

### 1. 配置构建变量

`docusaurus.config.ts` 在构建期读取这些变量：

| 变量 | 说明 |
| --- | --- |
| `SITE_URL` | 站点正式地址，用于 SEO 与绝对链接；缺省是 `https://example.com` |
| `BASE_URL` | 部署前缀，必须以 `/` 开头和结尾；缺省 `/` |
| `CONTRIBUTION_API_URL` | 投稿接口完整 HTTP(S) 地址；留空时表单只导出草稿 |

未完成投稿服务联调前不要填占位地址，否则线上表单会把失败当成未确认。

### 2. 本地构建

```bash
pixi run --locked install
SITE_URL=https://<站点域名> BASE_URL=/ pixi run --locked build
```

产物在 `website/build/`，`website/wrangler.jsonc` 已把它配成 Workers Static Assets 的 `assets.directory`。

### 3. 部署

```bash
pixi run --locked workers-deploy
```

需要 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID`。首次部署后把自定义域名或 `workers.dev` 地址回填到 `SITE_URL`。

### 4. CI 与自动部署

- `.github/workflows/site-check.yml`：PR 与 `dev`/`main` 推送时跑 `install`、`typecheck`、`build`、`test` 和 `git diff --check`；`test` 前会安装 Playwright Chromium，不需要密钥。
- `.github/workflows/deploy-site.yml`：`main` 推送或手动触发；缺少 `CLOUDFLARE_API_TOKEN` 时跳过部署并给出提示，不会产生失败的红叉。

部署任务使用的仓库变量：`SITE_URL`、`BASE_URL`（可选，默认 `/`）、`CONTRIBUTION_API_URL`（可选）。

## 贡献服务部署

投稿、审核、图片存储都在 `what-to-eat-in-shou-contributions` 仓库，步骤、密钥和 workflow 见该仓库的 `deployment.md`。要点：

1. `wrangler d1 create` 建库并把 ID 写回 `wrangler.jsonc`。
2. `wrangler d1 migrations apply` 应用 `migrations/0001_init.sql`。
3. `wrangler secret put REVIEWER_TOKEN`，并在 `vars.ALLOWED_ORIGINS` 填写站点来源。
4. `wrangler deploy` 部署 Worker，再把它的 `/v1/submissions` 回填到站点的 `CONTRIBUTION_API_URL`。

## 发布回路

1. 投稿进入待审队列，图片只存在私有 R2。
2. 审核者批准后生成 `publish` 任务。
3. 导出器生成站点变更计划，在独立任务执行器中落到站点仓库分支并创建 PR；不在 Worker 内执行 git worktree。
4. 站点 PR 合并进 `dev`，经 `dev -> main` 发布，触发 `deploy-site.yml` 重新构建。

第 3 步的自动化尚未实现，当前仍靠本地命令 `scripts/plan-export.js` 加人工提交。

## 尚未完成

- 没有在真实 Cloudflare 账号上验证部署，`site-check.yml` 与 `deploy-site.yml` 只在本地做过语法与命令层面的检查（`site-check.yml` 会在本仓库的 PR 上实际运行一次）。
- 没有配置分支保护与 required checks，合并门禁仍以仓库实际配置为准。
- 未确认自定义域名、`BASE_URL` 前缀部署和深色模式的人工视觉复查。
