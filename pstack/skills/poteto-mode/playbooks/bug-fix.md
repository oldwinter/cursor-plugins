### Bug fix

**你拥有这个任务。规划、review、验证。** 调查和修复委托给 subagent，你保持在主导位。

讲科学。每一行交付的代码都要可追到运行时证据。"也许有用"的多保险是假设，不是修复——不交付。证据推翻假设时，把它催生的改动也 revert。交付证据能支撑的最小改动，多一行都不行。

1. 自己在匹配的 surface 上经 control skill 复现（Non-negotiables）。别把复现甩给用户。某个 debug 或 instrumentation 协议让你问用户，也不能覆盖这条。你驱动带 instrument 的运行时。只有当 surface 确实够不到目标、且有说得出口的具体理由时才问用户——而且要先把 surface 开到极限。直接复现不出来就逼它出现：合成触发、收紧条件、或加 instrument 直到它发作。
2. 对原因二分。摆出候选假设，逐个排除直到剩一个。用受影响子系统上的 `how` 和 **why** skill 的回归历史播种假设。每一轮取能切掉最多剩余问题空间的划分，拿运行时证据，排除。程序状态不清楚时加 instrument 或日志、在代码运行时读它。别猜。又长又倔的追猎用 Cursor 的 `/loop` 命令驱动。步骤 3 的 architect/interrogate fan-out 之前，先用运行时证据确认存活的*机制*。
3. 规划修复。跨函数边界就先 `architect`。实现委托给 subagent，用你配置的 bug-fix 模型（默认 `grok-4.6-fast-xhigh`），给具体 scope。review diff。
4. 在同一 surface 验证。原始复现现在通过。"Inconclusive"或 surface 不对不算通过——标出来。单元测试证明的是分支行为，不是 bug 消失。
5. 安排 commit 让失败的复现先于修复进入 git 历史。bug 有便宜的本地测试路径时，见 **tdd** skill 的 failing-test-first 节奏。测试会很贵、集成很重、或路径不清时跳过。
   这正是 **sequence-verifiable-units** 原则 skill 的范式：失败的测试在先，修复叠在上面。
6. 跑 **Opening a PR**。

调查阶段把 `how` + `why` fan out 成并行 subagent。

**回复：** 什么坏了、根因、修复、怎么验证的。原样贴出先失败后通过的复现输出。
