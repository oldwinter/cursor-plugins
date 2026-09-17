---
name: principle-build-the-lever
description: "应用于任何非平凡工作，不只是批量工作：编辑、迁移、分析、检查。构建那个能干活或能证明的工具（codemod、脚本、生成器，或一份你的 subagent 可以遵循的 skill），而不是手工硬做。这个工具本身就是审查者可以重跑的制品。"
disable-model-invocation: true
---
# Build the Lever（造杠杆）

当工作不平凡时，构建那个能做这件事的工具，而不是手工硬做。

**为什么：** 双重回报。吞吐量：codemod、生成器或脚本每次都以同样方式工作，重跑免费。信心：工具是审查者可以阅读并重跑来核对的单一制品。手工做的改动只能靠重做来复核。一个确定性脚本把"相信我"变成"跑这个"。

**模式：** 默认造杠杆。只有当任务平凡——几处一眼看清的编辑——时才跳过。

- 第一个单元先手工做，学会配方，然后造工具。在同一个单元上重跑工具并和手工版本 diff，以此证明它。让杠杆可以安全重跑。
- 编辑用 codemod 或脚本，重复文件用生成器，分析用 dump-to-sqlite 查询，验证用可重跑的检查。
- 确定性杠杆胜过 fan-out。如果工具一遍就能处理所有单元，就自己跑。不要 fan out 委托去手工执行脚本能做的事。
- 当你把工作 fan out 给 subagent 时，把杠杆写成它们都要读的一份 skill：配方、验证契约和不许碰的围栏，合在一个制品里。把它放在委托的写权限范围之外，让它们没法悄悄改掉契约。
- 应用这条原则会产出一个文件。如果你引用了它而 diff 里没有 codemod、脚本、生成器或委托 skill，你就没有应用它。
- 当工作活得比会话久时，把杠杆 commit 进去。

**平衡：** 门槛是平凡与否，不是重复与否。只要杠杆是让工作可检查的东西，一次性任务也配得上它。按 [Laziness Protocol](../principle-laziness-protocol/SKILL.md)，构建能干活或证明的最小脚本，永远不是框架。

区别于 [Encode Lessons in Structure](../principle-encode-lessons-in-structure/SKILL.md)：后者把反复出现的指令变成持久护栏，本条面向手头工作的吞吐量和可审查性。要给验证本身写脚本，见 [Prove It Works](../principle-prove-it-works/SKILL.md)。
