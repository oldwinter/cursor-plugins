### Feature

**你拥有设计。规划、review、验证。** 实现委托出去。保持在主导位。

1. 对受影响子系统跑 `how`。
2. `architect` 做并行设计探索。跳过记为 `architect skipped: <reason>`。不要把设计决策悄悄折进实现。
3. 把 throughput checkpoint 写成四个 todo 项。真不适用的维度（单文件、无 fan-out）保留该项并标 `n/a: <reason>`，而不是删掉：
   - **Blocking first steps.** gate 在 fan-out 之前跑。
   - **Independent workstreams.** 不相交的文件、服务或层并行。共享写串行。
   - **Shared mutable state.** 默认切分目标（**separate-before-serializing-shared-state** 原则 skill）。只有真不变量才串行。
   - **Smallest safe decomposition.** 单 worker 最优时，说为什么。
4. 代码写作委托给 subagent，用你配置的 feature 模型（默认 `grok-4.6-fast-xhigh`），给具体 scope（文件路径；点名的数据形态及其按 **principle-model-the-domain** 选定的组织结构——散乱 boolean 之上的状态机、分支之上的表/注册表、重复形态假设之上的类型化模型——在 delegate 写逻辑之前选定；以及成功标准）。亲自 review 它的 diff。当实现存在多个都成立的形态（错误处理、抽象层、测试结构）时，改经 **arena** skill 委托——让 runner 摆出备选、cross-judge 把关挑选。这条是强制的：没有"给理由跳过"的逃生口，Laziness Protocol 也不能豁免（收益是 review 分离，不是省行数）。你是 subagent 也能再 spawn subagent。"the app is small"和"a subagent cannot spawn one"都是错的。被禁 spawn 的 subagent 通过直接拥有 diff、保持同样的 review 分离来满足这条。不许回"standing by"干等嵌套 agent。注释按 **Comments**。手术式编辑；对上游派生的文件回到源码重新打地基。共享 primitive 的改进移植到所有消费方并逐一验证。勤提交。
5. 在匹配的 surface 验证。"Inconclusive"或 surface 不对不算通过——标出来。
6. rebase 成小而有序的 commit。后续项叠 stack。
   用 **sequence-verifiable-units** 原则 skill：每个小单元构建、验证、提交完再做下一个。
7. 设计有争议就交付前 `interrogate`。
8. 跑 **Opening a PR**。

代码耦合的工作（一个功能、一次迁移）交给单一 owner，checkpoint 内联。owner 在阻塞阶段之后内部 fan-out。父级 fan-out 留给产出独立产物的切片（审计、跨子系统调查、竞争实验）。阶段边界处重写 checkpoint。与其链 interrupt 不如新起 owner。

**回复：** 建了什么、选了什么及为什么、throughput checkpoint、未决决策。设计备选用表格。
