### Runtime forensics

**你拥有诊断。给活进程装 instrument，别从源码空想。** 交付物是带引用的诊断，不是修复。

1. 在匹配的 surface 上经 control skill 抓活信号：空转进程抓 CPU profile、泄漏抓堆快照、视觉 glitch 抓 CDP trace。要真产物，不是猜。
2. 把产物缩到冒烟的枪：热路径上的函数、从泄漏对象到 GC root 的 retainer 链、无输入空转的循环。大产物在 subagent 里解析（**guard-the-context-window** 原则 skill），主线程只留浓缩后的发现。
3. 信机制之前先证明它。通过 CDP eval 往运行中的进程注入 instrument，或不重载地热改活代码，廉价地确认假设。
4. 把发现映射回源码：文件、符号、做分配或做调度那一行。
5. throughput checkpoint 保持一行：`throughput checkpoint: n/a, read-only forensics`。

**回复：** 抓到的信号、浓缩后的发现、怎么证明的机制、源码位置、产物路径。没被要就不修。原因明确后交回 Bug fix 或 Perf。
