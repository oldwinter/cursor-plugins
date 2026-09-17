---
name: setup-pstack
description: 配置 pstack 每个角色用哪个模型、用什么推理预算。检测你可用的模型，写一条始终生效的 rule 覆盖 skill 默认值。用于 /setup-pstack、"configure pstack models"、"pstack budget"，或更改 pstack 的模型选择。
---

# Setup pstack

写 `~/.cursor/rules/pstack-models.mdc`——一条始终生效、设定 pstack 各角色模型的 rule。

## 步骤

### 1. 检测可用模型

枚举本会话里可以传给 `Task` subagent 的模型 slug。这是可靠来源。如果 Cursor 还暴露列出用户可用模型的 models API 或 CLI，优先用它拿全量。一个都检测不到就请用户贴他们有权访问的 slug。绝不写没确认可用的真实 slug。别名 `inherit-parent` 和 `auto` 永远有效，尽管它们不是检测到的 slug。

### 2. 读当前状态

默认的角色-模型映射就是下面步骤 5 的 rule 形态。如果 `~/.cursor/rules/pstack-models.mdc` 已存在，读它，把它的 `# budget` 行和各角色值当作当前选择。否则从默认值开始。

### 3. 预算、映射、确认

**(a) 问预算。** 优先用 AskQuestion 而不是自由文本。用这几个完全一致的标签给四个选项；rule 里有记录时报当前预算。

- `unlimited — keep max`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) 应用预算。** 从 skill 默认值建工作表；重跑时保留你改过的每个角色——无论是改族、改列表、还是改成别名（`inherit-parent`、`auto`）。`unlimited` 让每项 effort 保持表中值。`large`、`medium`、`small` 把每个真实 slug 的 effort token（panel 条目也算）设为 `xhigh`、`high` 或 `medium`。effort token 是最后一个 token，或尾随 `fast` 之前的那个，档位阶梯为 `max` > `xhigh` > `high` > `medium` > `low`。结果不是检测到的 slug 时，用同族检测到的、effort 不超过目标的最高的那个；都不行就把该角色标为待选择。`inherit-parent` 和 `auto` 不变。所以 `small` 把 `claude-fable-5-1-thinking-max` 变成 `claude-fable-5-1-thinking-medium`，把 `grok-4.6-fast-xhigh` 变成 `cursor-grok-4.6-medium-fast`（当只检测到那种形态时）。

**(c) 展示角色并确认。** 展示每个角色及其模型，把不在检测集合里的真实 slug 标为待选择。问用户原样接受还是改特定角色，选项给检测到的模型加 `inherit-parent` 和 `auto`（两者都意味着：该角色跑在父级聊天模型上——Auto 用户就是这样留在 Auto 上的）。优先用 AskQuestion 而不是自由文本。panel 角色（arena runners、architect runners、interrogate reviewers）的值是列表，每个条目跑一个 subagent——别名条目也算——所以列表长度决定数量。`arena cross-judge pool` 也是列表，但 Arena 从中选一个值，其模型族尽可能与父级不同。`swarm workers` 是每个 worker 的默认模型，除非 race 或 comparison 给某个臂分配了别的模型。

### 4. 校验

写下的每个真实 slug 必须在检测集合里。`inherit-parent` 和 `auto` 永远通过。选的真实 slug 不可用时停下重问。

### 5. 写 rule

写 `~/.cursor/rules/pstack-models.mdc`：`alwaysApply: true`、一行带所选标签及其目标 effort 的 `# budget`、每角色一行，用和 poteto-mode 相同的标签。整体覆盖写入，让重跑保持幂等。形态：

```
---
description: pstack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# pstack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`). Alias entries in a panel list still count toward its fan-out.
# budget: unlimited (max)
feature, refactoring: grok-4.6-fast-xhigh
bug-fix: grok-4.6-fast-xhigh
perf-issue: grok-4.6-fast-xhigh
hillclimb: grok-4.6-fast-xhigh
judgment and prose: claude-fable-5-1-thinking-max
hardest tasks: claude-fable-5-1-thinking-max
how explorer: grok-4.6-fast-xhigh
how explainer: claude-fable-5-1-thinking-max
why investigators: grok-4.6-fast-xhigh
why synthesizer: claude-fable-5-1-thinking-max
reflect tooling: gpt-5.6-sol-max
reflect judgment, divergent, synthesizer: claude-fable-5-1-thinking-max
arena runners: claude-fable-5-1-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
arena cross-judge pool: claude-fable-5-1-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
swarm workers: grok-4.6-fast-xhigh
architect runners: claude-fable-5-1-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
interrogate reviewers: claude-fable-5-1-thinking-max, gpt-5.6-sol-max, grok-4.6-fast-xhigh, claude-opus-5-thinking-xhigh
```

### 6. 确认

告诉用户 rule 已写入、对新会话生效。重跑本 skill 会更新它。

### 7. 提议 verification skill（可选）

检查项目有没有办法驱动真实 app 做证明（`verify-*` skill 或现有 harness）。没有就提议一次："want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill."答应就调用 `/create-verification-skill`（无论 pstack 装在哪都能解析：workspace、user 或 plugin）。拒绝就不再劝。
