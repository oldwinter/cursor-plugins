### Hillclimb

**你拥有指标和实验的完整性。监督、review。尝试委托出去。** 用于对一个可测量的东西对着目标做持续迭代改进。一次性修复去 Bug fix 或 Perf issue。这里是循环。

核心纪律：一次改动、一次测量、留或退。绝不叠未测的改动，绝不靠读代码宣称胜利（**prove-it-works** 原则 skill）。

1. 选指标之前先给工作负载和架构打地基。对目标跑 **how** skill，点名能移动结果的真实负载维度（数据大小、历史、状态、并发），选一个能复现用户抱怨的用例。没有能复现的用例就先修复现，而不是 hillclimb。然后定死一个指标、"更好"的方向、和一个可检查的停止谓词——把目标和尝试次数下限配对，让早期侥幸的胜利终止不了 run（"at least 50% better than baseline and at least 10 iterations"这个例子就是这种形态）。用户给了数字就用他的，否则跟他商定。
2. 建测量 harness，证明其灵敏度，然后冻结（**build-the-lever** 原则 skill）。跑对比鲜明的真实负载，确认目标用例复现症状、更简单的用例如预期区分开。harness 分不开就修负载或指标。冻结后，一条可重复命令输出指标，采样要够穿过噪音（N 次取中位数，不是单次）。任何改动之前记下基线指标和回归 gate（必须保持通过的测试）的一次绿跑。
3. 经 **show-me-your-work** skill 开决策日志。一个 `decision.tsv`，每次尝试一行：id、hypothesis、change、before、after、delta、tests、verdict（kept 或 reverted）、note。每次尝试前读它。放在树外（gitignore）。
4. 每个假设都要长在步骤 1 的架构模型上——点出一个具体机制（"defer X off the boot path because it blocks first paint"），不是"try memoizing something"。
5. 循环，每轮一个假设：
   - 把改动交给 subagent，用你配置的 hillclimb 模型（默认 `grok-4.6-fast-xhigh`），scope 收紧。监督并 review diff，而不是自己敲（**guard-the-context-window** 原则 skill）。几个独立假设同时在场时，fan 到并行 subagent，各自独立 worktree（**separate-before-serializing-shared-state** 原则 skill）。
   - 用冻结的 harness 测前后，跑回归 gate。
   - 指标动过噪音*且* gate 保持绿才接受。否则完整 revert 该改动。"might help"的微调不留。
   - 每个被接受的修复一个 commit，只暂存你改的文件（`git add <files>`，绝不 `-A`）。无论留还是退都记一行。
   每轮迭代以一次检查收尾再开下一轮（**sequence-verifiable-units** 原则 skill）。run 无人值守时，只从 Autonomous run playbook（`playbooks/autonomous-run.md`）借唤醒机制，不借它的停止规则。
6. 冲过第一个平台期。卡住、连续多次否决时，换策略族、组合差点成功的项、重读源码、或试更激进的，再下"山爬完了"的结论。正确性和简单性排在数字前面。破坏行为的胜利 revert；守得住数字的简化保留（**laziness-protocol** 原则 skill）。
7. 谓词满足时停；或剩下的想法都边际化、不值其成本时停。别放宽谓词去凑它，还有便宜未试的假设时别收手。卡住了就摆出来，别空转。
8. 跑 **Opening a PR**，被接受的 commit 按落地顺序叠放。

**回复：** 指标和目标、基线到终值及百分比差、跑了几轮（留 vs 退）、每个被接受的修复一行、`decision.tsv` 路径、以及再逼一步你会试的最好的想法。
