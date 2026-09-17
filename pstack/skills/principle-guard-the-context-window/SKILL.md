---
name: principle-guard-the-context-window
description: "当 context 即将填满时应用：大输出、长文件、反复读取、fan-out 规划。把批量内容路由给 subagent；主线程只留摘要，不要原始负载。"
disable-model-invocation: true
---

# Guard the Context Window（守护上下文窗口）

context window 是有限的，且在会话内不可再生。每个 token 都要值回成本。

**为什么：** context 溢出会降低推理质量、产生压缩伪影、并让进度停摆。

**模式：**
- **隔离大负载。** 把冗长输出、截图和大文档路由给 subagent。主 context 只拿摘要，不拿原始数据。
- **不读用不到的东西。** 按相关性选择性阅读。当前任务不需要的文件就跳过。
- **高频内容内联。** 每次调用都要用的模板和引用属于 skill 文件本体，而不是每次都要花一次读取的独立文件。
- **给阶段定尺寸、给范围设上限。** 限制每阶段文件数，设定轮次预算，把机制成本算进去。
