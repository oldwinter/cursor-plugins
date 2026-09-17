# Incident 与 Postmortem 上下文

不是独立来源，而是一个**跨类别角度**。incident 经常促成防御性代码（"X 故障之后我们加了这个检查"），所以如果目标看着是防御性的（null check、retry 逻辑、timeout 处理、rate limiting、feature flag），就在每个可用来源里专门搜 incident 历史：

- **Notion**：搜提及目标文件、功能或错误串的 postmortem
- **Linear**：找打着 `incident`、`sev-*`、`postmortem-action-item`、`reliability` 标签的 ticket
- **Slack**：在目标代码加入的日期附近搜 `#sev-*` 和 `#incident-*` 频道
- **Git**：message 像 "fix for incident"、"add defensive check"、"revert" 之后又 "re-apply with..." 的 commit 是强信号
- **Datadog**：`search_datadog_incidents` 找带时间线的正式 incident 记录、以及作为 postmortem action item 建的 dashboard 和 monitor
- **Sentry**：first-seen/last-seen 窗口与目标 PR 发布日期对齐的 issue、穿过目标代码的 stack trace
- **Databricks**：把错误条件归类的产品分析事件（客户端上报失败、用户可见重试事件等）在 incident 窗口常会尖峰。目标 PR 发布后该事件计数下降，是"目标代码解决了用户可见症状"的间接支持——即使 Datadog/Sentry 信号嘈杂。

找到 incident 链接就把完整 postmortem 拉下来。postmortem 通常有 "Action Items" 一节，直接对应代码改动。多个来源互相印证时证据格外强（一个 Datadog incident ID 出现在 Linear ticket 里、ticket 出现在 Notion postmortem 里、postmortem 出现在 Slack 串里、Slack 串又链接到目标 PR，且 Databricks 错误事件计数在修复后下降）。

当代码的防御性让"由 incident 促成"讲得通时值得花时间。看着不防御的代码就跳过。
