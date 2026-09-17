### Opening a PR

在每个其他 playbook 的结尾调用。

**Worktree.** 从 main 开的 git worktree 里干活。subagent 继承它。同一 branch 上多个 `Task` 调用各拿各的 worktree，或它们之间 `git fetch && git reset --hard origin/<branch>`。branch 上有不相关的脏工作：patch 出来、开干净 worktree、应用回去。worktree 缠死了：从 main 重置、最小重做。

**Commit.** 勤提交。开 PR 之前 rebase 成小而有序的 commit。每个 commit 是未来的 PR：可落地、排序成讲故事。修属于刚做的 commit 时 amend，可分的时候开新 commit。

**PR.** commit 之前对 diff 跑 `cursor-team-kit` 的 `/deslop`。review 之前跑 `/no-comments`。每个 PR 标题、PR 描述、commit body 按 `/technical-writing` 写，然后过 `/unslop`。应用 technical-writing 除 Diátaxis 外的每层。动作一个词，保留冠词，能用普通动词就别用 `-ing`。

**标题。** 用 Conventional Commits 形式 `type(scope): subject`。type 用 `feat`、`fix`、`docs`、`refactor`、`test`、`chore` 或 `perf`。scope 用改动区域，如 `pstack` 或 `poteto-mode`。subject 短、祈使。有真实符号承载改动就点名它。例如 `fix(pstack): retarget opening-a-pr babysit trigger`。句尾不加句号。

**描述。** PR body 是简报，不是实验日志。手拿 diff 的 reviewer 应当读到：改动为什么存在、什么在 scope 外、你怎么证明它工作。squash commit 的 body 就是 PR body。body 会让 squash commit 超过约 40 行就砍 body。

按顺序用这些小节。没话说的节删掉。

- `## Why`。一两个短段说意图和做法。不列 SHA 或 rebase 家谱。不加"based on main"开场。
- `## Scope`。bullet 列真实符号和路径。rename 或 retarget 两边都点。边界要紧时才说什么在 scope 内外。不写逐文件散文。
- `## Tradeoffs`。只点 reviewer 否则会问的被否方案。没有真取舍就跳过本节。
- `## Blast Radius`。一到三句，点名改动碰到谁或什么、为什么安全或有风险。没了这个修复 main 保持红要付的持续代价说出来。
- `## Verification`。点名每条真实运行路径及其结果。性能改动报一个带单位的主数字，用 `before → after` 形式。其余证据链到 arena 或 swarm 目录。不要样本量方法学、swarm 流水账或指标表。

这些节后，截图或视频能证明声明时附上。不贴完整 SHA、swarm/arena lane 流水账、lever 更正散文、逐文件 checklist、或 "CLEAN" 判定——这些细节放进链接产物。不用 `## Summary` 或 `## Test plan` 样板。commit body 不复述它的 subject。

**Forge.** 第一个 PR 操作之前解析 forge，之后 create、edit、view、watch、merge 都用同一个。GitHub CLI（`gh`）是默认。`command -v origin` 成功且 Origin 能解析该仓库时，优先 `origin pr ...`。Origin 不在或解析不了就留在 `gh` 并记录回退。不要求 Graphite（`gt`）。

**大小与 stack。** 宁要五个窄 PR 不要一个大 PR。stack 是 base-branch 链。根部 PR 指向 trunk。每个子 branch rebase 到父级的精确顶端，其 PR 指向父级 branch。建子级按解析出的 forge 用 `origin pr create --status open --base <parent-branch>` 或 `gh pr create --base <parent-branch>`。retarget 现有子级用 `origin pr edit <pr> --base <parent-branch>` 或 `gh pr edit <pr> --base <parent-branch>`。只有独立工作才从 trunk 拉 branch。做大的 stack 工作之前 rebase 到 trunk。

**就绪。** 每个 PR 开成 ready，绝不用 draft。Origin 传 `--status open`。`gh` 省略 `--draft`。cloud-agent 的 PR 工具默认 draft，所以每个 PR 创建调用都设 `draft: false`。还开成 draft 就跑 `origin pr ready <number>` 或 `gh pr ready <number>`（按 forge）。引用 PR 状态之前先 `origin pr view <number>` 或 `gh pr view <number>`。

**Babysit.** 开 PR 不启动 babysit。贴 URL 继续建。先完成阶段或 stack。整条 stack 存在后用户要才单独跑 babysit。每个新 PR 都 babysit 会卡住构建、把 check 花在后续 wave 会重启的 commit 上。反馈偏离意图时顶回去。

开 PR 的 subagent 要跑 `interrogate`、`/deslop`、`/no-comments`。它返回 URL，不 babysit。回到父级。
