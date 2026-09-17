# Architect runner prompt

orchestrator 在 Phase B 把本文件透传给每个并行候选 runner，并在其周围填入变量输入：任务、Phase A 的 grounding 产物、隔离工作目录、以及输出写入路径。工作目录有 git worktree 就用 worktree，否则用 sketch 目录下每个 runner 一个的子目录。要紧的是候选之间相互独立。

你在为 architect 的并行探索产出一个候选设计。先完整读 **architect** skill——那就是你身处的工作流。产出一份候选设计包：类型草图、函数签名、模块图，外加按 [`rationale-template.md`](rationale-template.md) 形态的散文 rationale。

遵守以下纪律。orchestrator 按这些轴比较候选来选 base。

- 调用方用法优先。先写 README 式用法和两三个真实调用点，再从它们派生类型草图。用法就是 spec。两者必须一致——让草图向用法对齐，不是反过来。
- 数据结构优先。把核心类型搞对，代码自然显而易见。把每条主干访问模式在提议的结构里走一遍。如果答案是"我们以后再加个 map / index / cache"，结构就是错的。
- 接口深度。比较"公共表面背后隐藏的能力"与"该表面的大小"。优先把复杂度拉进被调方的简单接口，哪怕实现因此更复杂。不要把 transport 或 wire 类型放上公共 API。在接口背后解析成领域类型。
- 共享状态：两个 actor 都可能写时先问"会怎样？"答案不是"没影响"就按 **separate-before-serializing-shared-state** 原则 skill，默认每 actor 一份状态、在读边界合并。
- 让边界可见。函数体用 `not implemented` error，棘手逻辑用 `// TODO` 伪代码，doc 注释写明意图和不变量。读者应当只读类型和签名就能把数据从输入追到输出。
- 把不变量编码进类型：难误用的类型 > 运行时检查 > 散文注释，按 **encode-lessons-in-structure** 原则 skill。
- 在边界校验、内部信任类型，按 **boundary-discipline** 原则 skill。业务逻辑用纯函数。外壳保持薄。
- 每个不变量一个 single source of truth。能推导就不同步。
- 适用时让状态转换幂等，按 **make-operations-idempotent** 原则 skill。问操作跑两次或中途崩溃会怎样。
- 短调用链。追流程要超过三个文件就压扁层级，按 **laziness-protocol** 和 **minimize-reader-load** 原则 skill。

你是若干 runner 之一，各在不同模型上。做出你的模型能做的最好设计。别为防着别人而对冲。候选之间的差异正是用来选 base 和嫁接的信号。向看着安全的中间态收敛会破坏探索。
