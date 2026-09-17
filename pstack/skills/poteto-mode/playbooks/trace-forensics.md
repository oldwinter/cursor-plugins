### Trace forensics

**你拥有从产物得出的诊断。加载它、整形成可查询的形态、收窄到原因、归因到源码。**

区别于 **Runtime forensics**——那个给活进程装 instrument。这里捕获已完成。产物是固定数据集：读它，别重跑它。工具保持通用好让 playbook 可移植：cpuprofile 和 `.json.gz` 用 DevTools 或 trace 解析器，spindump 用文本编辑器，heapsnapshot 用你的堆工具。

1. 认出格式、用对的工具加载。大产物在 subagent 里解析（**principle-guard-the-context-window** skill），主线程只留浓缩后的发现。
2. 把原始产物整成可查询的形态。把 trace 或堆快照灌进 sqlite——每个 sample、frame 或节点一行。先达到可查询形态再开始读。
3. 收窄到原因。查占时间最多的 frame，沿调用树走到热路径。泄漏就沿泄漏对象的 retainer 链走到 GC root。spindump 就找卡在 CPU 上或阻塞的线程及其等待原因。
4. 归因到源码。经产物自带的符号把热 frame 映射到文件、符号、行。没有源码映射的 frame 还算不上诊断——解析符号，或明说产物没带符号。
5. 有成对捕获就对照确认。diff 前后两份产物。没有就把发现标为"产物能支持的最强假设"，不是已确认原因。
6. 交回带引用的诊断，没被要就不修。原因明确后路由到 Bug fix 或 Perf issue。throughput checkpoint 保持一行：`throughput checkpoint: n/a, read-only forensics`。

**回复：** 产物和格式、浓缩后的发现、源码位置、产物路径、以及是否有成对捕获确认了它。
