---
name: show-me-your-work
description: "为长跑或无人值守的工作留一份可 review 的决策轨迹：一个 TSV 日志，每个决策一行（做了什么、为什么、证据、结果）。默认本地；当 reviewer 需要这条轨迹才能信任结果时才提交它。用于 /show-me-your-work、自主或多阶段 run、或人离开后回来 review 的工作。"
disable-model-invocation: true
---

# Show me your work

维护一份权威日志。

## 格式

单个 TSV 文件，每个决策一行。单元格保持单行。证据是指针，不是散文。

复制 `references/decision-log-template.tsv`（表头行）开一份干净日志。列：

- **ts.** ISO8601 时间戳。
- **phase.** 阶段或工作流。
- **decision.** 选了什么或做了什么，一行。
- **why.** 用大白话写的理由。是原则驱动的就直说原则，不要写成术语标签。
- **evidence.** 能证明它的链接或路径：commit SHA、PR 号、`file:line`、或产物/trace/截图路径。绝不写段落。
- **result.** 结果或谓词状态：`tests green`、`reverted`、`pixel-diff 0`、`INCONCLUSIVE`、`open`。

一个例子，大白话写得让 reviewer 一眼看懂。仅供示意——别把这些行抄进真实日志。

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## 记一行

每条像跟队友口述你做了什么那样写。大白话、具体动作、不要 AI 腔或抽象行话（**unslop** skill 对日志文本同样适用）。

用 helper：`scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>`。它打 `ts` 时间戳、首次写入时写表头、剥掉游离 tab/换行、并给以 `=`、`+`、`-`、`@` 开头的单元格加单引号前缀。裸 `printf` 追加一行也行，但单元格来自生成文本或用户输入时注意同样那些字节。

记决策点和 checkpoint，不是每个动作：选了一个岔路、一个单元完成及其验证结果、一次 pivot 或 revert 及其触发、浮出的 blocker、修掉的 gate。循环 run 每轮迭代一行。琐碎和自明的跳过。

## 放哪

默认日志是工作产物，不提交。放在工作目录的 `decisions.tsv`，多路并行时放 `.audit/<task-slug>.tsv`，别进 git。

只有当工作大到 reviewer 需要这条轨迹才能信任结果时才提交它。

## 规则

- 一行就是一个决策或 checkpoint。
- 只追加。错误的决定用一行新记录盖过它。绝不编辑或删历史。
- 优先已提交脚本产出的证据，而非手工一次性产物（**encode-lessons-in-structure** 原则 skill）。

## 对照 transcript 审计日志

run 结束、交回之前，检查日志说了实话。读当前工作区 `agent-transcripts/` 目录下本次 run 的 transcript（系统提示里有路径）。不要 glob `~/.cursor/projects/*/`——那会读到无关的私密聊天。把日志和实际发生的事对一遍：

- 每行对应一个真实动作。删掉编造或许愿式条目。
- 每行的证据可解析、且确实显示该行声称的东西。
- 影响了工作却没记的岔路、pivot 或被放弃的方案是缺口。补上。
- 删掉凑数行。

修日志，不修故事。工作和某行声称的不一样，是那行错了。

## 跨模型 review 这条轨迹

交回之前，在一个与干活不同的模型族上 spawn 一个 subagent。自我 review 不能替代。subagent 读审计轨迹和本次 run 的 transcript，然后标出用户该注意的地方。不是重做工作，是扫有什么次优或有风险的。

- 证据弱或缺失的决策。
- 跳过或空口声称的验证步骤（transcript 里没证明）。
- 事后看有风险的决策（过早、scope 蔓延、糊住症状）。
- 用户随手一扫会漏掉的缺口。

产出了轨迹的 run，每条回复以 "Attention" 一节收尾。开头一行写 reviewer 模型（`reviewed by <model>`），然后逐条列出指向具体行或时刻的 flag。"No flags" 是合法值，模型名不是。

## Review 这条轨迹

从头读到尾，顺着证据指针走，抽查。GitHub 把提交的 TSV 渲染成表格。终端里 `column -s$'\t' -t decisions.tsv`。

## 组合本 skill

其他 skill 把它们的审计轨迹路由到这里，而不是另造一个。按名引用它，让它拥有这个格式。不要复述列定义。
