---
name: reflect
description: 在活动 transcript 上 spawn 三个并行 review subagent，浮现可沉淀的教训，并把每条路由到对现有 skill 的具体编辑。用户说 reflect 时用。
disable-model-invocation: true
---

# Reflect

从当前对话里挖出可沉淀的教训，路由进 skill 编辑。

## 何时调用

用户说 "reflect" 或 "/reflect" 时调用。对话琐碎、跑题、或已被父级正确遵循的现有 skill 覆盖时跳过。一次性事件不算教训。

## 流程

### 1. 定位活动 transcript

父级在 fan out 之前先找到自己的 transcript 文件。系统提示里有当前工作区的 `agent-transcripts/` 目录，用那个路径。不要 glob `~/.cursor/projects/*/`——那会跨越工作区边界、读到无关项目的私密聊天。

```bash
ls -t <agent-transcripts>/*.jsonl <agent-transcripts>/*/*.jsonl <agent-transcripts>/*/subagents/*.jsonl 2>/dev/null | head -10
```

三种 transcript 布局：旧版扁平（`<id>.jsonl`）、现行嵌套（`<id>/<id>.jsonl`）、subagent（`<parent>/subagents/<child>.jsonl`）。

对每个候选，读第一行 JSONL，确认 `message.content[0].text` 包含对话的开头 user prompt。取匹配路径。如果没有路径可解析，写一份紧凑的会话摘要，改传那个。

### 2. 并行 spawn 三个 reviewer

一条消息、三个 `Task` 调用、`subagent_type: generalPurpose`、每个显式 `model:`、agent 模式（`readonly: false`）。reviewer 需要 MCP 访问来做上下文查证（transcript 里提到的 ticket、聊天 thread、可观测性 trace）。readonly 会剥掉 MCP。

| 透镜 | `model` | Prompt 模板 |
|---|---|---|
| Judgment | 你配置的 reflect-judgment 模型（默认 `claude-fable-5-1-thinking-max`） | `references/judgment-reviewer.md` |
| Tooling | 你配置的 reflect-tooling 模型（默认 `gpt-5.6-sol-max`） | `references/tooling-reviewer.md` |
| Divergent | 你配置的 reflect-judgment 模型（默认 `claude-fable-5-1-thinking-max`） | `references/divergent-reviewer.md` |

把每个模板原样传入，在标记处替换 transcript 路径或摘要。reviewer 在 `Task` 响应体里返回发现。

### 3. 综合

一次 `Task` 调用，`subagent_type: generalPurpose`，用你配置的 reflect-judgment 模型（默认 `claude-fable-5-1-thinking-max`），agent 模式（`readonly: false`）。synthesizer 的质量检查包含抽查引用，可能需要 MCP 访问——readonly 会剥掉 MCP。原样使用 `references/synthesizer.md`，在标记处内联每个 reviewer 的完整输出。synthesizer 返回结构化的 Accepted / Rejected / Backlog 清单。

### 4. 结构性强制检查

对 synthesizer 的 Accepted 清单做 sanity check。任何能用 lint 规则、脚本、metadata flag 或运行时检查更可靠地强制的条目，从 Accepted 移到 Backlog。见 **encode-lessons-in-structure** 原则 skill。

### 5. 应用

应用任何 Accepted 编辑之前，先把 synthesizer 的完整 Accepted/Rejected/Backlog 输出摆给用户并等明确批准。用户挑要应用哪个子集，也可以改路由。skill 改动影响组织里未来每个 agent。不要自动应用。

Backlog 条目自动归档到团队用的 devex / backlog 追踪工具。只有 Accepted 清单等批准。

对每个批准的 Accepted 条目，严格按 Routing 字段走：

- 琐碎的现有 skill 编辑（一行 bullet、收紧一句话、更正过时事实）：父级直接改。
- 实质的现有 skill 编辑（新节、新模式表、超过约 10 行）：交给 Cursor 内建 `create-skill` skill，跑它的 draft / test / iterate 循环。
- `tune description: <skill path>`（skill 存在但该触发时没触发）：交给 `create-skill`，跑它的 description 优化循环。
- `new skill via create-skill: <kebab-name>`：创建交给 `create-skill`。别临时发明形态。

如果你的环境带 SKILL.md 校验器，宣布完成前对每个碰过的 skill 跑一遍。没有就跳过这步。

### 6. 向用户汇报

短清单，不要开场白：

- 已应用的编辑：`<skill path>`。各一行说改了什么。
- 新建 skill：`<skill path>`。各一行（罕见）。
- 归档到 devex tracker 的 backlog：`<issue title>`（`<tags>`）。各一行。
- 丢弃：每条被否发现一行 + synthesizer 给的理由。
