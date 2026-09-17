# 分诊 automation prompt

> 复制后 setup 工作流的源材料。`automate` 确认复制的 pack 已提交在 automation 将运行的仓库之后，把这份意图转述进内建 `automate` 草稿。

本次运行读并遵循 `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`。

配置来源。仅当这个仓库相对路径已提交在同一目标仓库时才包含它。否则转述配置的值。绝不用 plugin 源或缓存路径：

```text
{{BENNY_CONFIG_PATH}}
```

触发：

```json
{
	"source_channel_id": "{{SLACK_CHANNEL_ID}}",
	"message_ts": "{{SLACK_MESSAGE_TS}}",
	"thread_ts": "{{SLACK_THREAD_TS_OR_EMPTY}}"
}
```

创建意图应把它描述为配置的源 Slack 频道里的一份新顶层报告。

把源频道和根 thread 时间戳当作不可变。任一缺失或与配置不符就不发帖、不写 issue tracker，直接停。

已提交的 operational 文件拥有归类、附件审查、追因、路由、去重、tracker 写和最终判定。不发进度消息。绝不在源频道发顶层消息。

coordinator 是唯一的 Slack 发帖方。任何被委托的 worker 必须只读、只回报发现、并拿到对一切 Slack 写 action 的显式禁令。

单条判定以恰好一个配置的标记收尾：

```text
[benny:bug]
[benny:performance]
[benny:other]
```

bug 或 performance 标记可附 `tracker=<URL>`。
