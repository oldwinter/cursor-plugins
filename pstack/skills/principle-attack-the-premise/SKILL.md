---
name: principle-attack-the-premise
description: "当两个或更多共享同一前提的修复在同一道闸门上失败时应用。先做下一次修复之前，盘点哪些 actor 持有这种失衡，然后质疑前提，而不是再写一个同样假设它的修复。"
disable-model-invocation: true
---

# Attack the Premise（攻击前提）

当两个或更多共享同一前提的修复在同一道闸门上失败时，怀疑前提，而不是修复。

**为什么：** 共享前提下的每一次失败，都是关于这个前提的证据。

**模式：**
- **把前提写下来。** 前提就是每个失败修复都假设过的那一句话。
- **下一次修复之前先盘点。** 按 actor 统计失衡。盘点展示的是哪些 actor 持有失衡，而不是失衡有多大。按 [Build the Lever](../principle-build-the-lever/SKILL.md) 把盘点写成一个可重跑的脚本。
- **读出偏斜。** 如果每次运行都是同几个 actor 持有大部分失衡，说明有什么东西把这个角色分给了它们。找出是什么在分配这个角色。按 [Fix Root Causes](../principle-fix-root-causes/SKILL.md)，这个分配机制就是下一个"为什么"。
- **消除不对称，而不是补偿它**——按 [Laziness Protocol](../principle-laziness-protocol/SKILL.md)。在 actor 之间轮换这个角色、随机化分配、或把角色挪走，让没有任何 actor 每次运行都持有它。回程路径、共享池、批式交接、周期性再平衡，都会把分配留在原地并在每次运行时增加工作量。

**停：**
- 在前提写下来、盘点存在之前，不要开始下一次修复。
- 如果盘点在各 actor 之间是均匀的，前提就不是原因。去别处找原因，把盘点留作证据。

本原则区别于 [Redesign from First Principles](../principle-redesign-from-first-principles/SKILL.md)：后者围绕一个新需求重建设计，前者质疑当前设计假设的一个事实。
