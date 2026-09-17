### Orchestrate

**你拥有工程，永远不拥有代码。写 brief、排空队列、保前沿绿、做决定。** 用于把整个项目交给一个常设 coordinator 聊天：多天、许多叠起的 PR、几十到几百个 subagent、人类每天看两次而不是每五分钟。一个被开到谓词的任务是 Autonomous run。一次需要定制工作流的雄心 run 是 figure-it-out。当工作活得比任何单个 agent 久时路由到这里。一个 agent 能在会话预算内完成的工作不算工程。

仪式感随工程规模伸缩。廉价、近乎相同的单元上，按各节指示收掉仪式。

三条规则承载其余：

- 完成是队列事件，不是中断。
- 每次 spawn 和每次 resume 都逐字携带 standing orders。
- brief 就是产品。含糊的 brief 静默失败——worker 没法问你问题。

#### 角色与摆放

- **Coordinator（本聊天）。** 本地。框定、写 brief、排 inbox、拥有人类报告、做判断调用。它从不写或改代码。冲突合并、restack 和代码改动永远是任务。机械地落地已验证单元（把 worker 的 commit fast-forward 或干净 cherry-pick 再推送）是本地 git 便宜的仓库上 coordinator 可以自己做的簿记。把已完成工作排在闲着的 stacker 后面，是死线颗粒无收的做法。循环端到端是 agentic 的。agent 只经 Task 工具 spawn、resume、排空。状态读写经 `scripts/orch/orch.ts` 在 drain 点进行——一进一命令、一出一条线。CLI 从不 spawn、等待或唤醒任何东西。
- **Sub-coordinator。** 永远本地、持久、每条 track 一个，且只在工程超出一个 coordinator 的 drain 能力时才设。coordinator 自己排得动的 track 不需要中间层。每嵌套一层都要重付一遍完整的定向开场白，而阻塞式 sub-coordinator 会在父级空转时藏住它的孩子。拥有其 track 的单元和看板，写其 worker 的 brief，spawn 自己的 worker 和 verifier（嵌套到第 3 层可用，嵌套 spawn 有完整 Task schema 含 `environment`）。在 wave 边界向上汇总聚合。绝不透传原始子报告。在途孩子封顶在一次 drain 处理得过来的量——大约十个——滚动窗口。绝不做阻塞批次——那要付每批最慢孩子的代价。
- **Worker / verifier。** 永远 `environment: "cloud"`，除非任务需要这台机器：`control-ui` 或 `control-cli` 运行时验证（来自 `cursor-team-kit`）、读 `agent-transcripts/` 下的本地 transcript、模拟器和本地 IDE 状态、只在这里存在的 auth。cloud agent 读不了本地 store，所以它们的 brief 要么内联所需内容、要么指仓库路径。优先更少、更宽的 worker。每个 worktree 或 branch 一个写者（principle-separate-before-serializing-shared-state）。单元的 verifier 跑在与 worker 不同的模型族上。

层级就三层：coordinator、track、worker。track 分解按项目写（build、landing、verification 是常见切法，不是必须形态）。硬编码的 swarm 树试过，太僵，弃了。

#### Store 布局

在当前 agent 的 store 里建 `orchestrate/<project-slug>/`（路径在系统提示里）。每个文件恰好一个写者。owner 发布事实，读者读时聚合。簿记用 `bun scripts/orch/orch.ts`，下文写作 `orch`；它的规范 TSV 和 JSON 没 CLI 也能读。

- `preferences.md` 是 standing-orders 登记表：编号行，每行一条约束（模型策略、stack 形态与数量、验证门槛、禁碰路径、升级策略）。逐字贴进每次 spawn 和每次 resume。指令在 resume 间会衰减，每丢一条花一个人类回合。发现自己在重述某条指令时，先追加成行再行动（principle-encode-lessons-in-structure）。
- `overview.md` 是持久的 PR 和 issue 库。追加。绝不按事件整体重写。
- `units.tsv` 每单元一行：id、track、state、branch、PR、head SHA、brief 路径。就地更新行。
- `frontier.json` 是算出来的合并前沿，按 Stack safety。
- `ledger.tsv` 是验证台账，按 Verification。
- `inbox/` 放完成指针。`gates.md` 停人类 gate（问题、选项、不答时的默认）。
- `decisions.tsv` 是经 show-me-your-work skill 的轨迹。
- `status.md` 每次 drain 时从 `units.tsv` 和 `ledger.tsv` 派生，绝不手工维护。从表重新生成，别把事件叙述进去。

#### Brief

你给 agent 的 prompt 是你唯一的产品，草率的 brief 会复利成整棵树的 slop。每次 spawn 带上全部。你填不了的字段就是你还没圈定的单元。

```
GOAL         one sentence, the outcome, executable by a stranger with no chat access
SCOPE        paths this unit may write; paths it may not; its exclusive worktree or branch
CONTEXT      pointers to files and PRs; upstream reports pasted in full when this unit
             depends on them, because workers cannot see siblings
ACCEPTANCE   checkable criteria, one per line
VERIFY       exact commands or the control-skill path, plus known gotchas
TIMEBOX      rough cap on runtime; on expiry, return partial findings and stop rather than run on
FORBIDDEN    no gt, no rebase, no force-push, no fixes outside scope, plus unit-specific bans
REPORT       status, branch, head SHA, PRs, verdict, what you actually ran, deviations,
             suggested follow-ups
STANDING     <preferences.md pasted verbatim>
```

brief 按单元定量。一条命令的单元把模板压成一段，仍要点名 goal、scope、verify 命令和 report 形态。给两行编辑配 4KB 脚手架比编辑本身还贵。本地 spawn 可以按 store 路径引用 standing-orders 文件。逐字粘贴是给 cloud spawn 和每次 resume 的。

sub-coordinator 的 brief 加它的 track 边界和单元清单、带 cloud 默认和本地例外清单的 spawn 预算、drain 协议、以及汇总格式（每孩子：名字、状态、PR、head SHA、判定、一行；外加 track 状态和前沿差值）。

依赖是上下文接力，不只是排序。没声明的上游上下文让 worker 只能猜。缺字段是拒绝 spawn 的条件。每个 sub-coordinator 每 wave 抽审一个 worker brief——与被抽的 wave 并发，绝不当它前面的 gate。不及格的 brief 停那条 track 并修 sub-coordinator 的指令，不只修 worker——brief 质量在 run 后段会衰减。绝不 resume 链接续 brief。带合并 scope 重新 spawn。

#### 步骤

1. **Frame.** 把 done 谓词写成可数的东西（"all 126 units merged, each ledger-verified `unit-test-verified` or better"）。量化 scope：单元数、粗工作量、预期 stack 数、wall-clock 预算。一个 agent 能在预算内完成就停在这里改跑 Autonomous run。坍缩不得依赖另一份文档在场。坍缩意味着：在本会话直接干活、有用就起普通 worker、验证内联、边做边落、下面那套 store/登记/试点机构一概不上。落地对着预算排：到约 70% 时停止 spawn，落已验证的。按项目命名 track。有争议的分解或单向门在试点之前过 arena skill。框定呈现一次。可逆的准备不等就进行。
2. **装运行时。** 跑 `orch init`。经 show-me-your-work skill 开轨迹；任何 spawn 之前写好 standing orders；用 `orch frontier set --repo <repo-dir>` 从现有 PR 播种 `frontier.json`。
3. **Pilot。** 把一个单元推过全路径：brief、worker、验证、stack 入列、台账行、合并。试点存在的意义是在代价还是一个 agent 而不是五十个时，证伪 brief 模板、verify 配方和单元大小。fan-out 之前按试点证据修契约。试点按单元定量。近乎相同的廉价单元上，第一个单元就是试点——当普通单元跑、verify 命令内联、它一落地 fan-out 就开始。专门的试点管线（独立 verifier agent、审计 gate）是给昂贵或新形态的单元准备的；克隆单元上串行试点没什么可证伪。
4. **Scale.** 起滚动窗口的 worker 直到在途上限，孩子完成就补。阻塞批次付每批最慢孩子的代价。过了 Roles 里一条-drain 的门槛才 spawn track sub-coordinator。每次 drain 后重算就绪工作。把上游报告接力进下游 brief。兄弟通信只向上。抽样 brief 审计与被抽的 wave 并行跑，失败时停的是下一次补充，不是当前这次。
5. **Drain.** 每个 drain 点跑下面的队列纪律。
6. **Land.** 落地是连续的，绝不是收尾阶段。整合从第一个已验证单元开始，与其余 wave 并行跑。重仓库上 stacker 从第一波起就是常设角色，单元一验证就整合。本地 git 便宜的仓库上 coordinator 按 Roles 自己落已验证单元。上层 stack 工作之前保前沿绿。Stack safety 管辖。只在合并或有报告的新 head SHA 时推进 `frontier.json`。
7. **Close.** 排空最终 inbox，把每个 spawn 过的 agent 对账到终态行（done、abandoned、zombie-reconciled），在真实产物上确认谓词，确认每个落地的 PR 有其当前 head SHA 的判定，按 show-me-your-work 审计轨迹（含跨模型 review），把反复出现的纠正编码进 `preferences.md` 或 brief 模板。store 原样留下——它就是 postmortem。

#### 队列与排空

- 完成通知到达时跑 `orch inbox push <agent> <unit> <status> [--report PATH]`，然后回去做你正做的事。绝不当场深审。需要 review 的完成变成 verifier 单元。绝不在 drain 里 review diff。
- 四个点批量 drain：临界区结束、track 汇总、前沿 watcher 唤醒（经 loop skill 布防，带长心跳兜底）、人类报告之前。每批以 `orch inbox drain` 开头。drain 期间的到达等下一批。
- 先做完的临界区：写 brief、stack 操作、冲突决定、写 gate、更新台账或前沿。
- 每次 drain 给每个指针归类（landed、needs-verify、failed、zombie、noise），经 `orch unit add`、`orch unit set`、`orch ledger record` 写结果行，跑 `orch status`，然后在一条消息里 spawn 下一波。
- 每个 spawn 过的孩子在它 track 的汇总里要有交代：到达了、重 spawn 了、或 scope 被明确吸收了。悄悄重做一个失踪孩子的活，既掩盖浪费的花费、也掩盖它的结果本要补的覆盖缺口。
- drain 回合以 `orch status` 的三行收尾：各状态计数、变了什么、开着的 gate。细节在 `status.md`。完整回复契约在 checkpoint 和收尾时适用。

#### Stack 安全

- 前沿是算出来的对象，不是叙述。每次合并和 stack 变动后从 `gt` 重算 `frontier.json`——restack 中途 GitHub base ref 会漂，而 gt 跟踪是权威的：有序 PR 清单、branch 名、head SHA、代际号、最低未合并 PR。在 gt 认得该 stack 的地方解析，通常是 stacker 的 clone。gt metadata 没见过 submit 的 checkout 报不出 PR，命令报错而非瞎猜。
- 每条 stack 恰好一个 stacker 能跑 `gt`，在 stack 内串行。holder 记在 standing orders。restack 在 cloud 跑——这个量级的本地 restack 会把笔记本干趴。
- worker 绝不 rebase、绝不跑 `gt`。babysitter 遵循 `playbooks/babysit.md`，每条 stack 一个，scope 锁在一个不可变前沿代际。它们向 stacker 报冲突而不是自己 restack。
- PR 关闭和 retarget 只经 stacker。关掉 base PR 会把它上面整条链变孤儿。合并和 stack 手术同其他活一样是有 brief 的单元。
- 一个 retro watcher 盯已合并 PR 的 revert、合并后 CI 断、孤儿后续项。

#### 验证

验证随单元定量。VERIFY 是单条便宜命令时，worker 跑它并报输出，coordinator 抽查回执。专职 verifier agent（与 worker 不同模型族）给验证昂贵、判断密集或高爆炸半径的单元。整个产出只是重跑一条命令的 verifier agent 是仪式，不是验证。

台账行用 `orch ledger record` 写。查当前 PR 和 head SHA 用 `orch ledger check`。`ledger.tsv` 每个判定一行，按 PR 号加 head SHA 作 key：`live-ui-verified | unit-test-verified | type-check-only | verifier-blocked | verifier-failed`。CI 绿是判定的输入，不是判定。行为性工作需要比 `type-check-only` 强。`verifier-blocked` 不算通过——环境恢复后重 spawn。`verifier-failed` 领修复单元，不是重验。worker 可以自报；同 key 上 verifier 覆盖它。新 head SHA 作废该行，restack 后要重验。台账回答"这个验证过吗"——不靠记忆，不靠 transcript。

单元的产出在落地那一刻就要外化，绝不攒到 run 末尾批处理：worker 推它的 branch、verifier 写它的台账行、回执落进 store。VM 死了只存在于那台 VM 上的工作等于没做过。

#### 活性与失败

- 绝不为查状态 resume 一个 agent。resume 会重启一个闲着的 agent。只读探测：台账、`units.tsv`、`gh`、已推 branch、Cursor dashboard 里 cloud agent 的状态。transcript mtime 不是活性证据。
- 静默死亡在 inbox 里补一行合成 postmortem（单元、失败模式、最后证据、选项）。证据到了就重规划。绝不等到全静止。
- 按模式重试：cap-hit 或 oom 用更小 scope 重 spawn；network-drop 原样重试；tool-error 换模型重试；unknown 重试一次。两次重试后放弃该单元，绕着它重规划。
- 晚回来几小时的 zombie，任何东西被接受前先对照当前前沿和台账对账。独有的发现经新单元抢救，绝不盲合。
- 继续 spawn 会让整棵树产垃圾时（上游输出坏、验收坏、基建死），在 standing orders 顶部写一行停，让在途工作完成，修掉原因，清掉它。
- 你自己的基建重试和孩子一样要有界。连续几次工具 abort 后停手。把终局交接写进持久状态（做完了什么、在哪、恢复用的确切命令），结束 run。
- Cursor 重启之后：本地 agent 死了，cloud 工作没死。重读 standing orders 和 `units.tsv`，重算前沿，按 PR 和 branch 而不是 agent id 重接 cloud 工作，从存好的 brief 加当前状态每 track 重 spawn 一个 sub-coordinator，drain，继续。死掉会话的 store 锁在下一次写入时自清。holder pid 不在的锁 `orch` 会换掉。

#### 升级

到人类——批量进状态页而不是逐条问：不可逆动作（force-push 共享 branch、部署、删除、关别人的 PR）、实验定不了的真产品或偏好判断、与观察到的现实矛盾的 standing order、重规划后仍存活的工程级死胡同。问之前每项先停成 `gates.md` 条目，工作绕着它走。

绝不到人类：前沿微调、restack 机械活、重试、CI flake 分诊、review-thread 分诊、格式修复、brief 已禁的 scope（拒绝并继续）、"should I keep going"。拿不准就先做再记。

run 中途的发现只修阻塞前沿的。其余停进 follow-ups。这个 fan-out 量级上一点 scope 泄漏会繁殖成没人要的 PR。

**回复：** checkpoint 和收尾时：谓词及 `units.tsv`、`ledger.tsv` 对它的计数，各 track 落了什么，前沿（PR 清单加 SHA），判定汇总，放弃了什么及为什么，等人类的 gate（唯一的问项），store 路径，轨迹路径。数字来自表，不是叙述。附 PR 链接。
