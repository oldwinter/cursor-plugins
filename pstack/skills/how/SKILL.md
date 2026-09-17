---
name: how
description: "用于“X 是怎么工作的”、改动前的代码走读，以及 placement / ownership / layering 问题（“这东西该放哪”、“哪个 package 拥有它”、“这层对吗”）。解释子系统架构、运行时流程、上手心智模型。动机类问题用 why。"
disable-model-invocation: true
---

# How

探索代码库，回答"X 是怎么工作的？"类问题。产出资深工程师带你上手一个子系统那种深度的架构讲解：足以建立可工作的心智模型，又不至于读成带注释的源码。

## Step 1. 评估复杂度

范围含糊时，说出你的理解然后探索。用户可以纠偏。

- **简单**（单个模块、小工具、"函数 X 怎么工作"这类窄问题）：不用 explorer。一个 explainer 一遍完成探索和讲解。转 Step 2b。
- **复杂**（跨多个文件或服务的子系统、横切功能、完整架构概览）：先并行 spawn explorer，再交给 explainer。转 Step 2a。

拿不准就走简单路径。

## Step 2a. 探索（仅复杂问题）

把问题拆成 2 到 4 个探索角度，每个是子系统的一个不同切片。在一条消息里 spawn 所有 explorer：

- `subagent_type`：`generalPurpose`
- `model`：你配置的 how-explorer 模型（默认 `grok-4.6-fast-xhigh`）
- `readonly`：`true`

每个 explorer 拿到 `references/explorer-prompt.md` 里的 prompt，填入它自己的角度。然后转 Step 3。

## Step 2b. 直接讲解（简单问题）

spawn 一个 Task subagent，一遍完成探索和讲解：

- `subagent_type`：`generalPurpose`
- `model`：你配置的 how-explainer 模型（默认 `claude-fable-5-1-thinking-max`）
- `readonly`：`true`

从 `references/explainer-prompt.md` 构造它的 prompt，不带 explorer-findings 一节。转 Step 4。

## Step 3. 综合（仅复杂问题）

所有 explorer 返回后，spawn 一个 Task subagent 把它们的发现综合成一份讲解：

- `subagent_type`：`generalPurpose`
- `model`：你配置的 how-explainer 模型（默认 `claude-fable-5-1-thinking-max`）
- `readonly`：`true`

从 `references/explainer-prompt.md` 构造它的 prompt，填入每个 explorer 的发现。

## Step 4. 呈现

把 explainer 的输出呈现给用户。为了清晰或结合对话上下文做轻度编辑可以。不要大幅改写。

## 输出格式

讲解使用 `references/explainer-prompt.md` 定义的小节，删掉不适用的：Overview、Key Concepts、How It Works、Where Things Live、Gotchas。
