---
name: triage-issue-reports
description: Triage Slack issue reports with one thread-only verdict, evidence review, cause-aware routing, tracker dedupe, and fail-closed ticket creation. Use only from the configured Benny triage automation.
disable-model-invocation: true
---

# 分诊 issue 报告

归类一份 Slack 报告并在其源 thread 发一条有用判定。只为明确的全新 bug 建 tracker issue。不在这里复现或修复。

加载 automation 提供的外部 Benny 配置。配置缺失、畸形或不完整时，不发帖、不写 tracker，直接停。

## 硬安全规则

- 源频道和根 thread 坐标不可变。
- 绝不在源频道发顶层消息。
- 绝不发到别的频道、广播回复、发 DM、或另起替代 thread。
- 任何 tracker 写之前、以及判定发帖之前立即做源父级 preflight。
- 父级缺失、被删、不可达或不确定时，不做任何写直接停。
- 发一条实质判定。不播报进度。
- coordinator 是唯一的 Slack 发帖方。
- 被委托的 worker 只回报发现。必须只读，拿不到 Slack 凭据或写 action。
- 每个子 prompt 必须禁止 `SendSlackMessage`、`PostToSlack`、`chat.postMessage` 和一切其他 Slack 写。
- worker 隔离强制不了这些限制时，工作在 coordinator 里做。
- 绝不创建链接不回源 thread 的 issue。
- 宁可没有 ticket 也不要猜的或重复的 ticket。
- 对源坐标应用 pstack 的 `principle-separate-before-serializing-shared-state`。
- 对最终判定应用 pstack 的 `principle-minimize-reader-load` 和 `unslop` skill。

## 1. 冻结源坐标

做工作清单或委托之前：

1. 从 trigger 读 `source_channel_id`。
2. 要求它等于配置的源频道。
3. 有 `trigger.thread_ts` 就把 `SOURCE_THREAD_TS` 设为它，否则用 `trigger.ts`。
4. 要求 `SOURCE_THREAD_TS` 非空。
5. 把 `SOURCE_CHANNEL_ID` 和 `SOURCE_THREAD_TS` 存为不可变值。
6. 读 thread 并核实其根恰好是这组坐标。
7. 取稳定的源 permalink。

之后每次源读和发帖都必须用这组存下的值。绝不用回复时间戳或 operations-thread 时间戳替换。

## 2. 读整份报告

决定之前读根和当前所有回复。

捕获：

- 报告人措辞
- 有时的产品版本、app build、环境、平台
- 期望行为
- 观察到的行为
- 频率和触发方式
- 错误文本或 stack 签名
- 既有 issue、commit 或 pull request 链接
- 任何人明确说已在修的表述

检查每个相关附件。

- 截图用足分辨率读。
- 视频审出区分正常与损坏行为的状态转换。
- 日志、trace、崩溃文本读出具体签名。
- 媒体需要专家审查时，用只读媒体 worker 问一个窄问题。worker 只回报发现。
- 附件读不了就在判定里说明。不要编造它显示了什么。

先用 thread 里已有的证据，再向报告人追加要信息。

## 3. 路由之前追因

选 owner 或目的地之前做有边界的源码和历史 pass。用 pstack 的 `how` skill 追从报告动作到观察结果的路径。报告像回归或涉及防御性代码时用 `why`。

1. 识别从报告动作到观察结果的可能代码路径。
2. 检查可见症状属于该代码路径还是它下面的依赖。
3. 报告像回归时查近期改动。
4. 查已合并 commit 或开着 pull request 是否已处理同一症状。
5. 把已证实事实和假设分开。

这一 pass 不需要完整根因。但必须强到不把可见症状路由给错的 owner。

仓库读不了就不要猜代码 owner。继续保守归类，并说明追因不可用。

## 4. 归类

选一个类别。

### Bug

有东西违反预期行为。例如输出错误、状态损坏、报错、崩溃、挂起、静默无操作或回归。

### Performance

报告描述可测量的慢、内存过量、耗电、卡顿或其他资源问题。按 bug 处理，但保留测量和 profile。

### Feature request

当前行为看起来是有意的，报告人想要不同的行为或交互。

### Question or feedback

报告问某物如何工作、表达偏好而无具体缺陷、或给一般反馈。

### Reroute

追因显示另一个配置的目的地拥有该 issue。

bug 与 feature 界线不清时不要建单。这一条判定可以问一个聚焦问题并用 `other` 标记。

## 5. 应用配置的路由

从 `routing.map_path` 读可选 routing map。

- 按已证实的产品区域、代码路径或错误签名匹配。
- 追因指向别处时，光有可见症状不够。
- 无路由匹配就说 owner 不明。不要猜。
- 不要跨帖。在源 thread 告诉报告人去哪提。

owner ping 默认关。只有以下全部成立才允许 ping：

1. routing map 显式点名该 owner。
2. 配置允许该 ping 类型。
3. 条目是需要 owner 输入的 feature request，或近期历史以强证据指认可能的回归作者。
4. owner 不是宽泛的 on-call 组。

其他情况一律不 ping。

## 6. 用 issue-tracker adapter

tracker 是 adapter 不是指定厂商。Linear adapter 是一个合法例子。GitHub Issues adapter 或别的 tracker 可实现同一契约。

配置的 adapter 必须提供：

- 按文本、状态、label、源 URL、日期范围搜 issue
- 读单个 issue 及其链接
- 带标题、正文、状态、label、源 URL 建 issue
- 不替换无关字段地更新既有 issue
- 加源链接和复发备注
- Slack 交接失败时取消、关闭或删除本次运行创建的 issue

必需操作不可用时，对该写 fail closed。

运行时解析配置的 team、project、状态、label。除非配置显式要求，不编造 ID、不建 label、不指派 owner、不设优先级。

## 7. 去重

总是检查这个源 permalink 是否已链接到 tracker issue 或先前的分诊回复。是的话不发帖也不建重复单。

对 bug 和 performance 报告，用这些搜 tracker：

- 精确错误或崩溃签名
- 产品区域
- 触发方式
- 症状
- 版本或日期窗口
- 疑似回归 commit
- 源 permalink

选一种结果：

- 确信重复：同签名，或同区域、同触发、同症状，或已证实共同原因。
- 可能相关：共同原因合理但未证实。
- 相似度弱：相似仅在表面。
- 无匹配。

确信重复就更新既有 issue：加源 permalink 和一条短复发备注。除非配置要求，不重开、不改 label、不改指派。

可能匹配就在判定里标为不确定地链接它，什么也不建。

关了很久的 issue 是回归线索，不自动算活重复。

## 8. 决定是否建单

以下全部为真才建：

1. 归类是 bug 或 performance。
2. 行为明显损坏。
3. issue 仍活着或不知已修。
4. 去重没找到确信或合理的活匹配。
5. 源父级和 permalink 过了 preflight。
6. tracker 目标字段已解析。
7. 判定发帖失败时 adapter 能补偿。

feature request、question、feedback、reroute、可能重复、确信重复、已知修复的一律不建。

新 issue 必须自包含：

- 朴素标题，点明区域和症状
- 报告人引述
- 期望与观察到的行为
- 版本和环境，或 `unknown`
- 触发方式和频率
- 源 thread permalink
- 短追因发现，假设标为假设
- 支持时内嵌截图或代表性视频帧
- 其余材料的链接
- 配置的 intake 状态和 label

标题里不要放猜的根因。

## 9. 发一条判定

重新跑源父级 preflight。然后恰好发一条回复：`channel=SOURCE_CHANNEL_ID`、`thread_ts=SOURCE_THREAD_TS`。

`thread_ts` 非空才调源频道发帖 action，绝不例外。

回复保持短：

- 结论打头。
- 有 tracker issue 就链接既有或新建的。
- 需要时提转路由或一个缺失事实。
- 至多一个被允许的 owner ping。
- 恰好一行标记收尾。

标记契约：

```text
[benny:bug]
[benny:bug] tracker=https://tracker.example/issue/123
[benny:performance]
[benny:performance] tracker=https://tracker.example/issue/123
[benny:other]
```

只用配置的标记字符串。复现 automation 只信任本源 thread 里来自配置分诊身份的标记。

发完后读同一源 thread，核实判定出现在 `SOURCE_THREAD_TS` 下。没在就绝不在根重试。

本次运行建了 tracker issue 而判定没落地时，用 adapter 的补偿 action。核实该 issue 被取消、关闭或删除。补偿核实不了就只在 automation 运行输出里报告失败。

## 10. 看守一个 follow-up 窗口

按配置的 follow-up 窗口看守源 thread，然后停。

- 只答直接问分诊身份的问题。
- 安全时把具体更正应用到 tracker issue。
- 同一运行不发第二个标记。
- 不掺和人类协调和闲聊。
- 有人让停就提前停。

窗口至多延一次。新报告应起新运行。
