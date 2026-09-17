---
name: recall
description: "从你自己的聊天记录、实时状态和共享记录（用户报告、既往修复、incident）重建你近期的工作上下文，然后交回一份紧凑的现状简报。用于 'recall my work on X'、'catch me up'、'what have I been working on'、'where did I leave off'，开始或恢复工作之前。"
disable-model-invocation: true
---

# Recall

**在你开始或恢复工作之前，重建用户近期的工作上下文，交回一份紧凑胶囊：现状如何、接下来做什么。**

保持紧凑切题。只读范围内 thread 需要的，然后停。

你的上下文活在两份记录里。你自己的聊天记录装着你做了什么、决定了什么。共享记录装着同一份代码在别人名下发生的一切：用户反复报告的症状、上线了又被 revert 的修复、prod 里还在触发的错误。第二份记录正是 **why** skill 搜的东西——跨 source control、issue tracker、聊天和 issue 频道、长篇文档、错误追踪。一个拖着长 bug 尾巴的功能，大半故事在那里，所以别只靠你的 transcript 重建。

transcript 在 `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`，`<slug>` 是工作区路径去掉开头斜杠、把每个 "/" 换成 "-"（`/Users/you/proj` 变成 `Users-you-proj`）。每行一条聊天消息。

1. 先分类再路由。要恢复某个具体旧聊天是 `session-pickup` playbook，不是这个。把习惯变成持久 skill 是 `automate-me`。给人看的工做总结是另一个任务。recall 在你行动之前加载跨最近聊天的工作上下文。用户已经给了完整状态胶囊（路径、branch、改动）就直接用，跳过挖掘。
2. 搜索之前锁定 scope。钉住窗口（"recent"要是真范围，默认最近 7 天）、主题（如果点了名）、工作区（默认当前这个。没要求别读别的项目的 transcript）。把 scope 复述回去。绝不悄悄把"all"变成"recent N"。
3. 在你的聊天历史上 fan out。在快而便宜的模型上 spawn 并行 subagent，各拿语料的一片。告诉每个 subagent：按真实修改时间排序候选（`ls -t`），绝不按 UUID 名；先 grep 主题，只读匹配的聊天且只读相关区段；跳过当前聊天和明显噪音（subagent、eval、test 聊天）。每个返回同一 schema，每个聊天一块：主题、用户目标、决策、未结 thread、踩坑与纠正、产物（PR、ticket、branch），各引用聊天 UUID。只有一两个聊天时跳过 fan-out 直接搜。原始 transcript 留在 subagent 里，主线程只拿发现。
4. 只要主题点了名——某个功能、文件、子系统、区域或 bug——就扫共享记录。这是默认动作不是判断题，"my work on X"也不例外。交给 **why** skill 的 source investigator 做，但把问题从"这当初为什么这么建"调成"现在什么状态、试过什么没站住、用户还在报告什么"。复用它的按来源 playbook，让 investigator 和聊天历史挖掘并行跑，继承它的姿态：一个来源一个 investigator、null 结果也是发现、不可用的 MCP 跳过并明说。把回来的东西折进简报。只有当纯活动回忆、没有具名目标（"我这周干了啥"）时才跳过这步——那时你自己的历史和实时状态就是全部答案。
5. 对照实时状态验证。把挖掘和扫查浮出的 PR、branch、ticket 用 `git` 和 `gh` 核一遍。当答案取决于 agent 实际做了什么（跑了什么工具、读了什么文件、撞上什么错），读完整 transcript，不是裁过的本地副本。
6. 按下面的契约写简报。按 thread 分组。守住点名的主题。

## 输出契约

先胶囊，再 thread 状态，再问题，再下一步。更深的细节放后面或砍掉。

- **Capsule。** 至多 5 条 bullet。这是什么工作、整体到哪了。
- **Threads。** 每条一行，前缀恰好一个状态标签：`[merged #N]`、`[open PR #N]`、`[in flight <branch>]`、`[verified, uncommitted]`、`[reverted #N]` 或 `[planned, not started]`。没有标签的 thread 不算交代完——给它打上。
- **Problems。** 至多 5 个，反复出现的。包括用户还在报告的症状、以及任何上线了又被 revert 的修复——让下一次尝试从上一次失败的地方开始。
- **Next move。** 最有用的下一个动作，要具体。

相邻功能或 ticket 除非阻塞本项否则不进来。胶囊和 thread 行超出一屏时，先砍细节再砍 thread。简报过一遍 **unslop** skill；聊天发现按 UUID 引用，共享记录发现按来源引用（PR #、ticket ID、chat permalink、error-tracker issue）；任何公开输出前剥掉私密上下文。

**回复：** 按上面契约的简报。
