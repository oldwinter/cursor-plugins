### Worktree and simulator cleanup

**你拥有磁盘和安全闸。** 修剪已合并或废弃的 git worktree 和过时的 iOS simulator 来回收空间。删除不可逆，所以每一步都防着删掉在用的或持有未提交工作的。

1. 快照加审计。记录 `df -h /`，然后跑 `scripts/worktree-audit.sh`（principle-build-the-lever）。它从 `git worktree list` 读路径，绝不手打——手打的 `myrepo-worktrees/x` 会漏掉住在 `.cursor/worktrees/myrepo/x` 的那个（principle-encode-lessons-in-structure）。它按大小、龄期、合并状态、未提交工作、PR 状态、最近碰过它的聊天给每个 worktree 归类，然后建议桶。transcript 扫描慢，放后台跑。
2. 桶是建议不是许可。pin 住的和活动的聊天才是真产物（principle-prove-it-works）。从用户或侧栏拿那个集合，每个候选都对一遍。lever 曾经把用户 pin 着的 worktree 标成 `safe`——所以 pin 集合说了算。
3. 删之前核实使用。每个 `verify-recent-chat` 行、或任何你存疑的，fan subagent 出去读 transcript，报告该聊天是 pinned 还是进行中、碰哪些 worktree（principle-guard-the-context-window——transcript 是批量数据）。pin 住的聊天会经后台 subagent 把 arena 和 repro 树生进兄弟 worktree，那些在用中——哪怕它们的名字从没上过侧栏。
4. 不可逆损失前暂停。`wip:N` 是 N 处已跟踪未提交编辑。先展示 diff 并拿到决定——删干净的 worktree 还能从 branch 恢复，未提交的工作没了就没了。`scratch:N` 是未跟踪的丢弃物，安全可删，但点出文件名。按 Autonomy：干净、已合并、不在用的直接删；`wip` 和在用的暂停。
5. 修剪确认的集合。逐路径 `git worktree remove --force <path>`。目录若因 ignored 构建产物残留，`rm -rf` 它，然后 `git worktree prune`。branch ref 保留，没有 commit 会丢。用 `df -h /` 和重新列表确认。
6. simulator 和其他回收项。simulator 通常是第二大的赢面。`xcrun simctl --set testing delete all`（XCTestDevices 克隆）、`xcrun simctl delete unavailable`、`xcrun simctl runtime list` 然后 `runtime delete <id>` 清旧 runtime。需要时还有：Xcode 的 `DerivedData` 和 `iOS DeviceSupport`、`~/Library/Application Support/Cursor`（`state.vscdb.backup`，以及 `snapshots/roots/<root>`——以你开成工作区的文件夹命名的 `<root>` 会膨胀）、包缓存（pnpm、uv、brew、yarn）。只清用户没说要留的缓存。

这是唯一一本删除用户状态而没有 code review 兜底的 playbook——上面的闸就是 review。

**回复：** 前后的 `df -h /` 和回收的空间、删了哪些 worktree、每个留下的附一行原因（哪个聊天在用、或有未提交工作）。
