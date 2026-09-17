---
name: arena
description: "对同一任务 spawn N 个并行候选，选一个 base，把败者最强的部分嫁接进去。用于 /arena、'arena this'、'throw it in the arena'，或对非平凡制品只试一次会锁死错误形态时。"
disable-model-invocation: true
---

# Arena

对同一任务 fan out N 个并行尝试。把每个候选从头读到尾。选最强的做 base。把其他候选里最好的想法嫁接进来。验证综合结果。

## 开始

在启动任何东西之前，开一个每阶段一条的 todolist。

1. Frame
2. Fan out
3. Cross-judge
4. Pick
5. Graft
6. Verify

## Phase A：Frame

N 个候选会收到同一份 prompt，所以 prompt 就是契约。

1. 声明每个候选要产出的制品。
2. 推导 rubric。说清楚*这个*任务的成功长什么样，然后变成 3-6 条具体可打分的标准。rubric 是 Phase D 挑选者的工具。候选只看到任务。
3. 选 runner。用 `~/.cursor/rules/pstack-models.mdc` 里的 `arena runners`（存在时）。否则默认 `claude-fable-5-1-thinking-max`、`gpt-5.6-sol-max`、`grok-4.6-fast-xhigh`、`claude-opus-5-thinking-xhigh` 各一。arena 覆盖多个设计方向时多 spawn 几个。工作是生成瓶颈型而非判断敏感型时，同一模型跑 N 次。
4. 分配输出路径。每个候选写自己的位置（尽量是 git worktree，否则 `/tmp/arena-<slug>/candidate-<n>/`），按 **separate-before-serializing-shared-state** 原则 skill。

## Phase B：Fan out

在一条消息里 spawn 全部 N 个 subagent，`run_in_background: true`，每个带上任务、共享 grounding 的路径、自己的输出路径，以及产出制品加一份简短 rationale 的指示。

每份 rationale 要列出候选考虑过的替代方案和否决了什么。

候选没产出就带着 N-1 继续，在综合记录里记一笔掉队。

## Phase C：Cross-judge

Phase B 的候选全部完成后，从 `~/.cursor/rules/pstack-models.mdc` 的 `arena cross-judge pool` 里选一个模型（存在时）。否则用 `claude-fable-5-1-thinking-max`、`gpt-5.6-sol-max`、`grok-4.6-fast-xhigh`、`claude-opus-5-thinking-xhigh`。优先选和父 agent 不同的模型家族。在该模型上 spawn 一个只读 judge subagent。它看到 rubric 和以路径标签表示的候选，给每条标准打分，并推荐一个 base 附理由。它与 Phase D 中父 agent 的阅读并行跑，不是和候选并行。候选还在写的时候别 spawn judge。

## Phase D：选一个 base

挑选前把每个候选从头读到尾。

按 rubric 逐条给候选打分，不凭整体感觉。和 cross-judge 对照：对 base 意见一致，选择得到确认；意见不一致，说明你俩有一个带偏见或 rubric 含糊。决定之前把两份 rationale 都读了。

以"未来维护者能在哪个候选上最容易扩展而不破坏不变量"来选 base。两个打平时按 Laziness Protocol 优先边界更干净或 API 更小的。

把选择和理由连同 cross-judge 的裁决，记成 base 制品旁边的一页短综合笔记。

## Phase E：Graft

再过一遍每个落选候选，找出值得移植进 base 的东西。信号通常是每个候选一两处，不是大半。

每次嫁接都手工折进去，按 **redesign-from-first-principles** 原则 skill。别机械粘贴。结果必须在同一个心智模型下保持自洽。

记录嫁了什么、来自哪个候选、拒了什么、为什么。

当 N 个候选收敛到同一形态，那是强一致信号：在记录里记下收敛，直接交付共识形态，无需嫁接。当 N 个候选剧烈发散，说明 Phase A 规格不足——重新 frame 并重跑，而不是对分歧取平均。

## Phase F：Verify

综合出的制品必须经得起和其他产出一样的审视，按 **prove-it-works** 原则 skill。

如果验证暴露出 arena 没抓到的问题，要么 Phase A 错了（重新 frame 重跑），要么某个候选抓到了而你漏了嫁接（回 Phase E）。别粉饰。

## 产出

一份综合制品。旁边一页短综合笔记：点名 base、嫁接（含来源候选）、否决、掉队（如有）、以及验证结果。
