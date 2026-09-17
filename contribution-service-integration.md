# 贡献服务接入说明

本文是 `what-to-eat-in-shou-contributions` 导出器与本站的公开数据契约。贡献服务只应在审核通过后生成站点仓库 Pull Request；创建 PR 不表示内容已经公开，PR 应以 `dev` 为目标分支并由人工合并。

## 导出目标

导出器为新餐厅提交生成以下一致的站点变更：

| 目标 | 要求 |
| --- | --- |
| `website/src/data/restaurants.json` | 新增或更新一个审核后快照条目 |
| `website/docs/<category>/<id>.md` | 一个餐厅对应一个 Markdown 详情页 |
| `website/docs/<category>/index.md` | 加入指向详情页的相对 `.md` 链接 |
| `website/sidebars.ts` | 加入不带 `.md` 的文档 ID |
| `website/static/img/<id>.<ext>` | 仅导出审核通过、有公开许可的图片 |

`category` 为 `on-campus` 或 `off-campus`。`id` 是审核服务在确认公开内容时生成的稳定小写英文或拼音连字符标识，不能直接使用投稿 ID，且必须与同分类详情文件名一致。

## 快照模型

每条记录必须符合 `website/src/types/restaurant.ts`：

```json
{
  "id": "example-restaurant",
  "name": "餐厅名称",
  "category": "on-campus",
  "image": "/img/example-restaurant.webp",
  "location": "食堂与档口位置",
  "taste": "同学反馈：个人体验摘要。",
  "openingHours": "待补充",
  "visitedAt": "2026-09-16",
  "updatedAt": "2026-09-17",
  "price": "待补充。",
  "detailPath": "/on-campus/example-restaurant"
}
```

`image` 为本站 `/img/...` 路径或 `null`，不能是私有 R2 地址、临时上传 URL 或带凭据的 URL。新投稿虽要求照片，导出时若照片授权或审核未通过，必须将 `image` 设为 `null`，而非发布待审图片。

`visitedAt` 是投稿者的用餐日期。`updatedAt` 仅在审核者实际核验公开事实，例如门店位置、营业时间或价格时填写；只审核文本、图片许可或格式时应为 `null`，以免卡片的“最近核验”误导读者。未知日期、图片和营业时间使用 `null`，由站点显示“待补充”。

投稿 API 不收集 `price`，新餐厅条目填写 `待补充。`。审核者可按可核实的来源补充价格，注明人民币单位、适用条件和日期。`taste` 仅可概括实际投稿体验，必须保留“同学反馈”等归属，不得把主观体验改写成普遍事实。

## Markdown 内容

详情页使用以下结构：

```markdown
# 餐厅名称

## 位置

审核后的位置信息；不明确时写“待补充”。

## 消费范围

待补充。

## 注意事项

营业时间、优惠条件或其他已知限制；未知时写“待补充”。

## 同学评价

> 实际投稿的体验内容。
>
> —— 匿名投稿
```

导出器必须对投稿内容进行 Markdown 转义或使用安全的文本写入方式，不能让投稿者注入链接、HTML、MDX 表达式或脚本。若为已有餐厅追加内容，保留既有栏目、同学评价和人工维护的文字，只在审核者明确选择的区域追加；不能重新生成并覆盖整个文件。

## 站点侧检查

Pull Request 合并前运行：

```bash
pixi run --locked typecheck
pixi run --locked build
pixi run --locked test
git diff --check
```

站点测试检查快照 ID 唯一性、日期格式、详情文件、分类索引、侧边栏和公开图片路径的一致性。测试通过不代表餐厅事实或图片授权已经核验，审核记录仍由贡献服务保存。
