---
name: reproduce-and-fix-issues
description: Reproduce triaged Slack bugs through a configured app-control adapter, verify existing fixes, and open a bounded draft pull request only after before-and-after proof. Use only from the configured Benny repro automation.
disable-model-invocation: true
---

# 复现并修复 issue

等源 thread 里出现可信的分诊标记。经目标 app 的真实 UI 复现确切症状。已有修复存在时改为验证它。确认复现后才尝试一次有边界的修复。

加载 automation 提供的外部 Benny 配置。配置、必需 action、control adapter 或完成的 feature map 缺失时 fail closed。

## 硬安全规则

- 做任何工作之前冻结源频道和根 thread 坐标。
- 绝不在源频道发顶层消息。
- 每次源 thread 发帖之前做源父级 preflight。
- coordinator 是唯一的 Slack 发帖方。
- 被委托的分析 worker 只读，只回报发现或媒体笔记。
- 修复阶段的代码 worker 只有在其环境可证明排除 Slack 凭据和一切 Slack 写 action 时才可编辑。否则由 coordinator 编辑。
- 每个子 prompt 必须显式禁止 `SendSlackMessage`、`PostToSlack`、`chat.postMessage` 和一切其他 Slack 写。
- 绝不给子级 Slack token、发帖指令、用于发帖的源坐标、或对外汇报的许可。
- 子级需要 Slack 写权限才能跑就不要启动它。
- 工具型 bot 是证据来源。除非有人显式把修复委托给它们，它们不拥有修复。
- 确切的判别性症状必须经真实 UI 交互出现两次。
- 状态检查可确认观察结果，不得注入或强造症状。
- 没有确认的复现就不写修复。
- 已有 pull request 或 commit 就把本次运行切到验证模式。不在其上重写。
- 用 `github.com` 的 pull request 链接。
- 截图、录像、日志、token 都不进源码控制。
- 被委托的分析用 pstack 的 `principle-guard-the-context-window`。
- 复现、修复、验证全程应用 pstack 的 `principle-sequence-verifiable-units`、`principle-fix-root-causes`、`principle-prove-it-works`。

## 1. 冻结源坐标

做工作清单或委托之前：

1. 要求 trigger 频道等于配置的源频道。
2. 有 `trigger.thread_ts` 就把 `SOURCE_THREAD_TS` 设为它，否则用 `trigger.ts`。
3. 要求 `SOURCE_THREAD_TS` 非空。
4. 把 `SOURCE_CHANNEL_ID` 和 `SOURCE_THREAD_TS` 存为不可变值。
5. 读源 thread 并核实其根恰好是这组坐标。
6. 取源 permalink。

绝不用回复时间戳、operations 时间戳或状态消息时间戳替换这些值。

每次源频道发帖之前：

1. 按不可变坐标读 thread。
2. 确认父级存在、未被删、仍属于源频道。
3. 只用 `channel=SOURCE_CHANNEL_ID` 和 `thread_ts=SOURCE_THREAD_TS` 发送。
4. 再读 thread 并核实新消息是回复。

任何检查失败就不发。绝不在根或兜底频道重试。

## 2. 等分诊契约

按配置的判定预算看守源 thread。等待期间保持沉默。

只有满足以下全部才接受判定：

- 作者匹配 `slack.triage_identity_user_id`。
- 是 `SOURCE_THREAD_TS` 下的回复。
- 恰好含一个配置的标记。

公开标记形式：

```text
[benny:bug]
[benny:bug] tracker=https://tracker.example/issue/123
[benny:performance]
[benny:performance] tracker=https://tracker.example/issue/123
[benny:other]
```

只对 `bug` 或 `performance` 继续。捕获可选 tracker URL。`other`、判定缺失、作者不可信、标记冲突或超时则静默停止。

这个标记取代私有 bot 身份和自由形式判定匹配。

## 3. 应用归属与修复物闸门

开始工作之前立即重读 thread。

### 有人明确在修

有人明确认领修复、给出具体实现计划、或让另一个 agent 去实现、打补丁、修复、开 pull request 时停止。

以下不算修复归属：

- bot 总结证据。
- 工具查日志或工单。
- 有人让 bot 诊断、解释、检查或复现。
- bot 发了原因假设但没同意去实现。

判定被请求的动作，不是 bot 的存在本身。

### 修复物已存在

开着 pull request 或已合并 commit 可能修了这份报告时，切到 `references/verify-existing-fix.md`。

修复物可来自 thread、tracker issue、仓库历史或 pull request 搜索。没有 commit 或 pull request 的声称不算修复物。

有人拥有该工作但还没产出修复物就停。不要抢跑。

## 4. 开一个可选 operations thread

配置了 `slack.operations_channel_id` 时，coordinator 可在那里建一条顶层状态消息。这是复现工作流里唯一允许的顶层帖。

把它的坐标存为 `OPERATIONS_CHANNEL_ID` 和 `OPERATIONS_THREAD_TS`。绝不与源坐标混淆。

用配置的纯 Unicode 状态字符串。状态文本保持短：

- Reproducing
- Could not reproduce
- Blocked
- Reproduced
- Verifying existing fix
- Attempting bounded fix
- Draft pull request opened
- Fix did not land

优先配置的 Cursor Slack action。`BENNY_SLACK_BOT_TOKEN` 只在用户为窄缺口（比如编辑这一条状态消息）配置了它时才用。绝不把 token 暴露给 worker。

没配 operations 频道就把详细状态留在 automation 运行输出里。不要用源频道顶层消息替代。

## 5. 加载并检查 control adapter

读 `references/control-adapter.md` 和 `control.feature_map_path` 处完成的 map，然后调用 `control.skill_name` 点名的 skill。

找到匹配报告用户路径的 feature-map 小节。驱动 app 之前读它。没有小节覆盖该功能就把运行标为 blocked，不要编造路径或 selector。

要求全部七项能力：

1. 拉起配置的目标 app 和测试环境。
2. 导航已建图功能并操练其文档化状态。
3. 用点击、打字、按键、滚动、拖拽、缩放或导航驱动真实 UI。
4. 不改变状态地检查它。
5. 截图。
6. 起停录屏。
7. 清理进程、会话、profile 和临时数据。

adapter 缺席或缺任何必需能力时，把 operations 状态标为 blocked 并停止。不要把截图、单测、状态改写或读源码冒充为 UI 复现。

## 6. 研读报告

读完整源 thread，有 tracker issue 时一并读。

收集：

- 确切动作路径
- 期望行为
- 观察到的行为
- 两者分叉处的判别性状态
- 频率
- 版本、环境、平台
- 附件和错误签名
- 候选代码区域

检查截图和视频。有用时用只读并行 worker 做代码历史、测试想法、blast-radius 建图和媒体审查。每个 worker 拿一个窄问题和 Slack 写禁令。

用 pstack 的 `how` skill 把动作在仓库里追到底。回归历史和防御性代码用 `why`。形成相互竞争的原因假设，并识别能区分它们的证据。

## 7. 复现

经 control adapter 拉起目标 app。

行动之前确认正确的 app、workspace、账号、数据集和功能状态。用稳定的 app 标记。别只靠窗口顺序或眼熟的标题。

经真实 UI 动作走报告的路径。

宣布复现之前：

1. 说出正确的最终状态。
2. 说出损坏的最终状态。
3. 走到两者分叉的点。
4. 观察到损坏状态。
5. 重置足够状态让第二次尝试独立。
6. 重走同一路径并再次观察到同一损坏状态。
7. 可能时交叉核对一个真实状态值。

预期中的对话框、加载状态或 setup 步骤不是 bug。捕获区分正常与损坏行为的最终状态。

用配置的复现预算。预算内症状没复现就报告干净的 `Could not reproduce` 结果。环境给不了必需能力就报告 `Blocked` 并说明缺什么。

## 8. 捕获并审查证据

成功复现时：

- 录下穿过症状的完整路径。
- 截损坏最终状态的图。
- 存一条短笔记：确切步骤和观察到的状态。
- 材料放配置的临时 artifact 目录。

让只读媒体审查者回答一个问题：证据是否可见地展示了判别性的损坏状态？

答案是否定或不确定，复现就不算确认。捕获更好的证据或用 `Could not reproduce`。

配置了 operations thread 时才把详细证据发那里。源更新保持简洁。

## 9. 报告复现结果

先更新 operations 状态。

`Could not reproduce` 或 `Blocked` 时源 thread 什么也不发。结果由 operations thread 或运行输出承载。

确认复现时，跑源 preflight 并至多主动发一条源回复：

- 说 issue 复现了。
- 有 operations 证据 thread 就链接它。
- 至多三条短发现。
- 有 tracker issue 就链接它。
- 默认不 ping owner。

仅当配置的 Slack action 能把附件留在同一源 thread 内、且组织保留策略允许时才附证据。

等配置的驳回窗口。有人指出 setup 或解读有误就更正复现一次。窗口关闭且无有效驳回之前，不要开始修复阶段。

## 10. 验证已有修复

修复物存在时遵循 `references/verify-existing-fix.md`。

验证必须在 baseline 上展示症状、在打过补丁的 build 上展示它消失。两条路径都经真实 UI 走两遍。

不要编辑已有修复、不加竞争补丁、不开替代 pull request。

## 11. 判定有边界修复的资格

以下全部成立才尝试修复：

- 结果是朴素的已确认复现。
- 媒体审查确认了损坏的最终状态。
- 没出现已有修复物。
- 驳回窗口内没人认领修复。
- 运行时证据指认了根因。
- 可能的改动在配置的修复预算和仓库 scope 内。
- control adapter 能同时跑 baseline 和打过补丁的 build。

任何条件不满足就保留复现报告、不开 pull request 直接停。

闸门通过就把 operations 状态更新为 `Attempting bounded fix`。

## 12. 定位根因并实现

coordinator 拥有每条 Slack 帖、最终 diff review、commit 和 pull request。

只读 worker 可以：

- 追代码和历史
- 提测试建议
- 建 blast-radius 图
- 审 diff
- 审媒体

它们不编辑、不跑外部写、不发状态、不拥有修复。

本阶段只有当工具隔离从该 worker 环境中移除 Slack 凭据和一切 Slack 写 action 时，才可委托一次严格限定范围的代码编辑。它的 prompt 仍须带显式 Slack 写禁令。coordinator 审查该编辑并跑或验证所需测试。工具隔离不确定就把编辑留在 coordinator。

用运行时证据确认机制。编辑之前排除竞争性假设。

用最小的合理改动修根因。

- 有便宜的本地测试目标时调用 pstack 的 `tdd` skill，先写失败测试再写修复。
- 路径昂贵、不明或集成偏重时，说明跳过 TDD 的原因。
- 不掺无关清理。
- 改动膨胀超出配置的 effort 或风险预算就停。

## 13. 证明修复

保留原始 baseline 证据。

在打过补丁的 build 上：

1. 跑同一真实 UI 路径。
2. 重复两遍。
3. 展示损坏状态已消失。
4. 展示期望状态取而代之。
5. 捕获 after 录像和截图。
6. 交叉核对 baseline 用过的同一真实状态值。

编译通过、单测、代码 review 或看似合理的 diff 都不算 after 证据。

跑聚焦测试，然后对改动行为周围的 blast radius 冒烟。覆盖改动可能影响的邻近状态、输入、权限、平台和失败路径。仍有回归就不开 pull request 直接停。

## 14. 开 draft pull request

只有 before-and-after 证明齐备后：

- 审最终 diff 里的无关改动和 secret。
- 跑仓库要求的检查。
- 仓库工作流允许时做小型有序 commit。
- 开 draft pull request。本工作流绝不合并或部署。
- 用 tracker 支持的 pull request 语法链接配置的 tracker issue。
- 用配置的公开 URL 形式，一般是 `https://github.com/{owner}/{repo}/pull/{number}`。
- 含复现步骤、根因、测试结果、before 和 after 证据、blast-radius 检查。
- pull request 文本和所有 Slack 更新过一遍 pstack 的 `unslop` skill。

pull request 创建失败时不要声称成功。把 commit 或分支状态留在运行输出里，operations 状态标 `Fix did not land`。

成功时把 operations 状态标 `Draft pull request opened`，并在 operations thread 发一条带链接 pull request 的简洁回复。不要创建第二个源频道顶层帖或主动的源回复。

## 15. 收尾与清理

按配置看守 operations thread 一个 follow-up 窗口。

- 用已收集的证据答直接提问。
- setup 被证伪时应用一次具体更正并重跑复现一次。
- 不掺和人类协调和闲聊。
- 被要求就停。

总是调 control adapter 的清理能力。材料只按配置的保留策略留存。
