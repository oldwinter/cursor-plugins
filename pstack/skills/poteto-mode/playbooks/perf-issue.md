### Perf issue

**你拥有测量叙事。规划、review、核实数字。** 每个修复都拴到一次测量上——别用读源码代替测量。

1. 经对应 control skill 抓一条基线 trace。
2. `how` 给假设打地基。没跑过别宣称性能天花板。
   多数修复出自八个策略族。把它们当假设生成器，不是清单。只有 trace 显出该族点名的信号时才值得一试。
   - **Elimination.** 优化热路径之前先问它需不需要存在：没人消费的计算、对这个用户永远关着的 feature gate、冗余镜像状态的同步、留着"just in case"的遗留路径。trace 告诉你什么慢，永远告诉不了你什么可删——所以这族要 `how` 那一趟，不是 profiler。
   - **Divide and conquer.** 主要成本随输入规模涨。把工作切开让每份碰得更少（分块、分片、剪搜索空间），或让独立分片并行跑。
   - **Caching.** 相同输入上重复同样的计算或拉取。存下结果复用。宣称收益之前先点名什么会让它失效。
   - **Indirection.** 热路径上贵的活可以被更便宜的中间层吸收：索引代替扫描、队列把工作挪下交互线程、句柄让更便宜的实现换进来。只有这一跳从关键路径上削掉的比它加的多时才加。
   - **Batching.** 许多小操作各付一份固定开销（RPC、查询、syscall、draw call）。合并成每批付一次。
   - **Redundancy.** 等待挂在单个慢实例或尝试上。复制工作（副本、hedged 请求、投机执行），取最快的结果。trace 得显示等待占主导、且系统有余量。
   - **Lazy evaluation.** 成本落在从没被用或还不需要的结果上（启动路径上的急切初始化、渲染屏外项）。把工作推迟到首次使用。
   - **Scheduling.** 活必须干，但不必赶在交互当口。挪到没人等的地方：idle 回调、启动后的后台预热、用户到达前的预计算、帧提交后的清理。收益是感知延迟，所以测交互路径，不是总工作量。
3. 从 trace 规划修复。跨函数边界就先 `architect`。实现委托给 subagent，用你配置的 perf-issue 模型（默认 `grok-4.6-fast-xhigh`）。review diff。抓一条修复后 trace。
   应用 **sequence-verifiable-units** 原则 skill：每次尝试验证过再试下一个。
4. 解析并比较产物（JSON 导 sqlite、diff）。"Inconclusive"或 surface 不对不算通过——标出来。
5. 在 PR 里引用测量。
6. 跑 **Opening a PR**。

要针对指标做持续改进而非一次性修复，用 Hillclimb playbook（`playbooks/hillclimb.md`）。

**回复：** 基线数字、修复后数字、差值、产物路径。
