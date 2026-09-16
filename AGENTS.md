# AGENTS.md

本文件适用于整个仓库中的 AI 协作者及维护者。子目录如有更具体的 `AGENTS.md`，应在其作用范围内遵守补充规则。用户对当前任务的明确要求优先于本文件中的默认工作流程。

## 项目定位与结构

“今日海大吃什么”是水专手册的子项目，收集海大校内及周边餐厅、餐馆和小吃店的信息与同学体验。内容使用简体中文，区分可核实的事实与个人口味，保留不同同学的观点。

本站使用 **Docusaurus**，通过 **Pixi** 管理 Node.js / pnpm 环境、依赖与任务。

| 路径 | 用途 |
| --- | --- |
| `website/docs/index.md` | 网站首页、使用指南与参与说明 |
| `website/docs/on-campus/` | 校内概览及食堂、档口条目 |
| `website/docs/off-campus/` | 校外概览及餐厅条目 |
| `website/static/img/` | 页面图片 |
| `website/src/css/custom.css` | 自定义样式 |
| `website/docusaurus.config.ts` | 站点、主题、导航及 Markdown 扩展配置 |
| `pixi.toml` / `pixi.lock` 与 `website/package.json` | 环境声明、任务及锁定依赖 |
| `website/build/` | 构建生成物，不作为内容源修改或提交 |

## 分支与协作

沿用日常集成与正式交付分离的流程，本项目使用 `main`，不是 `master`：

```text
feat / fix / docs / chore 分支 → dev → main
```

- `dev` 为日常开发与集成分支，`main` 为正式交付分支。
- 普通功能、修复、内容及配置更新应通过任务分支的 Pull Request 进入 `dev`；发布通过 `dev -> main` Pull Request 进行。
- 开始工作前检查 `git status`、`git branch --show-current` 和相关差异，保留用户已有修改。
- 创建任务分支时，先执行 `git fetch origin`，再从最新的 `origin/dev` 创建分支，例如 `git switch --no-track --create docs/<topic> origin/dev`。
- 需要推送时使用 `git push --set-upstream origin HEAD`，让任务分支跟踪 `origin/<同名任务分支>`；不要将其上游设为 `origin/dev`。
- 无仓库写入权限时，在 Fork 中创建任务分支，向本仓库的 `dev` 提交 PR。
- 仅要求本地修改的任务无需为了完成编辑而推送、创建 PR、合并或发布；交付范围以用户要求为准。
- 不得覆盖、删除或重置无关的本地修改，不得擅自改写共享分支历史、强制推送或删除其他协作者的分支。
- 发生冲突时逐项审阅并保留双方有效修改，不得简单用 `ours` 或 `theirs` 静默丢弃内容。
- PR 合并后，确认没有未交付提交，再清理自己的任务分支；不要删除 `dev`、`main` 或其他协作者的分支。
- 如有仅进入 `main` 的紧急修复，应及时同步回 `dev`。

## 餐厅内容规范

每家店原则上一个 Markdown 页面，放在对应的校内或校外目录。文件名沿用小写英文或拼音、以连字符分隔的方式，避免无关重命名。

新增条目沿用现有结构：

```markdown
# 店铺名称

## 位置

具体门店、食堂或档口位置；无法确认时写“待补充”。

## 消费范围

人均、单品或套餐价格，并说明适用条件；未知时写“待补充”。

## 注意事项

营业时间、优惠条件或其他已知限制；区分当前信息与历史体验。

## 同学评价

仅收录实际提供的评价；尚无评价时明确说明。
```

- 新增、删除或移动条目时，同步维护所在目录的 `index.md` 店家列表、`website/sidebars.ts` 和 `website/src/data/restaurants.json`。
- 店名、分店、地址或档口不明确时，保留“待确认”“待补充”等标记，不凭连锁品牌名称推断具体门店。
- 价格应注明人民币金额及计价单位，如“元/人”“元/份”，区分常态价、活动价和历史价格。尽可能记录用餐或核验日期，格式为 `YYYY-MM-DD`。
- 地址、营业状态、营业时间和活动条件应优先参考学校、商家官方信息或可核实的现场记录，并注明来源和适用门店。来源不明或过时的内容不得写成已核实的当前事实。
- 不得编造用餐经历、评价、评分、价格、来源或核验日期；缺少资料时保留空缺说明。
- 同学评价使用引用块并沿用匿名署名（如 A、B、C），不要擅自推断身份或公开姓名、联系方式、聊天账号等个人信息。
- 保留评价原意与不同意见，不把个别体验改成全体共识；概览中的摘要也应保留“同学反馈”等归属说明。
- “没吃过”不等于负面评价，主观口味或分量反馈不应扩写成未经证实的食品安全结论。
- 图片应有使用权限和必要署名，遵守仓库 `LICENSE` 与 README 中的 CC BY-NC-SA 4.0 许可说明；不要引入来源不明或不兼容授权的素材。

## Markdown、链接与导航

- 页面使用一个一级标题，各主要栏目使用二级标题，保持现有中文排版风格。
- 站内链接使用相对于当前 Markdown 文件的源文件路径并保留 `.md`，如 `changfen.md`、`on-campus/index.md` 或 `../off-campus/index.md`。
- 图片提供有意义的替代文本；Markdown 可引用 `website/static/` 资源，React 组件使用 `useBaseUrl` 处理本站资源路径。
- `website/sidebars.ts` 使用相对于 `website/docs/` 的文档 ID（不含 `.md`）；站点导航在 `website/docusaurus.config.ts` 的 `themeConfig.navbar` 中配置。
- 不要链接到本机绝对路径或 `website/build/` 中的生成文件；React 站内链接使用 Docusaurus `Link`，并验证非根 `BASE_URL` 部署。
- 修改文件路径、标题锚点或导航时，检查相关引用、概览页、上一页/下一页和目录导航。
- 使用 Markdown 扩展前确认 `website/docusaurus.config.ts` 已启用；新增扩展或插件时同步检查配置与依赖。

## 开发与验证

优先使用仓库已有 Pixi 环境与任务：

```bash
# 安装锁定的依赖
pixi install --locked

# 本地预览，默认访问 http://localhost:3000/
pixi run --locked dev

# 严格构建，实际执行 pnpm --dir website build
pixi run --locked build
```

`dev` 执行 Docusaurus 开发服务器，`serve` 预览构建产物。类型检查运行 `pixi run --locked typecheck`。前端依赖安装运行 `pixi run --locked install`，使用 pnpm 冻结锁文件。交互回归测试运行 `pixi run --locked test`，需安装 Playwright Chromium 或配置现有浏览器路径；该任务会构建测试专用的 `/food/` 版本。没有 `fmt-check` 任务，不得声称运行了不存在的检查。

- 修改 `website/docs/`、`website/docusaurus.config.ts` 或构建依赖后，应执行 `pixi run --locked build`；严格构建失败应先修复再交付合并。
- 仅修改根目录协作说明等不参与站点构建的文档时，可按范围检查内容与差异，无需新增测试。
- 提交前执行 `git diff --check`，并审阅新增文件与最终差异，确认没有误改锁文件或纳入生成物。
- 修改 CSS、主题、图片或导航时，除构建外，应尽可能检查桌面端、移动端、浅色和深色模式，关注目录滚动、图片比例、链接与文字可读性。
- 样式优先使用 Docusaurus / Infima 主题变量，避免硬编码只适合浅色模式的颜色。
- 构建成功不代表人工视觉检查或外部链接核验已完成，交付时分别说明实际执行的检查。
- 因网络、依赖或平台问题无法完成验证时，记录失败命令、原因及已完成的检查，不得声称构建、测试或 CI 已通过。

## 卡片与投稿扩展

- 卡片模型在 `website/src/types/restaurant.ts`，审核后快照在 `website/src/data/restaurants.json`；图片、名称、位置、口感和时间字段必须保留，未知值明确显示待补充。
- 投稿协议、后端职责和仓库拆分边界见 `architecture.md`。未配置投稿接口时只导出草稿，不声称上传成功。
- 前端保持静态构建，不在浏览器中放入服务端密钥；新增插件不得让默认构建依赖线上后台。

## 依赖与生成物

- 修改影响依赖解析的 `pixi.toml` 内容后，通过 Pixi 更新并检查 `pixi.lock`，保持声明与锁文件一致。
- 修改 `website/package.json` 后，通过 Pixi 内的 pnpm 更新 `website/pnpm-lock.yaml`，不使用系统 npm 或引入其他前端锁文件。
- 不手工修改锁文件绕过解析问题；常规验证使用 `--locked`，避免无意更新依赖。
- 修改依赖时考虑声明支持的 Linux、macOS（Intel / Apple Silicon）和 Windows 平台，并说明升级原因与验证范围。
- 不要提交 `website/build/`、`website/.docusaurus/`、`website/node_modules/`、`site/`、`.pixi/`、`.cache/`、`__pycache__/`、`.venv/`、`venv/` 等环境、缓存或构建产物，即使某些路径没有列入根目录 `.gitignore`。
- 不直接修改生成 HTML 来修复页面，应修改 `website/docs/` 或站点配置后重新构建。

## 变更范围与 Pull Request

- 一次变更聚焦一个主题，不混入无关重构、全仓库格式化、大规模移动或依赖升级。
- 提交信息描述实际结果；PR 说明修改目的、主要变化、验证命令与结果、已知限制。
- 尚未完成的工作可使用 Draft PR；涉及明显视觉变化时，尽可能提供截图或预览。
- 合并前完成适用的构建和仓库实际配置的必要检查，并由维护者或非作者协作者评审；发布 PR 由维护者审核。
- 不隐瞒失败检查，不将未配置的 CI、分支保护或自动部署描述为已经存在。实际合并门禁以仓库配置为准。
