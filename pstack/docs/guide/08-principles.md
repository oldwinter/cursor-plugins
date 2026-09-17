# 用 principle 名字做舵

pstack 附带 23 条 principle，各自是独立 skill。`/poteto-mode` 在每个多步骤任务开始时读它们的索引，应用任务触发的那几条，并在回复里点名每条被应用的原则连同它改变的那个决策。

你不是去"调用"principle，而是用它们的名字做舵。每个名字背后是一条 agent 已经读过的完整规则，所以一个短语比一整段指令更精确地扭转工作方向。

## 实操中的掌舵

比如 agent 正要把一个新 adapter 螺栓到已有的三个上：

```text
用 subtract before you add。先删掉过时的 adapter，再设计剩下的。
```

比如它因为 build 过了就声称成功：

```text
应用 prove it works。跑真实的 import 流程，给我看写入的记录。
```

比如两个并行尝试正要写同一个 branch：

```text
separate before serializing shared state。给每个尝试自己的 worktree，不要锁。
```

每个短语之所以有效，是因为它背后的规则足够具体。agent 仍然必须在回复里说清这条规则改变了哪个决策。引用了一条原则却说不出对应决策，就是它只是在点名而没有应用的破绽。

## 23 条速览

core 原则决定建多少、何时重新思考设计：

- [Laziness Protocol](../../skills/principle-laziness-protocol/SKILL.md)：偏向删除，偏向能解决问题的最小改动。
- [Foundational Thinking](../../skills/principle-foundational-thinking/SKILL.md)：写逻辑之前先选定核心数据结构。
- [Redesign from First Principles](../../skills/principle-redesign-from-first-principles/SKILL.md)：把新需求当作从第一天起就存在来整合。
- [Attack the Premise](../../skills/principle-attack-the-premise/SKILL.md)：盘点哪些 actor 持有失衡之后，质疑两个以上失败修复共享的那个前提。
- [Subtract Before You Add](../../skills/principle-subtract-before-you-add/SKILL.md)：先移除死重，再在上面构建。
- [Minimize Reader Load](../../skills/principle-minimize-reader-load/SKILL.md)：折叠读者必须记在脑子里的层级和隐藏状态。
- [Outcome-Oriented Execution](../../skills/principle-outcome-oriented-execution/SKILL.md)：让重写向目标设计收敛，而不是保留用完即弃的兼容状态。
- [Experience First](../../skills/principle-experience-first/SKILL.md)：把用户结果置于实现便利之上。
- [Exhaust the Design Space](../../skills/principle-exhaust-the-design-space/SKILL.md)：没有先例时构建两三个互相竞争的 prototype。
- [Build the Lever](../../skills/principle-build-the-lever/SKILL.md)：构建那个干活或证明的脚本，让审查者可以重跑。

architecture 原则决定状态、校验和兼容性住在哪里：

- [Model the Domain](../../skills/principle-model-the-domain/SKILL.md)：把重复出现的规则编进一个结构，而不是散落的条件判断。
- [Boundary Discipline](../../skills/principle-boundary-discipline/SKILL.md)：在边界校验，信任内部类型。
- [Type System Discipline](../../skills/principle-type-system-discipline/SKILL.md)：让非法状态无法被表示。
- [Make Operations Idempotent](../../skills/principle-make-operations-idempotent/SKILL.md)：让重试收敛到同一个终态。
- [Migrate Callers Then Delete Legacy APIs](../../skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md)：迁移和删除在同一波完成。
- [Separate Before Serializing Shared State](../../skills/principle-separate-before-serializing-shared-state/SKILL.md)：先消除共享，再加协调。

verification 原则定义什么才算证据：

- [Prove It Works](../../skills/principle-prove-it-works/SKILL.md)：验证真实制品，不是代理指标。
- [Fix Root Causes](../../skills/principle-fix-root-causes/SKILL.md)：改代码之前先复现并追到原因。
- [Sequence Work into Verifiable Units](../../skills/principle-sequence-verifiable-units/SKILL.md)：每个小单元先结束于一次检查，再开始下一个。
- [Test Behavior, Not Implementation](../../skills/principle-test-behavior-not-implementation/SKILL.md)：以用户调用代码的方式调用，断言一个字面量期望值；删掉那个即使每个被 import 的函数都返回 `undefined` 也仍通过的测试。

delegation 原则让并行工作保持正常：

- [Guard the Context Window](../../skills/principle-guard-the-context-window/SKILL.md)：把批量阅读路由给 subagent，主聊天只留发现。
- [Never Block on the Human](../../skills/principle-never-block-on-the-human/SKILL.md)：可逆工作先推进，拿出结果。

以及一条 meta 原则：

- [Encode Lessons in Structure](../../skills/principle-encode-lessons-in-structure/SKILL.md)：把你重复过两遍的建议变成 lint、检查或脚本。

不用背这张表。现在浏览一遍，之后当你抓到 agent 做出某个这里的名字本可预防的行为时再回来。词汇就是这样粘住的。

下一页：[把它变成你的](./09-make-it-yours.md)。
