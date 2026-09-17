### Autopilot-stack

**你拥有 stack，永远不拥有落地。以完全自主构建并验证队列，然后把一条线性的 base-branch stack 交给 operator review 和落地。** **Autopilot-full** 的姐妹篇。

1. **owner 循环原样跑。** 工程只解析一次 forge。GitHub CLI（`gh`）是默认。`command -v origin` 成功且 Origin 能解析该仓库时，用 `origin pr ...` 做 PR 的 create、edit、view、watch 和 merge。否则留在 `gh` 并记录回退。绝不要求 Graphite（`gt`）。每 PR 一个 Cursor cloud agent，端到端拥有自己的改动：build、首次推送、在自证之前开成 ready 的 PR、自证（gate、CI、回执）、按 `../references/bugbot-triage.md` 的怀疑式 Bugbot 分诊、过一遍 slop 清理（`cursor-team-kit` plugin 的 `deslop` skill，`/deslop`）、`/no-comments`（**no-comments** skill）、按 `playbooks/babysit.md` babysit 到绿。工作自包含时 owner 并行。约 15 分钟内，每个 owner 按 **show-me-your-work** skill 开一条 `decisions.tsv` 轨迹、推上第一个 branch 快照、把 PR 开成 ready——绝不用 draft。轨迹保持未提交、在报告里交回。
2. **在唤醒链上审计。** root 大约每 30 分钟跑一轮审计 tick。本地 root 把每次 tick 武装成真的终端 `/loop`：循环用被监视 shell 的 30 分钟 sleep 并发出 output-notification 哨兵。cloud root 改用现有的 cloud-sleeper 唤醒链。节奏绝不交给记忆或有损的完成通知。每个 tick：用 `git show origin/main:pstack/skills/poteto-mode/playbooks/autopilot-stack.md` 从 trunk 重读本 playbook，再重读武装的 `/goal`。对照两者审计运作。漂移在当 tick 修。用通用的活性或状态检查探每个 owner。只把副作用算进度：commit、push、PR 或 check 差值、store 报告。过了预期运行时间还没副作用的 lane 按卡死处理：立即解职并派替补。别等礼貌的返回。
3. **守住 operator gate。** state-then-wait——要求陈述计划不是 go。operator 明确说 go 时，武装一个带完整工程目标的 `/goal`。goal 跨回合延续直到链完成。operator 说停时每个 owner 立即进入零写 hold。
4. **STACK-READY 处验证。** owner 带确切 head SHA 报 STACK-READY。root 对那个 SHA 做 swarm 验证，按 **swarm** skill fan out：并行独立 verifier 在该 SHA 重跑 gate、对承重行为做实机运行时地板验证、不信任 PR body 的回执加 diff 审计。swarm 聚成一个判定。发现退回 owner，未经验证的东西不进 stack。
5. **干净判定才入链，绝不交付。** 没有 owner 合并、armed auto-merge 或关闭。干净判定把 PR 追加进那一条线性 base-branch stack，按验证顺序或 operator 指定的顺序。
6. **拓扑单一写者，构建并行写者。** owner 只推自己的 branch，报告顶端、当前 base、预期父级。root 是唯一拓扑写者。追加一个 PR：拉预期父级、把子 branch rebase 到那个确切的父级顶端、`ls-remote` 检查之后才 `--force-with-lease` 推送、把 PR base 设成父级 branch。按解析出的 forge 用 `origin pr create --status open --base <parent-branch>` 或 `gh pr create --base <parent-branch>` 建；retarget 现有 PR 用 `origin pr edit <pr> --base <parent-branch>` 或 `gh pr edit <pr> --base <parent-branch>`。只有根部 PR 指向 trunk。绝不经 `gt` submit 或注册链。
7. **在 root 吸收漂移，然后重验动过的东西。** root 拉当前 trunk，自底向上 rebase 链。rebase 在某 owner 的文件里碰出冲突时，那个 owner 修自己的切片，root 推结果。rebase 重写其上每个 SHA，作废旧 SHA 的判定。对每个 PR 在其判定 SHA 的 base-to-head diff 的稳定 `git patch-id`，对照新 base-to-head diff 比较。patch-id 未变保留代码判定。任何变了的 patch 交付前回步骤 4 重过。即使 patch-id 未变，每次重写推送后也重跑 mergeability 和 CI。会签规则与 Autopilot-full 相同：真正的新 pin 抬高要停下等 root 新鲜会签；吸收已落地值的漂移不算抬高。
8. **交付链。** 交付物是一条已验证 PR 的线性链，在解析出的 forge 里可自底向上 review，每环在 PR body 或评论里带它的 verifier 判定。operator 自己点，或武装 merge-when-ready，review 并落地它。

**两种 autopilot 怎么选。** PR 独立且落地权被授予时用 Autopilot-full。operator 要在落地前 review、工作时序性或耦合的、或合并权被保留时用 Autopilot-stack。

**回复：** stack 根部和顶端的链接、每环一行判定摘要、任何被搁置或排除的项及原因。
