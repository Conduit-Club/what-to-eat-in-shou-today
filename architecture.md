# 架构与投稿协议

## 边界

项目已拆为两个仓库。本站负责 Docusaurus 静态页面、卡片、投稿表单和审核后的公开内容；`what-to-eat-in-shou-contributions` 负责匿名投稿、私有图片存储、审核及后续内容导出。React 卡片仅接收 `Restaurant` 数据，列表读取本地审核后 JSON 快照，不在构建时依赖远端服务。不要让卡片直接依赖后台内部数据结构。

贡献服务已有投稿与审核 API、PostgreSQL/S3 适配器、初版 OpenAPI 和内存仓储测试的原型实现，但尚未完成真实 PostgreSQL/S3 集成测试、幂等投稿、审核后导出、站点仓库 PR 创建、完整图片校验、限流、认证或 Cloudflare Workers 适配。它不能视为生产可用。Artalk 可作为评论模块，餐厅结构化投稿需要单独的服务适配，不能直接使用评论 API 替代本协议。

推荐流程：

```text
用户表单 → 贡献服务 / 图片存储 → 待审核 → 管理员审核
                                           ↓
静态托管 ← Docusaurus 构建 ← 审核后数据快照（PR 或自动导出）
```

当前不建立独立数据仓库。只有内容审核具有独立维护者或发布周期时，再拆数据仓库。前端组件暂不拆成插件仓库。拆分依靠版本化的数据协议，不依赖 Git 子模块。

## 公开餐厅数据

字段定义位于 `website/src/types/restaurant.ts`，快照位于 `website/src/data/restaurants.json`。每个条目包含稳定 ID、名称、范围、图片、位置、口感、消费范围、营业时间、用餐日期、核验日期与详情链接。

迁移的历史条目可以将未知图片或日期设为 `null`，页面必须显示“待补充”；新投稿必须提供照片、名称、位置、口感和用餐日期。营业时间不知道时明确填“待补充”。用餐日期不能当作核验日期，核验日期由实际审核行为产生。

`image` 为本站 `/img/...` 路径或公开 HTTPS 图片 URL；不要发布临时上传地址或带私密凭据的 URL。`detailPath` 为本站路由，组件通过 Docusaurus Link 处理部署前缀。

## 投稿 API v1

构建变量 `CONTRIBUTION_API_URL` 指向完整投稿 URL。浏览器发送 `POST multipart/form-data`，不要手动设置 Content-Type，浏览器负责 boundary。

| 字段 | 内容 |
| --- | --- |
| `metadata` | 下方 JSON 字符串 |
| `image` | 单张 JPEG / PNG / WebP 图片，最大 5 MiB |

```json
{
  "schemaVersion": 1,
  "name": "餐厅名称",
  "category": "on-campus",
  "location": "食堂与档口位置",
  "taste": "个人体验",
  "openingHours": "待补充",
  "visitedAt": "2026-09-16",
  "imageFilename": "photo.webp"
}
```

接收成功返回 **202 Accepted**，表示进入审核队列，不表示公开发布。当前前端不要求响应体，可添加 `{ "id": "...", "status": "pending" }`。字段错误返回 400/422，图片超限返回 413，频率限制返回 429；其他状态及网络错误在前端保留表单并提示未确认。超时后可能已被接收，用户应核实后再重试；贡献服务尚未实现幂等提交与状态查询。

服务端必须独立检查必填字段、长度、日期、图片真实格式与大小；客户端校验只用于改善体验。名称上限 100 字符、位置 300、口感 2000、营业时间 200。照片应去除不需要的 EXIF 信息并使用服务端生成的存储键，不能信任上传文件名。待审核数据及图片不进入公开快照。

服务独立配置允许的站点 Origin、请求限流及审核者认证。当前表单按匿名投稿设计，不携带跨域登录 Cookie；若以后增加登录或验证码，应扩展适配器。管理员凭据、存储密钥及重构建 webhook 密钥只保存在服务端。

## 静态离线行为

未配置 API 时仍可选择照片和填写表单。导出仅包含信息 JSON 和照片文件名，不包含照片二进制；页面明确提醒保留原图。未部署后台时不能承诺在线上传、审核或自动发布已经可用。

所有餐厅卡片均预渲染，禁用 JavaScript 仍能浏览内容和详情链接；搜索、筛选和投稿需要 JavaScript。

## 部署状态

站点已准备 Cloudflare Workers Static Assets 配置，构建产物仍为 `website/build/`。实际 Workers 帐号、路由、站点 URL 与 `CONTRIBUTION_API_URL` 尚未配置；在贡献服务完成可访问的测试部署和跨域联调前，生产构建不得设置虚假的投稿接口地址。

建议的目标部署为：静态站点使用 Workers Static Assets，贡献服务使用独立 Worker，待审数据使用 D1、待审图片使用私有 R2。该方案尚未实施或最终确认；贡献服务现有 PostgreSQL/S3 适配器需要迁移至 D1/R2，或通过 Hyperdrive 保留外部 PostgreSQL。
