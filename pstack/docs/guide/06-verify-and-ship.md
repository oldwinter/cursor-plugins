# 验证结果并开 PR

"能编译"不是证据。[Prove It Works 原则](../../skills/principle-prove-it-works/SKILL.md)要求 agent 在报告成功之前检查真实制品，而你的工作是让"真实制品"可检查。本页讲清楚怎么陈述完成条件、为你的 app 生成 verification skill、开 PR、以及把它推进到合并。

![一架原型机正在飞真实测试航线，她用秒表计时，机器人们拍摄并对照清单记录；终端上写着 verify: pass, evidence: captured。](./images/verification.jpg)

## 事先声明完成条件

在第一条 prompt 里写清什么叫"做完"，用你顺手的措辞：

```text
/poteto-mode 给这个命令加 json 输出。text 输出保持逐字节一致，json 能解析，两者都在示例项目上跑。给我看证据。
```

这样 agent 拿到的是三条可以执行的检查，而不是一种要迎合的情绪。回复回来时应该带着确切的命令和输出。如果某项检查跑不了，好的回复会说"inconclusive"（无法定论）；一句自信却没有证据的回复，你应该当作危险信号。

让检查匹配改动类型：

- CLI 改动：跑真实命令。
- UI 改动：在运行中的 app 里走一遍被改的流程。
- parser 或 migration：重放一份保存好的输入。
- perf 改动：对比前后 profile。
- storage 改动：把写入的值读回来。

对一个你不太放心的小 diff，[`/blast-radius`](../../skills/blast-radius/SKILL.md) 能找出它在别处可能弄坏什么。它挑出"这个改动之所以安全"所依赖的那一个事实，并通过运行代码来证明，而不是写一篇关于它的文章。

## 创建项目 verification skill

上面 UI 那一条藏着一个真实要求：agent 需要一种脚本化的方式来驱动你的 app。项目里有就最好，没有就跑：

```text
/create-verification-skill
```

[`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md) 采访的是仓库而不是你。它自己弄清：用户会碰到什么、app 本地怎么启动、什么能驱动它（优先现成 harness，否则用 browser + CDP、PTY 或纯 HTTP）、什么证据能证明行为、以及两个实例能否并排运行。只有代码答不上来的它才问你。

它写出 `.cursor/skills/verify-<app>/`——面向 agent 的说明，含 Launch、Doctor、Drive、Evidence、Cleanup 五节——外加 `features/` 下的 feature map，索引 app 会做什么、什么结果能证明每个 feature 正常。这个 skill 自带一个[完整的 feature-map 示例](../../skills/create-verification-skill/references/feature-map-example/)：一个 README 索引加每个 feature 一个文件，使用四个必备 H2。交付前，生成器会把 skill 端到端证明一遍：启动、doctor 检查、驱动一个 feature、捕获证据、清理。如果这次证明失败，就别用它的产物。

从那以后，"在 app 里验证"就是这个仓库里任何 agent 都能执行的一步，不再需要 setup 对话。

verify skill 能跑之后，一个 [`/swarm`](../../skills/swarm/SKILL.md) 可以按 feature-map 条目拆分一次完整 pass 并汇总结果。

## 让 verification skill 保持诚实

app 会变，feature map 会腐化。发现脱节时就跑：

```text
/maintain-verification-skill
```

[`/maintain-verification-skill`](../../skills/maintain-verification-skill/SKILL.md) 审计生成的 skill：每个 feature 一个只读 source reader 并行扫描，然后一次实机 pass 驱动每个已映射 feature。它必定以三种结局之一收场：`clean` 表示覆盖完整、无需交付；`changed` 表示产出一个只含已证实修正的 PR，且只动 verification skill 自己的目录；`blocked` 指明阻塞物。它从不编辑产品代码。如果实机 pass 抓到产品 regression，它会报告 regression，而不是在文档里粉饰过去。

## 开 PR

```text
/poteto-mode 开 pr。小的有序 commit，描述里带证据。
```

[Opening a PR playbook](../../skills/poteto-mode/playbooks/opening-a-pr.md) 在 worktree 里工作，把工作 rebase 成小的有序 commit，清理 diff，unslop 文字，然后返回 PR 链接。五个窄 PR 胜过一个胖 PR，stacked 跟进胜过一个不断长大的 branch。

## 用 Babysit 把 PR 推进到可合并

开着的 PR 会立刻开始积攒阻塞物：check 失败、reviewer 评论、主干前移。把这种 churn 交给 [Babysit playbook](../../skills/poteto-mode/playbooks/babysit.md)：

```text
/poteto-mode babysit 这个 pr。弄绿它。
```

Babysit 用自带的 watcher 盯 PR，按顺序处理阻塞物：先冲突，再 review 讨论串，再 CI。每一批已知修复攒成一次 push，让 check 只重启一次而不是每修一处重启一次。评论分诊是怀疑论的——人类和 bot 会把真正的抓捕和噪音塞进同一个列表。真发现得到修复，噪音被驳回并把反证贴在讨论串里。只想要状态时，问小一点，Babysit 会回答而不启动循环：

```text
/poteto-mode 看看 pr 123。还有什么没处理的吗？
```

Babysit 在 merge-ready 处停手。它永远不合并——即使全绿——因为合并是另一个决策。

## 用 Shipping 落地 stack

绿不等于安全。准备好落地时，明说：

```text
/poteto-mode land the stack。
```

[Shipping playbook](../../skills/poteto-mode/playbooks/shipping.md) 在武装任何东西之前独立验证每个 PR：每个 PR 配一个新 agent 当场证明行为，评判改动的人从来不是写它的人。然后 Shipping 只把自底向上连续已验证的部分落地，一次一个 PR，默认走 GitHub、其 CLI 可用时走 Origin，并报告第一个断链的 PR。压在未验证 PR 上面的已验证 PR 会等着——合并它会把缺口一起带进去。

下一页：[睡觉时让工作继续跑](./07-overnight.md)。
