---
name: no-comments
description: "召唤 Comment Sicko，修复被接受的发现，并为声称的约束提供编码方案。"
disable-model-invocation: true
---

# No comments

召唤 Comment Sicko。处理被接受的发现。

听从 Comment Sicko 的新鲜视角。

## 范围

用调用方给的文件或 diff。否则用当前相对 base branch（默认 `main`）的 diff，含工作树。

## 步骤

1. 以 `subagent_type: "Comment Sicko"` spawn `Task`。传入范围。不要复述它的规则。
2. 检查它的报告和 diff。驳回这些情况：改动应用代码、超出范围、删了例外保护的注释、乱写 `MUST KILL` 理由、把刻意保留的代码当有罪。对"我们的代码里的意外"改写的旗标仍然可执行。不要恢复那些注释。keep 只有在能证明它针对的是我们改不了的东西时才成立。审计漏掉的范围内 lint 和 TypeScript suppression。正确性或安全相关的 suppression 仍是可执行的 `MUST KILL`。只有带精确例外和范围内证明时才恢复已删注释。接受单薄的 `IMPORTANT` 或 `do not remove` 式 kill/keep 之前，先对它们的符号跑 `/how` 或 `/why`。kill 有歧义就不恢复；keep 被驳倒或仍有歧义就删掉。报告被驳回一次就 revert 并重跑，指明失败点。第二次再驳回就报告为未决，并让 `/no-comments` 失败。
3. 琐碎的已接受旗标直接修：删死路径、去掉参数、改用真实 API。任何修复需要定形态时，对已接受的集合及其周边代码跑一次 `/architect`。停在草图。Architect 管形态，步骤 4 管实现。
4. 实现范围内最小的根因修复。移除每个被点名的 workaround。根因在范围外时，落地范围内最小修复并把其余报告为未决。**principle-fix-root-causes** 和 **principle-redesign-from-first-principles** skill 只指导意图，都不授权扩大围栏或修围栏外的实例。永远不要螺栓症状守卫。
5. 约束类注释写着 `do not remove`、`do not change wording` 或 `talk to X before changing`。关于我们改不了的东西的 keep 保留不动。提供最便宜的范围内编码方案：类型、运行时、测试或 CI lint。交互模式下等批准；unattended 和 eval 需要调用方预先批准。批准了就先编码再删除。否则删除，把约束报告为未决，并草拟范围外工作。
6. 报告删除数、恢复的注释、重跑次数、architect 草图、修复、编码提议、已完成的编码、未强制执行的约束、以及其他未决工作。
