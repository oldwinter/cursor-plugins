---
name: maintain-verification-skill
description: "周期性巡检，让项目的 verification skill 和 feature map 保持诚实：每个功能一个并行 source reader、一个驱动所有功能的实机会话、至多一个只装已证实修正的 PR。用于 /maintain-verification-skill 或 'audit the verify skill'。"
disable-model-invocation: true
---

# 维护 verification skill

app 一变，feature map 就开始烂。本 skill 是 `/create-verification-skill` 生成的 skill（或任何带 feature map 的项目本地 verification skill）的保养循环。严格度的单位是功能，不是每句话：从源码覆盖每个功能文件、实机操作每个功能，而不必把每条 bullet 都终端化执行。

## 结果

三选一，并说明是哪个：

- **clean**——每个功能都有源码和实机覆盖；没有值得交付的改动。不开 branch，不开 PR。
- **changed**——一个 PR 交付已证实的文档、harness 或 map 修正。
- **blocked**——覆盖跑不完，或已证实的修复无法安全交付。精确说明被什么卡住。

## 编辑范围

只编辑 verification skill 自己的目录（它的 SKILL.md、features/、以及它拥有的 harness 脚本）。run 中绝不改产品代码：map 描述了 app 已不具备的行为，要么是文档漂移（修 map），要么是产品回归（报告它，别在文档里糊过去）。

## 流程

0. **定位目标。** 找到要维护的 verification skill：正文有 launch/drive 小节和 feature map 的项目本地 skill（通常 `.cursor/skills/verify-*/`）。多个候选→问用哪个；没有→停下并指向 `/create-verification-skill`，别凭空发明目标。

1. **索引卫生。** 读 feature map 的 README 并 glob 它的兄弟文件。修掉缺失、多余、重复或死链条目。轻量做；不生成清单。

2. **源码波次。** 每个功能文件一个只读 subagent，并发启动。每个从源码讲清"这个用户可见的功能怎么工作？"、带引用标出疑似文档漂移、返回一条简洁的实机验证配方。子 agent 绝不驱动 app、绝不编辑文件。返回形态：功能摘要 / 源码入口点 / 疑似漂移或无 / 一条配方。

3. **对账。** 每个功能文件都有返回的摘要。把重叠配方合并到尽量少的 app 状态。抽查被引用的漂移；不重新证明干净声明。扫最近的 churn 找 map 没覆盖的用户可见 surface——说一个缺失之前要求有具体源码路径。

4. **实机波次。** 即使源码看着干净也必跑。coordinator 拥有全部驱动；遵循 verification skill 自己的 launch 模型——服务器和 UI 用一个长命实例串行驱动，短命 CLI 每次驱动开一个全新隔离会话（由该 skill 的 Launch 节决定，不是本节）。每个功能至少操作一次，且无论遇到什么失败都守住三条不变量：(1) 绝不驱动自上次表现异常以来没健康检查过的实例——首次驱动前 doctor、以会话为单位时每会话 doctor、任何驱动失败后 doctor；doctor 看不到的失败（健康进程上的卡死 UI 状态）就重置到已知状态或重启，而不是赌运气；(2) 迄今捕获的证据在每次 cleanup 后存活，在点名位置核实，不靠假定；(3) 一次驱动启动的东西不留得比那次驱动的用途更久——失败迭代的残渣无论会话是卡死、退出还是共享都要清（共享实例清残渣，不清实例）。skill 漂移引起的 doctor 失败按漂移处理：在编辑范围内修掉并重试一次——重启修复所作废的东西，仅此而已——之后才许把本轮报 `blocked`。够不到的功能只有在给出具体前置条件（auth、entitlement、OS、外部状态）和已尝试路径时才算 `verified-unreachable`；map 漏写该前置条件本身就是漂移。任何 triage 出的 harness 修复交付前都要实机重驱动验证。最终 teardown 发生在本次 run 最后一次驱动*之后*——包括那些重验证——不让任何东西活过这次 run（证据按 skill 规定保留）。

5. **Triage。** 错的或缺的用户视角描述→文档漂移，修掉。行为正常但 harness 驱动不了→harness 缺口，修掉；harness 修复遵循和生成时一样的 helper 规则（脚本可执行、调用方式写在 skill 正文）。app 行为真的坏了→产品缺口；记录给用户，别放进这个 PR。

6. **交付或收工。** changed：一个只装已证实修正的 PR，先重读每个改过的文件。clean 或 blocked：不开 PR，如实报告结果和覆盖情况。

把简洁的 run 笔记（覆盖了哪些功能、不可达的前置条件、确认的漂移、结果）写在临时位置；不要提交。
