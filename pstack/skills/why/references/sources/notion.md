# Notion 文档

## 这个来源包含什么

- PRD（产品需求文档）
- 技术 spec 和 RFC
- 架构决策记录（ADR）
- 设计评审的会议记录
- 带领域背景的团队页
- incident 的 postmortem
- 可能解释防御性代码的 runbook
- 定优先级的战略文档

"why" 常在变成代码之前先以长篇形式活在 Notion。重要功能通常有一份文档。

## 怎么搜

用 Notion MCP。

1. **用 `notion-search` 做关键词搜索。** 试：
   - 功能名
   - 目标代码的关键符号 / 类名
   - 作者 handle（设计文档常先于代码写成）
   - 错误串或用户可见术语
   - 知道代码发布时间时做时间限定查询
2. **用 `notion-fetch` 拉候选页面。** 读完整内容不是预览。理由常埋在文档中段。
3. **跟随 backlink 和子页面。** 设计文档常有"考虑过的替代方案"、附录或实现笔记的子页。
4. **查相关 database。** `notion-query-data-sources` 和 `notion-query-meeting-notes` 能浮出讨论过该决策的会议记录。
5. **搜作者个人空间。** PR 作者若有个人笔记本（一些公司很常见），里面可能有先于代码的探索性思考。

## 这里什么样的证据算好

- "Problem statement" 或 "Motivation" 一节与目标代码用途吻合的 PRD
- "Alternatives considered" 或 "Rejected approaches" 一节
- 点名目标代码是某次 incident 修复的 postmortem
- 记录了 "we decided X because Y"、且与 PR 同作者/同时间段的会议记录
- 非敷衍填写的 ADR 模板（status、context、decision、consequences）

## 常见坑

- **过期文档。** spec 常写于实现之前且不再更新。文档描述的可能是已变更的计划。对照实际 PR 交叉核实。
- **文档与现实漂移。** spec 说 "we'll do X" 但代码实际做了 Y。标出分歧，synthesizer 会浮出矛盾。
- **样板模板。** 有些组织要求 "Why" 一节但被填了套话。看有没有具体性。
- **没链接的文档。** 最相关的文档可能哪里都没挂链。宽泛关键词搜索有帮助。
- **多份草稿。** 一个主题有多份文档时，找定稿或最近更新的那份。查日期。
- **访问受限页面。** 访问不了就记为缺口。

## 返回什么

每份相关文档：
- 标题和 URL
- 作者和最后更新日期
- 动机文本（逐字引用），含页面/小节位置
- 相关被链接页面（供 synthesizer 引用）
- 文档是定稿还是草稿
