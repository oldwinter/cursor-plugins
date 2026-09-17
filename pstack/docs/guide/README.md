# pstack 指南

当你停止对 agent  micromanage（事无巨细地指挥）时，pstack 才发挥得最好。你描述想要什么、以及凭什么判断它做完了。`/poteto-mode` 负责挑选 playbook、在步骤需要时运行其他 skill，并把证据摆给你看。本指南会用真实的 prompt 教你养成这个习惯。

你将学到：

1. [安装 pstack](./01-setup.md)。装上 plugin 并选好模型。
2. [通过 `/poteto-mode` 路由工作](./02-poteto-mode.md)。给它一个目标，看它挑选 playbook。
3. [理解代码](./03-understand.md)。动手改之前先用 `/how`、`/why`、`/teach` 和 `/recall`。
4. [设计改动](./04-design.md)。在代码锁定形态之前用 `/architect`、`/arena`、`/swarm` 和 `/interrogate`。
5. [构建并清理改动](./05-build-and-clean.md)。构建类 playbook、`/tdd`、`/unslop` 和 `/no-comments`。
6. [验证并交付](./06-verify-and-ship.md)。在真实 app 上证明行为，然后开一个聚焦的 PR 并推进到合并。
7. [睡觉时让工作继续跑](./07-overnight.md)。一份 overnight 契约、一条可审计的决策日志，以及能扩展到单个 agent 之外的 playbook。
8. [用 principle 名字做舵](./08-principles.md)。23 个能在任务中途扭转 agent 的名字。
9. [把它变成你的](./09-make-it-yours.md)。你自己的 mode，外加如何测试一次 skill 变更。
10. [配方与陷阱](./10-recipes-and-pitfalls.md)。可直接抄的 prompt 和要避开的错误。

第一遍请按顺序读。之后每一页都可以独立查阅。

## 如果你只记住一件事

用你自己的话，给 agent 一个目标和一种检验方式：

```text
/poteto-mode 当重试落在运行中途时，export 会写出重复行。先复现，再修复并验证。
```

你不需要点名 playbook，也不需要罗列 skill。"先复现"加上一个可检验的结果，就是 `/poteto-mode` 所需的全部路由信号。它会匹配到 Bug fix playbook，把步骤复制进 todo list，并在每个步骤触发时调用正确的 skill。

下一页：[安装 pstack](./01-setup.md)。
