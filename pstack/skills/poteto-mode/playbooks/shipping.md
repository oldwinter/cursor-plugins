### Shipping

**你拥有落地的东西。独立验证每个 PR，只落从根部起连续已验证的那段，然后把手从队列上拿开。**

这是 `playbooks/babysit.md` 之后的半程。

1. **解析 forge，然后独立验证每个 PR。** GitHub CLI（`gh`）是默认。`command -v origin` 成功且 Origin 能解析该仓库时，用 `origin pr ...` 做 PR 的 view、watch、edit 和 merge。否则留在 `gh` 并记录回退。绝不要求 Graphite（`gt`）。每 PR 一个 subagent，不批处理，每个都是 Cursor cloud agent，各自在真实 surface 上操练（按改动需要 `cursor-team-kit` 的 `control-ui` 或 `control-cli`），对比 parent 与 head。每个返回 `PASS`、`PASS+NOTES` 或 `FAIL`，并把判定发到自己的 PR 上。安全意味着判定来自没写过这代码的 agent。CI 绿不是判定，机器人 review 通过也不是判定。
2. **只落从底部起连续已验证的那段。** 从最低的未合并 PR 往上走，在第一个没有通过判定的 PR 停——`PASS` 和 `PASS+NOTES` 都算通过。坐在未验证 PR 之上的已验证 PR 不可落地。把天花板报成 PR 号，并说是什么断了链。
3. **复查每个判定仍描述当前 patch。** 记录判定的 head SHA、base SHA、以及该 PR base-to-head diff 的稳定 `git patch-id`。rebase 或 base retarget 会重写 SHA，可能在不碰任何 check 的情况下静默作废判定。落地某 PR 之前，比较记录的 patch-id 和它当前的 base-to-head patch-id。patch 变了就重新验证。没变就保留代码判定，但在当前 head 上重跑 mergeability 和 CI。绝不用相同 commit message 或旧 SHA 的绿 check 代替。
4. **只准备底部那个 PR。** 拉当前 trunk。需要时把最低的已验证 branch rebase 到确切的 trunk 顶端，推送，只把那个 PR retarget 到 trunk：`origin pr edit <pr> --base <trunk>` 或 `gh pr edit <pr> --base <trunk>`。推送后重跑步骤 3。还不 retarget、armed 或合并后代。
5. **一次落一个 PR。** 底部 PR 现在可合并就 squash：`origin pr merge <pr> --squash` 或 `gh pr merge <pr> --squash`。要求项还在跑而用户要了 merge-when-ready，就只武装那一个 PR：`origin pr merge <pr> --squash --auto` 或 `gh pr merge <pr> --squash --auto`。Origin 的 `--auto` 是 Origin merge-when-ready；GitHub 的 `--auto` 是 GitHub auto-merge。等那个 PR 合并完再准备下一个。
6. **别把 GitHub `autoMergeRequest` 读成 stack 就绪。** 它至多说明某个 GitHub PR 被请求了 GitHub auto-merge。它不证明 Origin merge-when-ready 已武装、后代已入队、patch 判定还有效、或连续 stack 安全。确认活动 forge 里当前底部 PR 的状态；活动 forge 报不了就明说状态未知。
7. **每次合并后重算。** 拉 trunk，确认合并 SHA 在，从冻结的自底向上清单摘掉已合并的 PR，检查新底部 PR 的 base、head、check 和 patch-id。host 可能自动 retarget 子级，但别假定它做了。对那一个 PR 重复步骤 3 到 6。独立的工作不进这条链，自己走自己的交付。
8. **盯当前前沿到它合并或失败。别在它周围动队列。** Origin 上用 `origin pr view <pr> --checks --comments` 和 `origin pr checks <pr> --watch`，然后重读 PR 到它报 merged 或 blocked。GitHub 上用 `scripts/watch-pr/watch-pr --queued-stack --stack-prs <bottom>` 只当事件唤醒，每次唤醒后轮询 `gh pr view <pr> --json state,mergedAt,mergeStateStatus,statusCheckRollup,autoMergeRequest`，忽略 `READY` 直到 `mergedAt` 非空或 `state` 为 `MERGED`。到那时才跑步骤 7。硬失败只在：`state` 为 `CLOSED` 且无 `mergedAt`；必需 check 得出 `FAILURE` 或 `CANCELLED` 且在 auto-merge 不再 pending 后阻塞合并；或 `mergeStateStatus` 为 `UNSTABLE` 或 `DIRTY` 且无 auto-merge pending。check 还在 pending 或 auto-merge 已武装时的 `BLOCKED` 不是失败。这里不用 Babysit 的 queued `WAITING`/`merge-queue` 停止条件。盯梢挂在 `/loop` dynamic 模式下。报告每次合并和新天花板。队列卡死先诊断再动手。
9. **停在天花板。** 已验证段合并完，报告落了什么、下一个未验证 PR 是什么、验证它要什么。延长这一段是从步骤 1 重新过一遍。

**回复：** 已验证段及其天花板、每个 PR 的判定及出自谁、你武装了什么及怎么确认的、落了什么、下一个缺口要什么。
