---
name: figure-it-out
description: "当没有更窄的 playbook 适用时，设计一套可审计的 playbook：大型迁移、多部分的雄心改动、或人类离开后才会 review 的工作。让严谨度随任务伸缩，跑假设循环，并用 show-me-your-work 记录决策。用于 /figure-it-out、'figure it out'、大型迁移，或没有更窄 playbook 适用时。"
disable-model-invocation: true
---

# Figure it out

当任务匹配不上任何 playbook 时，设计一个。写代码之前要交付的东西是工作流本身：一串让严谨度随任务伸缩的阶段，跑科学方法，留下一条人类离开后能审计的决策轨迹。偏向更严谨。做错东西的代价远大于小心的代价。

## 开始

开一个 todolist，第一项是读 **poteto-mode** skill 的 Principles 一节。然后把下面的阶段加为 todo。

## Phase A：Frame

先 grounding，再承诺。说清下面三件事之前不要开跑：

- done 的定义，写成可证伪的谓词（见 **prove-it-works** 原则 skill）。
- 量化的 scope：粗略的单元数和工作量，加上 grounding 浮出的阻塞物。
- 严谨度级别，往高偏。单向门和高 blast radius 拿更多，可逆低风险步骤拿更少。严谨是闸门和制品，不是"更努力"。

承诺一次长跑之前，先呈现框架和取舍。可逆工作直接推进（见 **never-block-on-the-human** 原则 skill），但一次数小时的运行配得上一个 checkpoint。

## Phase B：设计工作流

拆成原子的、可独立落地的单元。最危险未知的排最前。scaffold 和验证先于 feature（见 **foundational-thinking** 原则 skill）。

- 在工作之前先建验证 harness，baseline 从改动前状态捕获，让检查读起来是"旧值 vs 新值"。
- 单向门设计决策跑 **architect** skill（它会跑 **arena**）。形态已经具体的机械工作跳过它。对已定型的设计再来一轮 arena 是过度工程（见 **laziness-protocol** 原则 skill）。
- 决定什么 fan out。只沿接缝并行，给每个 worker 自己的 worktree 或 branch（见 **separate-before-serializing-shared-state** 原则 skill）。别过度 fan-out。
- 把设计好的阶段清单写下来。这个清单就是人类要 review 的东西。

然后执行设计。把它的步骤作为具体条目加进 todolist，放在 Phase C 条目之后、Phase D 之前。每一步都在 Phase C 循环纪律下运行，并把 Phase D 的日志织进去——每步落地记一行，而不是把整条轨迹攒到最后。

## Phase C：跑循环

每个单元是一次实验。陈述假设、做最小改动、在真实制品上对照谓词测量，有进展就保留，没进展就 revert。
应用 **sequence-verifiable-units** 原则 skill：每个单元先验证再开始下一个，而不是把检查攒到最后。

- 通过检查制品来验证，永远不是自我汇报。某物过得太顺时，先怀疑观察方法，再怀疑系统。
- 委托出去的工作配一个 judge，信任之前自己审计 delegate 的制品。worker 钻闸门空子就重置并加硬契约；闸门本身错了就在独立改动里修闸门，别绕。
- 裁决是 VERIFIED、NOT VERIFIED 或 INCONCLUSIVE。inconclusive 不算通过。别藏阴性结果。

## Phase D：保持审计轨迹

用 **show-me-your-work** skill 记录这次运行：一份 canonical TSV，每个决策、每个单元一行，证据用链接。figure-it-out 的工作通常重大到值得把轨迹 commit 进 PR 让审查者读。需要展示信心时就 commit。优先用已 commit 脚本产生的证据。轨迹加 diff，是让人类能回来并信任这项工作的东西。

## Phase E：验证并交回

把整体对照 Phase A 的谓词在真实产品上检查，不只是 harness。把反复出现的纠正编码成闸门、lint 规则、检查或脚本（见 **encode-lessons-in-structure** 原则 skill）。

**回复：** 你设计的 playbook、严谨度级别及理由、决策轨迹路径、对谓词已验证的内容、以及仍未决的。
