### Visual parity

**你拥有像素级等价。基线就是 spec。你不碰它。** 等价由图像 diff 验证，不靠肉眼。

1. 任何迁移之前先建基线：一个视觉回归 harness，对当前组件的各状态截图；对齐两个实现时目标侧也要。没有基线就没有 parity 声明。这是阻塞性前置，不是后续项。
2. 反捷径条款，声明并守住：不改 harness、不动基线、不为让 diff 通过而重构组件。基线看着不对就停下问，别编辑它。
3. 一次迁一个组件。跨 worktree 并行，一个组件一个 owner（**separate-before-serializing-shared-state** 原则 skill）。共享 primitive 作为阻塞阶段先迁。
4. 每个组件经 control skill 在匹配 surface 上对照基线做图像 diff。非零 diff 就是 fail。查像素差。每个组件 `/loop` 到 diff 为零。
5. 每个组件或每个安全批次跑一次 **Opening a PR**。

**回复：** 迁了哪些组件、各自的 diff 结果、基线 harness 位置、还剩什么。
