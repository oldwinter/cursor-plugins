---
name: architect
description: "写代码之前先勾类型、签名和模块结构，然后在实现填充时保持在环。用于 /architect、'architect this'、'design this'，或直接写代码会锁死错误形态的非平凡工作。"
disable-model-invocation: true
---

# Architect

先设计再实现。用 `not implemented` 函数体和伪代码勾出类型、函数签名、类形态和模块边界。跨多个模型视角综合，然后对照选定的草图填代码。如果实现证明草图错了，扔掉它重新设计。

## 开始

开始之前开一个每阶段一条的 todolist。

1. Ground
2. Sketch
3. Agree
4. Implement
5. Scrap

## Phase A：为问题打地基

对每个新代码会触及的系统建立真实心智模型。对相关子系统跑 **how** skill。

指个文件名不算 grounding。产出 `how` 规定的 trace 模型。如果设计重定义 ownership 或分层，再对现有形态跑 **why** skill，让理由变成约束而不是猜测。

只有当工作是真 greenfield、没有周边系统要整合时才跳过 Phase A。

## Phase B：Sketch

带着设计草图任务和 Phase A 的 grounding 产物跑 **arena** skill。把 `references/runner-prompt.md` 作为每个 runner 的 prompt 传入。每个候选按 `references/rationale-template.md` 的形态产出一份设计包。

用你配置的 architect runner（默认 `claude-fable-5-1-thinking-max`、`gpt-5.6-sol-max`、`grok-4.6-fast-xhigh`、`claude-opus-5-thinking-xhigh`）。

设计两遍。综合之前要求至少两个结构上不同的候选，即使第一个看着够用。这是 **exhaust-the-design-space** 原则 skill 的具体化：要的是整体形态上的替代方案，不是同一形态里的点状修补。

综合之前拿 [`references/design-red-flags.md`](references/design-red-flags.md) 筛每个候选。拒绝或修订浅模块、信息泄漏、按时间顺序切分、透传方法。

在可行候选之间按接口深度比较。优先那把更多复杂度藏在更小更简公共表面后的设计。富接口可以通过集中能力而非散到各层来保持调用链短。

arena 返回一个综合设计包。综合决策填进 rationale 的 "Synthesis decision" 一节。

## Phase C：Agree（可选）

默认：带着综合设计直接进实现。无人类 checkpoint。

当调用方明确要求时才启用 checkpoint："/architect with checkpoint"、"stop and show me before implementing" 之类。此时摆出综合设计并暂停等签字。

无论哪种，synthesis 都可以作为独立 commit 交付——即 **foundational-thinking** 原则 skill 的"scaffold first"模式。填充期间有计划、有范围的破坏没问题，按 **outcome-oriented-execution** 原则 skill。实现之前想对设计施加对抗压力，对综合草图跑 **interrogate** skill。

如果人类对形态有异议（checkpoint 上或事后），当作 Phase A 证据：重新 ground，重跑 Phase B，再写代码。

## Phase D：对照草图实现

把 `not implemented` 函数体换成代码，把伪代码换成逻辑。综合草图就是契约。

对草图的偏差是值得摆出来的信号，不是要默默吸收的摩擦。某个函数需要草图没预见的参数时，问：是草图错了、需求漏了、还是实现越界了。

## Phase E：架构错了就推翻

如果实现持续产生草图吸收不了的摩擦，扔掉草图。别往错误设计上螺栓修补——按 **redesign-from-first-principles** 和 **fix-root-causes** 原则 skill。

信号是*模式*，不是单个实例。征兆：

- 同一形态的 workaround 在互不相关的代码里反复出现。
- 多个互不相关的边角案例都需要特例分支。
- 类型需要逃生舱（`any`、cast、实际永远被赋值的 optional 字段）才能编译。
- 草图说状态没共享，却冒出"我们需要一把锁"的反射。
- 调用方必须懂抽象的内部规则才用得动它。
- 实现中出现两个以上同形态的独立 Phase D 偏差。

用判断力。几个边角案例不至于判架构死刑，有些问题本来就复杂。数据里的复杂度不是设计里的复杂度。

推翻时：

1. 对已建的东西重跑 **how** skill。
2. 按 redesign-from-first-principles，把新约束当作第一天就有的假设重新设计。
3. 按 **subtract-before-you-add** 原则 skill 先减后加。新草图在长个儿之前应当比旧的小。
4. 回 Phase B 重跑 arena。

## 产出

先写调用方的用法，类型草图从它派生。小改动产出一个含新类型和签名的文件；大工作产出模块图加类型定义。rationale 随附，形态按 `references/rationale-template.md`，包含用法草图和综合决策。
