# Sentry 错误历史

## 这个来源包含什么

Sentry 是"哪里出过错"的档案馆。对防御性、纠正性或错误处理代码，它常持有直接动机：促成某人加 check、catch、retry 或 fallback 的具体异常、stack trace 和频率。

- **Issues。** 按指纹分组的错误，带计数、first/last seen 时间戳、受影响 release 和评论
- **Events。** issue 内的单个错误实例（stack trace、tag、用户上下文）
- **Releases。** 带关联 issue 的部署记录（对"哪个版本修了它"有用）
- **Replays。** 用户可见错误的会话回放（启用时）
- **Profiles。** 性能 profile 数据（对 "why" 不太有用，更适合"多慢"）
- **Issue 评论与指派。** 有时含工程师对根因的记录

Sentry 最有价值的是**时间关联**："issue X 创建于 2024-01-02，峰值 500 事件/天，在 2024-01-15 的 v2.14.0 之后不再出现——正是发布那个防御检查的 release。"

## 怎么搜

用 Sentry MCP。

1. **定向。** 不知道 project slug 和 organization 时：

   ```
   find_organizations
   find_projects
   ```

2. **搜与目标相关的 issue。**

   ```
   search_issues（自然语言，如 "errors in PaymentService timeout"、"unhandled exceptions in uploadFile"）
   ```

   好 query 的成分：目标处理的异常类名、目标的函数或类名、目标检查的错误消息串、目标的文件路径。

3. **按 release 和时间窗口收窄。**

   ```
   search_issue_events（按 release、时间、environment、trace ID、tag 过滤）
   get_issue_tag_values（看一个 issue 在版本、用户、环境上的分布）
   ```

   对疑似 issue 检查：
   - **First seen。** 错误什么时候开始出现的？
   - **Last seen。** 什么时候停的？和目标发布日期对得上吗？
   - **Affected releases。** 哪些版本见过它？哪个版本是修复？
   - **频率轨迹。** 先尖峰再消失吗？

4. **拉完整 event 看上下文。**

   ```
   get_sentry_resource（传 Sentry URL 或 type+ID）
   ```

   stack trace 穿过目标代码吗？tag 和 breadcrumb 匹配目标防着的条件吗？

5. **查目标附近落地的 release。**

   ```
   find_releases（围绕目标的 commit 日期）
   ```

   把 release 版本和 PR 合并日期交叉对照。

6. **省着用 Seer。**

   ```
   analyze_issue_with_seer
   ```

   Seer 产出 AI 根因分析。当假设生成器用可以，但把它当推断而非权威。实际 event 和 stack trace 才是主要证据，Seer 的叙事是次要的。

## 这里什么样的证据算好

- **first seen** 在目标 PR 前不久、**last seen** 在其后不久消失的 issue，暗示目标解决了这个错误
- 穿过或落在目标函数上的 stack trace，展示被防御的那个确切失效模式
- PR 作者在 issue 上描述修复的评论
- 目标 PR 描述或 commit message 引用了 Sentry issue URL 或 ID
- 事件计数很高、在含目标的 release 之后停止的 issue

## 常见坑

- **分组漂移。** Sentry 按 fingerprint 分组。重构或改名会让"同一个"错误被记到新 issue ID 下。issue 戛然而止时，错误可能只是被重新分组了。查紧邻之后的新 issue。
- **release 关联噪音大。** 一个 release 含很多 commit。issue 在 v2.14.0 停止不证明是目标修的——同 release 里另一个改动也可能修过。和目标的精确 commit 交叉对照。
- **无声的修复。** 有时错误消失是因为上游变了，不是防御代码的功劳。关联暗示修复，不证明作者归属。
- **resolved ≠ fixed。** issue 可以被手动标 "resolved" 而没有任何代码改动。把 `resolved` 当一个人为标记，不是代码修复的证据。
- **Seer 幻觉。** Seer 会生成听着自信但不对的解释。下结论时回到实际 event、stack trace 和时间戳。
- **采样。** 有些项目激进采样 event。低计数可能只是高采样，不是罕见错误。存疑就记为缺口。

## 返回什么

每个相关 issue：
- issue ID 和标题
- project 和 organization
- first seen / last seen 时间戳
- 事件计数（及采样率，如已知）
- 受影响 release
- 展示与目标相关性的代表性 stack trace 片段（逐字摘录，不是概括）
- first/last-seen 与目标发布日期的相关性
- issue 链接
- 任何作者评论或 resolution 备注
