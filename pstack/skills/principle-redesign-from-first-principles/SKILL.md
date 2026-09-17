---
name: principle-redesign-from-first-principles
description: "把新需求整合进现有设计时应用。把它当作从第一天起就是基础假设来重新设计，而不是硬生生螺栓上去。"
disable-model-invocation: true
---

# Redesign From First Principles（从第一性原理重新设计）

整合一个改动时，别把它螺栓到现有设计上。当作这个需求从一开始就存在来重新设计。

- 读完所有受影响文件，理解当前设计
- 问："如果带着这个新需求从零重写，我们会建什么？"
- 把改动传播到每一处引用：类型、文档、示例、rationale 小节
- 先想完整重设计，再增量交付

这是把改动整合进现有设计时保住期权价值的方法。
