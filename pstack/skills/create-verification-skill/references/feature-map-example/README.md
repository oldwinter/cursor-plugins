# Notes verification map

本目录是验证 Notes 用户可见行为的维护源。驱动 app 之前先读索引，然后用对应的功能文件当配方。

## 基线前置条件

- 用一次性数据目录在 `http://127.0.0.1:4173` 启动 Notes。
- 设 `NOTES_DATA_DIR=/tmp/notes-verify-$RUN_ID`，让并发 run 不共享状态。
- 播种标题为 `Quarterly plan` 和 `Grocery list` 的笔记。
- 把 `control-notes` 和 `notes` CLI 放上 `PATH`。
- 跑 `control-notes doctor`，要求它报告预期的 URL、数据目录和 build revision。
- 绝不驱动不是本次 verification run 启动的实例。

## 驱动约定

- 每条配方从基线状态开始，除非它的前置条件另有说明。
- 优先 ARIA role 和可访问名，而非 CSS selector 或 DOM 位置。
- 每条命令按字面执行。带引号的名字和 flag 保持原样。
- 浏览器动作走 `control-notes browser`。
- 终端动作走 `control-notes cli -- <command>`。
- 变更操作后恢复播种数据。cleanup 时不删证明产物。

## 证明与跳过上报

- 捕获用户动作*和*结果状态，不只是最终画面。
- UI 证明包括一份 ARIA 快照和一张 app 身份可见的截图。
- CLI 证明包括命令、stdout、stderr 和 exit code。
- 变更证明包括存储值的第二个只读视图。
- 每件产物记录功能 ID 和所用入口点。
- 不可达路径要连同尝试的命令和未满足的前置条件一起报告。
- 不要把从另一路径跳过的入口点报成已验证。

## 功能条目契约

每个功能文件以 H1 标题加一段描述用户可见行为的段落开头，然后严格用四个按此顺序的 H2 小节。

1. `Sub-features` 列短 ID，每个行为一行。
2. `How to get to it (user POV)` 列出每个用户入口点。
3. `Driving it with <harness>` 以 `Preconditions:` 开头，用带标签的 bullet 把每个用户动作与确切命令和可观察结果配对。
4. `Gotchas` 列出会浪费或作废一次 verification run 的坑。

实现细节留在 map 外。只点名用户路径、稳定句柄、所需状态、命令和可观察证明。

## 功能

- [Create a note](./create-note.md) 覆盖浏览器和 CLI 创建、取消、持久化和清理。
- [Search notes](./search.md) 覆盖工具栏、键盘和 CLI 搜索，含匹配、空态和清除状态。
