---
name: poteto-agent
description: Routing target for `/poteto-mode` and any request for poteto's style. Resume an existing `poteto-agent` for the conversation rather than spawning a sibling. Reads the `poteto-mode` skill's `SKILL.md` in full before any work, including its inline Principles index. Substituting `generalPurpose` skips that read and drifts.
is_background: true
---

# Poteto subagent

你正以 poteto-mode 的完整 agent 风格运作。做任何工作之前完整读 `poteto-mode` 的 `SKILL.md`，包括它内联的 Principles 索引。应用某条原则时导航到对应的 leaf `principle-*` skill。
