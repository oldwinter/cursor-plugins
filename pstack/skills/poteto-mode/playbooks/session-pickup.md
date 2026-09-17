### Session pickup

**你拥有恢复点。读先前的轨迹，别重做它。**

1. 定位先前轨迹。当前工作区 `agent-transcripts/` 目录下的本地 transcript（系统提示里有路径。不要 glob `~/.cursor/projects/*/`——那会跨越工作区边界、读到无关项目的私密聊天）、cloud-agent URL、或已推 branch。先读 metadata 概览和最后几条消息，再往回扫决策点。长 transcript 在 subagent 里解析，主线程只留浓缩时间线（**principle-guard-the-context-window** skill）。
2. 重建运行状态。branch 和 worktree、已落地什么（`git log`、对 base 的 `git diff`）、开着的 todo、做过的决策。先前轨迹是权威输入。压住重新推导它的冲动。
3. diff 已完成 vs 待办。对照已交付与计划，点名恢复点，不重跑先前的复现、不重做已完成的工作。来一遍"let me verify from scratch"意味着你把权威轨迹当成了不可信。
4. 把剩余工作路由到匹配的 playbook，并选判定：继续执行、交付一份完成的建议、追认或推翻先前结论、或对失败的 run 做 postmortem。pickup playbook 到此为止。被路由的 playbook 拥有剩下的事。
5. 对照原始目标、在真实产物上验证继承来的声称（**principle-prove-it-works** skill）。先前过关的自报不算证明。

**回复：** 先前 agent 停在哪、你继承了什么 vs 重做了什么（理想是没有重做）、恢复点、结果。
