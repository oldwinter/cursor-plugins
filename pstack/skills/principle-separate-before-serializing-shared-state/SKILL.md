---
name: principle-separate-before-serializing-shared-state
description: "当并发 actor 可能写同一个文件、branch、key 或状态对象时应用。先消除共享；只有当“单一写者”是真正的不变量时，才做结构化串行化。"
disable-model-invocation: true
---

# Separate Before Serializing Shared State（先分离，再谈串行化共享状态）

当并发 actor 可能共享可变状态时，先问它们是否需要同一个可变对象。不需要，就消除共享。共享确实存在时，用结构强制串行化：lockfile、顺序阶段、排他 ownership。指令和约定不是并发控制。

**为什么：** 对共享状态的并发写会造成间歇出现、难以复现、调试昂贵的 race condition。

**模式：**
1. **识别共享的可变状态**（双方都读写的文件、双方都 push 的 branch、一方定义另一方消费的 API）。
2. **默认：消除共享的写入目标。** 问：这些 actor 需要一个 canonical 对象，还是在各自发布独立的事实？给每个 actor 自己的文件、key、branch 或状态目录，只在读取/汇报边界合并。两个 worker 往同一个 `state.json` 里各写各的 `lastX` 字段仍然是共享 mutation；`indexer-state.json` + `metrics-state.json` 就不是。
3. **只有当"单一共享写入目标"是真正的不变量时，才结构化串行化访问**（lockfile、顺序阶段、单写者 actor、原子 compare-and-swap）。把"我们需要一把锁"当作要检查的设计异味，而不是默认答案。
