# Create a note

Create note 让用户从浏览器或 CLI 保存一条带标题的笔记、取消未完成的草稿、并从第二个用户可见视图确认已存笔记。

## Sub-features

- `create-open` 从每个浏览器入口打开空白编辑器。
- `create-save` 持久化标题和正文。
- `create-cancel` 丢弃未完成的浏览器草稿。
- `create-cli` 从终端创建同样形态的笔记。

## How to get to it (user POV)

- 在浏览器工具栏选 `New note` 按钮。
- 焦点在可编辑字段外时，在浏览器里按 `n`。
- 在终端跑 `notes create --title <title> --body <body>`。

## Driving it with control-notes

Preconditions:

- Notes 在 `http://127.0.0.1:4173` 健康。
- 没有标题为 `Release checklist` 的笔记。
- `control-notes doctor` 报告预期 URL 和一次性数据目录。

- **Open editor.** 选 `New note`。跑 `control-notes browser click --role button --name "New note"`。出现名为 `Note editor` 的表单，焦点在 `Title` textbox。
- **Enter content.** 输入标题和正文。跑 `control-notes browser fill --role textbox --name "Title" --value "Release checklist"` 和 `control-notes browser fill --role textbox --name "Body" --value "Tag and publish"`。`Save note` 按钮变为可用。
- **Save note.** 选 `Save note`。跑 `control-notes browser click --role button --name "Save note"`。出现名为 `Note saved` 的 status，标题读作 `Release checklist`。
- **Confirm persistence.** 回笔记列表并重新打开该笔记。跑 `control-notes browser click --role link --name "All notes"` 和 `control-notes browser click --role link --name "Release checklist"`。编辑器显示两个已存值。
- **Cancel draft.** 开新笔记，输入 `Discard me`，选 `Cancel`。跑 `control-notes browser click --role button --name "New note"`、`control-notes browser fill --role textbox --name "Title" --value "Discard me"`、`control-notes browser click --role button --name "Cancel"`。回到笔记列表且没有 `Discard me` 链接。
- **CLI entry.** 创建第二条笔记。跑 `control-notes cli -- notes create --title "CLI note" --body "Created from terminal" --format json`。exit code `0` 且 stdout 含新笔记 ID 和标题。
- **Proof.** 从 `All notes` 重新打开两条已存笔记。跑 `control-notes browser snapshot --aria --path artifacts/create-note/list.aria.txt` 和 `control-notes browser screenshot --path artifacts/create-note/list.png`。产物里看得到 `Release checklist` 和 `CLI note`。

## Gotchas

- textbox 有焦点时按 `n` 会输入字符而不是开新编辑器。
- 标题保存时会被 trim。断言渲染出的标题，不是草稿输入值。
- 单有 save status 不足以证明。从列表重新打开笔记。
- fixture cleanup 时移除 `Release checklist` 和 `CLI note`，但保留它们的证明产物。
