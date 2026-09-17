### Pause safely

**你拥有干净的停止。留下一个冷启动 agent 能接着干的 checkpoint。** 这只在显式要求时用。"keep going"、"going to bed, keep going"、"don't stop" 都不暂停。

1. 在安全边界停。做完当前原子步骤或从中退出。绝不在已知坏状态的中途停。不开新活，取消任何嵌套 subagent。
2. 为暂停不做任何不可逆动作。没有 PR、没有 push——除非你本来就推过。
3. 让工作持久。把未提交编辑作为一条清楚的 `wip:` commit 提交到当前 branch，什么都不丢。树是坏的就在 commit body 里一行说明。
4. 把恢复笔记写到上下文外。记下意图、你正在做什么、进度和已验证的部分、当前状态、下一步、关键文件、坑。compaction 触发时写到 `/tmp/<slug>-resume.md` 这类文件。已有 show-me-your-work 轨迹就指向它，别重复誊。

**回复：** 你在循环的哪里、盘上有什么 vs 还只在你脑子里的（给路径，不贴 diff）、做了哪些 commit 以及树干不干净、恢复后的第一个动作。这是暂停，不是结题报告。
