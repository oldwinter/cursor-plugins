---
name: interrogate
description: "用于 “interrogate”、“adversarial review”、“multi-model review”、“challenge this”、“stress test this code”、“find blind spots” 或 “tear this apart”。多个 LLM reviewer 从独立角度挑战改动。"
disable-model-invocation: true
---

# Interrogate

每个配置的模型 spawn 一个 reviewer，对代码改动做对抗式 review。每个模型拿到相同的 prompt 和 rubric。对抗信号来自模型多样性，不是指定人设。

交付物是一份综合判定。不要自动应用改动。

## 步骤 1，定 scope

从上下文确定要 review 什么：

- 用户指向具体文件或 diff，就用它
- 在 feature branch 上就跑 `git diff main...HEAD`（或合适的 base branch）拿全量变更集
- 用户消息提到最近的工作，就收集相关文件

把 diff（或文件内容）连同 reviewer 理解代码所需的周边上下文文件打包。

## 步骤 2，声明意图

spawn reviewer 之前先显式声明意图。从以下来源推导：

- 用户的消息
- commit message
- PR description（如果有）
- 代码本身

写清楚的一段。意图拿不准就先问用户再继续。

## 步骤 3，spawn reviewer

用 Task 工具在一条消息里启动全部 reviewer。有 `~/.cursor/rules/pstack-models.mdc` 时用其中的 `interrogate reviewers` 列表，每个条目一个 reviewer，把下面的 Reviewer A/B/C/D 标签扩缩到配置的条目数。否则用表里的默认值。

| Subagent | 默认模型 |
|----------|---------------|
| Reviewer A | `claude-fable-5-1-thinking-max` |
| Reviewer B | `gpt-5.6-sol-max` |
| Reviewer C | `grok-4.6-fast-xhigh` |
| Reviewer D | `claude-opus-5-thinking-xhigh` |

每个 reviewer：
- `subagent_type`: `generalPurpose`
- `model`：配置的 `interrogate reviewers` 条目；没有配置行时用表里的默认值
- `readonly`: `true`

如果 spawn 时模型 slug 被拒为不可解析，看 Task 工具报错里的有效 slug，挑最接近的等价项（优先同族里最高推理档位），用有效 slug spawn，并另开 PR 更新配置值或默认表。不要因 slug 问题阻塞 review。配置值是 `inherit-parent` 或 `auto` 时，改为省略 `model`。绝不要把这些别名当成坏 slug 或进入上面的回退。

读 `references/reviewer-prompt.md`，往模板里填：
1. 声明的意图
2. diff 或文件内容
3. `references/rubric.md` 的 review rubric
4. `references/code-quality-review.md` 的代码质量透镜

填好的同一份模板发给所有 reviewer，每个模型都套代码质量透镜。

## 步骤 4，综合

结果回来时拼出统一图景：

1. **解析所有发现**
2. **识别共识**。2+ 个模型独立提出的发现是最高信号。
3. **识别单模型发现**。仍值得读，但按此加权。
4. **去重**。不同模型可能用不同说法描述同一问题。合并并记下是哪些模型提的。
5. **记下分歧**。一个模型标了某点、另一个明确说相反，这对判定是有用上下文。

## 步骤 5，主审判断

你是主审 reviewer，一个务实的资深工程师，不是中立的聚合器。

完整框架见 `references/lead-judgment.md`。

把每条发现归入这些桶：

- **Act on**。鉴于实际目标，影响正确性、安全性或可维护性的真问题。会挡住真 PR 的那种。
- **Consider**。合理的点，但你不确定现在处理它们的收益盖过成本。值得用户注意。
- **Noted**。技术上成立但不可行动。依赖上下文、过早优化、或现阶段影响低。
- **Dismissed**。错的、吹毛求疵的、或缺上下文的。附一行理由。

每条发现包括：
- 哪个（些）模型提出的
- 分类（act on / consider / noted / dismissed）
- 分类的一行理由

## 输出格式

用这个结构呈现判定：

### Intent
> [步骤 2 的意图段落]

### Reviewers
- Reviewer [label]: [model name], [N findings]（每个 reviewer 一条 bullet）

### Act On
[应当处理的发现。每条：描述、哪些模型提出、为什么要紧。]

### Consider
[值得想的发现。每条：描述、哪些模型提出、涉及的取舍。]

### Noted
[成立但低优先。简短列表。]

### Dismissed
[被否的发现，附简短理由。]

### Agreement Map
[模型在哪些点一致、哪些点分歧，这个一致/分歧的模式说明什么？]
