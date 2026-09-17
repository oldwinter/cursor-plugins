# 改代码之前先理解代码

编辑你不理解的代码，正是隐蔽 regression 被交付的方式。pstack 给你四条入口：`/how` 解释代码现在做什么，`/why` 挖出它长成这样的原因，`/teach` 把两者揉成一份讲解，`/recall` 重建你自己在某个主题上的近期上下文。

![一名侦探拿着放大镜研究机器蓝图，机器人们取来案卷；她身后的证据板把线索串联在 /how 与 /why 之下。](./images/understanding.jpg)

## 用 `/how` 追踪行为

```text
/how 我们怎么做通知去重？查订阅者时会不会有 n+1？
```

问你真正想问的问题。[`/how`](../../skills/how/SKILL.md) 会读代码，并以"资深工程师带你上手这个子系统"的深度作答：runtime 流程、关键类型、不显然的部分。对大型子系统它会先并行 fan out 两到四个只读 explorer；对窄问题就直接读了讲。

## 用 `/why` 挖掘历史

```text
/why 重试上限当初为什么定为五？那个理由现在还成立吗？
```

[`/why`](../../skills/why/SKILL.md) 像侦办冷案的侦探一样工作。它从 source control 入手，然后并行查询你的 MCP 暴露的每一类证据——issue tracker、长篇文档、团队聊天、可观测性、错误追踪、分析数仓。报告会给所有结论标出处，把直接证据和推断分开，在记录单薄时说"appears to"（看起来是）。查无结果也会如实报告，因为"没人写下原因"本身就是答案。

两者天然可以组合。当你怀疑历史能解释这团乱麻时，`先 why 再 how` 就是一条很好的 prompt。

## 用 `/teach` 真正搞懂它

```text
/teach 给我讲这个 PR 怎么改动了重试。说服我它修的是根因而不是症状。
```

[`/teach`](../../skills/teach/SKILL.md) 用于摘要不够用的场合。它运行 `/how` 和 `/why`（小改动可能只跑其一），把发现织成一份通俗解释，一张图一张图地铺开。"说服我"这个框法值得偷学——它把讲解变成一场你可以戳一戳的论证，而不是一趟参观。

## 用 `/recall` 重建你自己的上下文

```text
/recall 给我补补课：上周的 export 工作进展到哪了
```

[`/recall`](../../skills/recall/SKILL.md) 挖掘你自己最近的聊天加上共享记录（issue、既往修复、仍在触发的错误），交回一份"现状如何、接下来做什么"的简报。冷启动回到某个主题时用它。如果你是想恢复某一个具体聊天，那是下面的 Session pickup playbook，不是 `/recall`。

## 用 Session pickup 接手先前的工作

当另一个 agent（或上周的你）把一个 branch 撂在半路上：

```text
/poteto-mode 接手这个 branch。读决策日志，弄清哪些做完了，从那里继续。不要重做已完成的工作。
```

[Session pickup playbook](../../skills/poteto-mode/playbooks/session-pickup.md) 把先前留下的轨迹当作权威。它重建 branch 的状态和决策、指明恢复点，并对着最初目标验证继承来的结论，而不是从零全部重推。

**陷阱：** 不要因为"agent 反正会读代码"就跳过本页的 skill。没有 trace 过模型就动手改的 agent，倾向于在第一个貌似合理的地方修症状。先 `/how` 一遍，比第二个 bug 便宜。

下一页：[设计改动](./04-design.md)。
