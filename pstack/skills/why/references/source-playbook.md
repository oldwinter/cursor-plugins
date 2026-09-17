# 来源 playbook

why skill 为每个可用证据类别 spawn 一个 investigator，各读下面一份来源专属 playbook。playbook 是针对常见 MCP 的具体示例；同类别的其他 MCP 请自行适配。

| 类别 | Playbook | 它记录的示例 MCP |
|---|---|---|
| Source control history | [`code-archaeology.md`](./sources/code-archaeology.md) | git、`gh` |
| Issue / ticket tracker | [`linear.md`](./sources/linear.md) | Linear（适配 Jira、GitHub Issues、Plane、Shortcut） |
| Long-form documents | [`notion.md`](./sources/notion.md) | Notion（适配 Confluence、Google Docs、Coda） |
| Real-time team chat | [`slack.md`](./sources/slack.md) | Slack（适配 Discord、Microsoft Teams、Mattermost） |
| Infrastructure observability | [`datadog.md`](./sources/datadog.md) | Datadog（适配 New Relic、Honeycomb、Grafana、Splunk） |
| Error / exception tracking | [`sentry.md`](./sources/sentry.md) | Sentry（适配 Rollbar、Bugsnag、Airbrake） |
| Product analytics warehouse | [`databricks.md`](./sources/databricks.md) | Databricks SQL（适配 Snowflake、BigQuery、ClickHouse、dbt） |

跨类别：

- [`incident-postmortem.md`](./sources/incident-postmortem.md)。目标代码看起来是防御性的（null check、retry、timeout、rate limit、feature flag、egress 守卫、OOM handler）时加这份。
