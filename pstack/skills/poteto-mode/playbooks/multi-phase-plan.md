### Multi-phase or multi-PR plan

**你拥有计划，不拥有代码。计划是一份 checklist——owner 逐格执行，operator 凭证据审计。** 计划就是交付物。不要实现。

1. 改动只有一两个文件且做法显然时，跳过计划。明说然后停。
2. 写之前用原型平定开放问题。每个跑 `playbooks/prototype.md`。留下 branch、SHA 和截图进 Appendix A。只有跑不出答案的产品或偏好判断才问 operator——给选项（**never-block-on-the-human** 原则 skill）。
3. 在 subagent 里探索，`subagent_type: "poteto-agent"`，按 Subagents 节显式给模型（**guard-the-context-window** 原则 skill）。每个返回文件指针、约定、测试命令、入口点。不要内联倒出来的内容。
4. 把下面的骨架复制进计划文件并填满每个占位符。除非 operator 点了路径，文件写在 agent store 的 `docs/` 下。保留每个标题和每个子块、顺序如所示。一个 PR 一节。一个 PR 是一次带自己证据的改动（**sequence-verifiable-units** 原则 skill）。在 **How to read this** 里点名执行 playbook：按 `playbooks/autopilot-stack.md` 末尾的规则在 `playbooks/autopilot-full.md` 与 `playbooks/autopilot-stack.md` 之间选。常设工程用 `playbooks/orchestrate.md`。
5. 全文先按 `/technical-writing` 写，再 `/unslop`。正文是一种 Diátaxis 模式：how-to。解释和参考放附录。每个标题陈述任务或发现。不用长破折号。不用句中冒号。
6. 跑 `node pstack/skills/poteto-mode/scripts/check-plan.mjs <plan.md>`，修掉它打印的每一行（**encode-lessons-in-structure** 原则 skill）。
7. 交回。贴计划路径和脚本输出，然后停。执行从 operator 明确的 go 开始，按计划点名的执行 playbook 走。

**Verification.** 仅测试不构成充分验证。PR 只有 unit、live、perf 三格都勾上才算验证过（**prove-it-works** 原则 skill）。这句话就是验证规则。每个验证块以它开头。live 块是强制的。在 PR head 上用 `grok-4.6-fast-xhigh` 跑十条 lane，经 control skill 驱动真实 surface，按 **swarm** skill。每条 lane 一格：具体场景、保存的截图、通过谓词。其中一条是**对 trunk 的回归 lane**——在 trunk 和 head 上跑同一承重场景。trunk 没有该功能时，该 lane 记下这个事实，改为 gate diff 新增的行为加用户等待的终态，而不是编造一个 trunk 结果。perf gate 是双侧的：trunk 和 head 都必须产出点名的指标。trunk 缺该功能时，再把 diff 新增的工作隔离出来，给那部分工作加用户等待的端到端状态设绝对预算。不要在不可比的场景之间宣称比值。perf 块点名指标、交错探针、先测的 trunk 基线、以及带失败阈值的规则。改了交互的 PR 是 review-gated：operator 在聊天里看着截图和视频 review 后才许合并。没改交互的 PR 写 `**Review gate.** None. <PR id> is not review-gated.`，下面不放格子。

**Control skill.** 按 surface 选。浏览器、Electron、web UI 用 `cursor-team-kit` 的 `control-ui`。CLI 和 TUI 用 `control-cli`。原生移动端用仓库里有的模拟器驱动 skill。碰两个 surface 的 PR 两边都开 lane。没有 control skill 的 surface 记为 Appendix C 的风险，且它的 live 块仍要点名每条 lane 怎么驱动它。

````markdown
# <Program> plan

<Under ten lines. What changes, for whom, the rule the program enforces, and the PR ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/<execution playbook>.md`. <Who merges, and which PR ids are the operator's items that stop at merge-ready.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] On the operator's go, arm a `/goal` with this exact text. "<The plan path, the PR ids in order, the verification rule, who merges, and the done condition.>"
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/<execution playbook>.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:<control skill path>`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/<each other leaf skill the program uses>`
- [ ] Arm the 30-minute audit tick. In a local session, a real terminal `/loop`. In a cloud root, a cloud-sleeper wake chain. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk and the armed /goal. Audit the operation against both and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a status message to the operator in chat, whether or not anything changed, with the queue table of PR, owner, state, and head SHA, the verdicts since the last tick, what merged, open operator gates, and blockers."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] <PR id> and <PR id> are independent and first. Both branch from `main`.
  - [ ] <PR id> after <PR id>.
- [ ] Hold the file boundaries. <PR id or class> touches only `<glob>`.
- [ ] Hold the review gate. <PR ids> change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`; if `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`.
- [ ] Open the PR ready, never draft, with `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `../references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before babysit and again before the merge-ready report.

### Verdict and merge, for every PR

- [ ] At the merge-ready head SHA, run the swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. One audit lane that reads the diff and the receipts and distrusts the PR body.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner. A new head gets a fresh swarm and a fresh verdict.
- [ ] <The merge or append rule from the execution playbook, with the patch-id rule from `playbooks/shipping.md`.>

### Boot recipe, for every live lane

Each live lane runs on its own cloud VM at the PR head. Drive through `control-ui` or `control-cli` from `cursor-team-kit`.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] <Start the backend and the surface. Wait for ready.>
- [ ] <Deliver input only through the control skill's commands. Name the read-only diagnostics.>
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run <the same load-bearing scenario> at trunk and head. If trunk lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.png`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both trunk and head. If trunk lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved. Both sides must produce the metric.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** The operator reviews before merge.

- [ ] Copy lane <n> screenshots into `<media path>/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `<media path>/<pr-id>-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] <The owner squash-merges its own PR, or the root appends it to the base-branch stack and the operator lands it bottom-up.>

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the branch, the SHA, and the artifact links. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost.>

## Appendix C. Risks

<Each risk with the PR it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing. Which PRs get `pstack/skills/how/SKILL.md` and `pstack/skills/interrogate/SKILL.md`. The trail per `pstack/skills/show-me-your-work/SKILL.md`.>
````

**回复：** 计划路径、带依赖关系的 PR id 和 review-gated 集合、原型证明了什么和仍未证明什么、check 脚本的输出。
