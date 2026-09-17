# Search notes

Search 让用户按标题或正文找笔记、查看匹配的笔记、并区分"无匹配"和"搜索不可用"。

## Sub-features

- `search-open` 从每个受支持的浏览器入口打开搜索。
- `search-match` 返回标题和正文匹配，不改笔记数据。
- `search-open-result` 在笔记编辑器里打开结果。
- `search-empty` 对无匹配查询显示完整空态。
- `search-clear` 移除查询并恢复最近笔记视图。
- `search-cli` 从终端返回同样的匹配笔记。

## How to get to it (user POV)

- 在浏览器工具栏选 `Search` 按钮。
- 焦点在可编辑字段外时，在浏览器里按 `/`。
- 在终端跑 `notes search <query>`。

## Driving it with control-notes

Preconditions:

- Notes 在 `http://127.0.0.1:4173` 健康。
- 一次性数据目录里有正文为 `Draft budget` 的 `Quarterly plan`。
- `control-notes doctor` 报告预期 URL 和数据目录。

- **Toolbar entry.** 选 `Search` 按钮。跑 `control-notes browser click --role button --name "Search"`。出现名为 `Search notes` 的 dialog，焦点在其 searchbox。
- **Keyboard entry.** 关闭 dialog、聚焦页面、按 `/`。跑 `control-notes browser press --key "/"`。同一个 dialog 出现，页面没有插入斜杠。
- **Title match.** 输入 `quarterly`。跑 `control-notes browser fill --role searchbox --name "Search notes" --value "quarterly"`。`Search results` 列表含 `Quarterly plan` 且不含 `Grocery list`。
- **Body match.** 把查询换成 `budget`。跑 `control-notes browser fill --role searchbox --name "Search notes" --value "budget"`。结果 `Quarterly plan` 仍可见，带正文匹配摘录。
- **Open result.** 选 `Quarterly plan`。跑 `control-notes browser click --role link --name "Quarterly plan"`。dialog 关闭，编辑器标题读作 `Quarterly plan`。
- **Empty state.** 重新打开搜索并输入 `volcano`。跑 `control-notes browser fill --role searchbox --name "Search notes" --value "volcano"`。搜索完成后出现名为 `No matching notes` 的 status。
- **Clear query.** 选 `Clear search`。跑 `control-notes browser click --role button --name "Clear search"`。searchbox 清空，`Recent notes` 区域替代结果列表。
- **CLI match.** 从终端搜索。跑 `control-notes cli -- notes search "quarterly" --format json`。exit code `0`，stdout 含一个 title 为 `Quarterly plan` 的对象。
- **CLI miss.** 搜一个不存在的值。跑 `control-notes cli -- notes search "volcano" --format json`。exit code `0` 且 stdout 为 `[]`。
- **Proof.** 捕获有结果的状态。跑 `control-notes browser snapshot --aria --path artifacts/search/results.aria.txt` 和 `control-notes browser screenshot --path artifacts/search/results.png`。两件产物都能认出 Notes、查询词和 `Quarterly plan`。

## Gotchas

- 编辑器或 searchbox 有焦点时按 `/` 会插入文本而不是打开搜索。
- 结果在短暂 debounce 后更新。等结果列表或空态 status，不要固定 sleep。
- 归档笔记默认排除，除非用户开了 `Include archived`。
- CLI 默认人类可读输出。稳定断言用 `--format json`。
- 打开结果会改变浏览器状态。证明下一个查询之前重新打开搜索。
