# Databricks 分析与系统表

## 这个来源包含什么

Databricks 是产品分析、数据 pipeline 和数仓遥测层，与 Datadog 互补：Datadog 是 *infra/runtime* 视角，Databricks 是*产品/数据*视角（用户做了什么、跑了哪些实验、功能用量怎么演变、某个阈值常量哪来的）。

- **产品分析事件。** `your_warehouse.events.analytics_track_event`（原始）和 `<your_analytics_db>.<schema>.<table>` 里按事件类型化、去重后的 dbt model。用户行为：功能调用、点击、接受/拒绝、提交、客户端上报错误。
- **用量与计费事件。** `your_warehouse.events.usage_event` / `<your_analytics_db>.<schema>.stg_usage_events`、`your_warehouse.events.raw_model_event` / `<your_analytics_db>.<schema>.stg_raw_model_events`。用于成本或量级驱动的决策。
- **实验 / feature-flag 数据。** 曝光表和结果表。**schema 因公司而异。** 别臆测表名，先用 `SHOW TABLES` 探。
- **系统表。** `system.query.history`、`system.compute.warehouses`、`system.billing.*`、`system.access.audit`。回答"这个查询贵吗？"、"这东西多久跑一次？"、"warehouse 负载什么时候尖峰的？"
- **dbt 血缘。** `<your_analytics_db>.<schema>` 里的 model 揭示哪些 pipeline 依赖某表/字段。上游变更经常促成消费方代码改动。
- **Databricks notebook。** 工程师改代码前写的探索性分析。**SQL MCP 查不了。** 怀疑理由在 notebook 里就把它记为缺口。

## 怎么搜

用 Databricks SQL MCP。主工具：`execute_sql_read_only`。它返回 `statement_id` 时用 `poll_sql_result` 轮询，别重跑。

**查询前先定向。** schema 因公司而异，信任表名之前先探：

```sql
SHOW TABLES IN <your_analytics_db>.<schema> LIKE '*<keyword>*';
DESCRIBE TABLE <your_analytics_db>.<schema>.stg_<event>;
```

**每个查询都限定时间。** 这些表巨大，无约束扫描会超时。在 `_timestamp`（事件）或 `start_time`（`system.query.history`）上过滤，窗口夹住发布日期，通常前后各约 30 天，只有强理由才放宽。

**优先类型化 dbt model 而非原始表。** `<your_analytics_db>.<schema>.<table>` 去重、类型化、liquid-clustered。`your_warehouse.events.analytics_track_event` 有重复且 `properties_json` 无类型。model 命名模式：`stg_<source>_<event_name_with_underscores>`，`<source>` 为 `app`、`backend`、`website` 或 `cli`。模式推不出确切名字时用 `SHOW TABLES` 确认。只有当还没有 dbt model、或需要 dbt 刷新延迟内的事件时才落到原始表。

**类型化 dbt model 的列约定**（记住省一次 `DESCRIBE`）：

- `_timestamp`、`_id`、`_auth_id`、`_request_id`、`event_name`：每个 model 的标准列
- `properties_<name>`：类型化、下划线命名的事件属性（`properties_entrypoint`、`properties_size_bytes`……）
- `context_team_id`、`context_client_version`、`context_country`、`context_client_os`：预提取的客户端上下文

### 常有回报的调查模式

挑匹配目标的 表+列 组合：

1. **事件用量轨迹。** PR 合并前后 ±30 天窗口内，相关 `stg_*` model 的每日计数。合并后一两天内从零到稳定量的阶跃，是该 PR 上线功能的强间接证据；衰减到零暗示 deprecation 或删除。
2. **护栏 / 防御检查的起源。** PR 之前 14 天内相关 `properties_<name>` 列的分布（median / p99 / max）。p99 与目标阈值常量吻合，暗示数字来自数据。
3. **实验 / feature-flag 查证。** `SHOW TABLES ... LIKE '*experiment*'` 找曝光表，然后按 variant 拉该 flag key 在 PR 日期附近的曝光计数。
4. **迁移、回填或性能重写的 query-history 证据。** 在 `system.query.history` 上按 `statement_text ILIKE '%<table_or_symbol>%'` 加紧凑 `start_time` 窗口过滤，浮出可能促成改动的昂贵查询（按 `total_duration_ms` 排序，或聚合 `SUM(read_bytes)`、`COUNT(*)`）。
5. **dbt 血缘。** 目标读写 `<your_analytics_db>.<schema>` 的某个 model 时，该 model 自己的 git 历史（在本仓库内）常带着理由。把这条线索交回 git investigator，别自己追。

## 这里什么样的证据算好

除上面的模式形态外：

- 一个错误分类事件的计数在防御性代码 PR 后几天内掉到接近零：暗示该 PR 解决了那类错误
- 曝光表里一行点名目标的 feature-flag key，并在 PR 发布日期附近有 "shipped" / "concluded" 决策

## 常见坑

- **被 instrument ≠ 是原因。** 事件存在说明有人觉得值得记，不说明目标代码*因为它*存在。声称因果前，先和 git investigator 的 PR/commit 引用配对。
- **无声的 instrumentation 变更。** 事件量的阶跃可能是新事件开始被记录，不是用户行为变了。把爬坡读成发布信号之前，查同窗口内有没有 instrumentation PR。
- **schema 漂移。** 事件属性会演化。类型化 dbt model 上今天有的列，目标写入时可能还不存在。更老的数据可能只在原始 `properties_json` 里带这个属性。
- **dbt 刷新延迟。** `<your_analytics_db>.<schema>.*` 按周期重建（常每小时/每天）。最近几小时的事件落到 `your_warehouse.events.*` 并按 `_id` 去重。
- **公司专属表。** 实验、feature-flag、计费、用量表各不相同。没确认存在就报告某表的结果，是经典失效模式。先 `SHOW TABLES` / `DESCRIBE TABLE`。
- **保留期断崖。** 相关窗口早于表的保留期或 dbt model 的创建日期时，那是*缺口*不是 null 结果。明确命名，别让 synthesizer 把"没结果"读成"没活动"。
- **notebook 查不了。** SQL MCP 看不到 Databricks notebook。怀疑理由在里面就返回缺口。

## 返回什么

每个相关发现：
- 类型（产品事件 / 实验曝光 / 用量或计费事件 / 系统表行 / dbt model）
- 全限定表名和你跑过的确切 query
- 查询的时间窗口
- 紧凑的数值摘要（count、百分位、first/last-seen 时间戳）。**别倒原始行。**
- 与目标发布日期的时间关联（如 "first row 2024-08-15, PR #49074 merged 2024-08-14"）
- 相关性 + 强度：direct / circumstantial / weak
