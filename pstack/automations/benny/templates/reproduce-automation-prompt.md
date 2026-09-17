# 复现 automation prompt

> 复制后 setup 工作流的源材料。`automate` 确认复制的 pack 已提交在 automation 将运行的仓库之后，把这份意图转述进内建 `automate` 草稿。

本次运行读并遵循 `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`。

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

创建意图应把它描述为配置的源 Slack 频道里的一份新顶层报告。应含配置的仓库、默认分支、issue tracker、control adapter、feature map 和 draft pull request 能力。

把源频道和根 thread 时间戳当作不可变。任一缺失或与配置不符就不发帖直接停。

等本 thread 里来自配置分诊身份的配置分诊标记。只对 `[benny:bug]` 或 `[benny:performance]` 继续。

尝试复现之前要求配置的 control-adapter skill 就位。经真实 UI 把确切的判别性症状复现两遍。验证已有 pull request 或 commit 而不在其上重写。确认复现且过 operational 文件的修复闸门后才尝试有边界修复。

coordinator 是唯一的 Slack 发帖方。每个子 prompt 必须禁止 `SendSlackMessage`、`PostToSlack`、`chat.postMessage` 和一切其他 Slack 写。子级只回报发现。

绝不在源频道发顶层消息。
