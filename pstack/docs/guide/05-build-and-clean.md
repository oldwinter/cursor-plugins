# 构建改动并清理 diff

各个构建类 playbook 共享同一条纪律：你说出观察到什么，让 playbook 去索取证据。本页给出每种常见构建任务该往 prompt 里放什么，然后是让 diff 保持可审查的清理习惯。

## 把你已知的写进各构建 playbook 的 prompt

bug prompt 陈述症状，并要求先复现：

```text
/poteto-mode 这个命令在重试后发出两条记录。先复现，再修复并验证。
```

feature prompt 陈述行为以及不许变的东西：

```text
/poteto-mode 加一个 --json flag。text 输出保持逐字节一致。两种形式都验证。
```

refactoring prompt 在结构移动之前先钉住行为：

```text
/poteto-mode 把解析收进一个模块，零行为变更。先记录当前输出，并证明改完不变。
```

perf prompt 陈述测量结果，而不是一种感觉：

```text
/poteto-mode 这个 fixture 上启动要 1.8s。trace 一下，修测量到的原因，给我看前后对比。
```

它们各自路由到对应 playbook（[Bug fix](../../skills/poteto-mode/playbooks/bug-fix.md)、[Feature](../../skills/poteto-mode/playbooks/feature.md)、[Refactoring](../../skills/poteto-mode/playbooks/refactoring.md)、[Perf issue](../../skills/poteto-mode/playbooks/perf-issue.md)），由 playbook 补上你没敲出来的步骤：修之前先复现、实现之前先命名数据形态、重构之前先钉住行为、优化之前先 profile。

要对单个数字做持续改进，用 [Hillclimb playbook](../../skills/poteto-mode/playbooks/hillclimb.md)。给它指标、目标和尝试次数下限，它就一次循环一个假设、使用冻结的测量 harness。赢了保留，其余全部 revert。

## 用 `/tdd` 先写失败的测试

当一个 bug 有便宜的本地测试路径时，整个 prompt 可以只有两个词：

```text
/tdd implement
```

在上下文里这就够了。[`/tdd`](../../skills/tdd/SKILL.md) 先写最小的、能按预期原因失败的测试，再写修复，然后重跑测试。如果写测试需要大范围 harness 搭建或脆弱的 mock，skill 会明说，并改用最接近的可执行检查。不要在一条真实命令更能算数的地方硬塞测试。

## 让 TypeScript 规则自己加载

[`typescript-best-practices`](../../skills/typescript-best-practices/SKILL.md) 在你的工作流里没有 slash 命令。每当 agent 碰到 `.ts` 或 `.tsx` 文件它就加载，把类型系统原则落成具体规则：discriminated union、边界处用 `unknown`、穷尽 variant、从 schema 派生类型。

## 提交之前先清理

[Opening a PR playbook](../../skills/poteto-mode/playbooks/opening-a-pr.md) 会在每次 commit 前对 diff 跑 `/deslop`，并对 PR 描述和 commit body 应用 [`/unslop`](../../skills/unslop/SKILL.md)。`/deslop` 在 `cursor-team-kit` plugin 里，不在 pstack。没有它就用大白话要同样的结果：删掉解说性注释、没有依据的守卫、死的兼容路径、以及无关编辑。

对文字，`/unslop` 接受一个目标和你想加的任何额外规则：

```text
/unslop readme 的改动，不要用破折号
```

你会形成自己的简写。这个 skill 从 `unslop that, tighten it` 这种极简 prompt 里也能读对意图。

## 用 `/no-comments` 剥掉注释

注释需要单独过一遍，而且不能由写它们的那个 agent 来做——作者捍卫自己的注释，跟你捍卫你的一样。所以在 review 之前，把它们交给一双新眼睛：

```text
/no-comments the diff
```

[`/no-comments`](../../skills/no-comments/SKILL.md) 会召唤 [Comment Sicko](../../agents/comment-sicko.md)——一个只读 reviewer，保留清单很短：license 头、公共 API 的 doc 注释、解释代码无法表达之事的链接、被无法改造的外部依赖强制的行文。其余全删。你自己代码里冒出来的意外同样没有豁免：注释会变成一面 refactor 旗标，`/no-comments` 把接受的旗标在根因处修掉。当一条注释声称存在约束——"不许删"——skill 会提议把这个声称编码成类型、测试或 lint。无论哪种，注释都得出来。

这套分工值得记牢：`/deslop` 清代码里的 slop，`/unslop` 清文字里的 slop，`/no-comments` 把注释交给没写过它们的 reviewer。

**陷阱：** 清理不是可选的抛光。带着解说性注释和防御性死重的 diff，在 reviewer 眼里就是没做完，而多出来的代码正是下一个 bug 的藏身之处。如果 diff 看着虚胖，在 commit 前说 `deslop it`，别等 review 指出来。

下一页：[验证并交付](./06-verify-and-ship.md)。
