# benny

benny 给你两个处理 slack issue 报告的 cursor automation。一个分诊每份报告，另一个复现已确认的 bug 并可能准备一个小型 draft 修复。

本目录里的文件是休眠的 setup 和 automation 源。它们不以 slash skill 出现。

## 设置

1. 把 cursor 指向 [`FOR_AGENTS.md`](./FOR_AGENTS.md) 并报目标仓库名。
2. 让 setup 把整个目录合并进目标的 `.cursor/automations/benny/`。它必须保留仅目标端存在的文件、review 冲突而不是覆盖本地编辑。
3. 让 setup 在目标仓库的 `.cursor/settings.json` 里为共享依赖启用 pstack：

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

4. 用户拥有的配置放在复制的 pack 之外，比如 `.cursor/benny/`。改写 [`configuration.example.yaml`](./templates/configuration.example.yaml) 和 [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md)。
5. 启用任一 automation 之前，提交 `.cursor/settings.json`、`.cursor/automations/benny/` 和任何无 secret 的配置。
6. review 每个新 automation 草稿，或在编辑器里更新既有 automation。然后发一份无害的测试报告，核实每条源频道发言都留在原 thread 里。
