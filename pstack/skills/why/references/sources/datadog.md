# Datadog 遥测

## 这个来源包含什么

Datadog 装的是运行时记录——生产上真实发生了什么，而不是计划或讨论了什么。

- **Metrics。** 团队 instrument 的 counter、gauge、histogram。一个 metric 的*存在本身*就是证据：有人觉得这个数值得盯着。
- **Monitors & alerts。** 团队认为值得叫醒人的条件。一个对 `rate_limit_hit > 10/min` 报警的 monitor，是团队担心那个阈值的直接证据。
- **Dashboards。** 精选视图。图表告诉你团队认为一个子系统什么最重要。
- **APM traces & spans。** 请求级运行时数据。对"这里为什么慢"/"这里为什么有 timeout"类问题有用。
- **Logs。** 高容量事件记录。常包含促成防御性代码的错误条件。
- **Incidents。** 带时间线和关联 postmortem 的正式 incident 记录。
- **Notebooks。** 探索性调查，常含假设和分析。

Datadog 回答的是"这段代码写成时，生产现实是什么样？"——这经常解释了代码的形态。

## 怎么搜

用 Datadog MCP。先宽后窄。

1. **找到 owning service。**

   ```
   search_datadog_services（按名字或 team 过滤）
   search_datadog_service_dependencies（看上下游）
   ```

2. **先看 dashboard 和 monitor——它们告诉你团队在乎什么。**

   ```
   search_datadog_dashboards（query：功能名、service 名、符号）
   search_datadog_monitors（同样的 query）
   ```

   当 dashboard 或 monitor 覆盖目标时，记下它的 query 和盯着的阈值。阈值经常就是"这里为什么钳制在 N？"的答案。

3. **目标周边的 metric。**

   ```
   search_datadog_metrics（按名字模式，如功能名或符号）
   get_datadog_metric_context（metadata：描述、单位、tag）
   get_datadog_metric（时间序列；"PR 日期附近有尖峰吗？"）
   ```

   把 metric 轨迹和目标的加入/变更日期关联是强佐证："`payment_timeout` metric 在 2023-11-03 尖峰，retry 逻辑在 2023-11-06 合并。"

4. **Log。收窄，别倾倒。**

   ```
   search_datadog_logs（目标附近的原始 log 模式，设 use_log_patterns=true）
   analyze_datadog_logs（SQL 式聚合，只在需要计数时用）
   ```

   用符号、错误串或功能名搜。**强烈优先时间限定查询**（比如改动前后各 30 天）。log 量巨大，无约束搜索浪费时间还可能超时。

5. **APM span 和 trace。**

   ```
   aggregate_spans（统计："这个 endpoint 多常失败？"）
   search_datadog_spans（检查单个 span）
   get_datadog_trace（指定 trace ID）
   ```

   对 timeout、retry、慢路径、跨服务行为有用。

6. **Incident。**

   ```
   search_datadog_incidents（按标题、team、日期范围）
   get_datadog_incident（某个 incident 的完整详情）
   ```

   目标看着是防御性的话，搜它加入前后的 incident。时间线里写着"added defensive check for X"的 incident 接近直接证据。

## 这里什么样的证据算好

- query 和阈值恰好匹配代码强制的约束的 monitor（代码钳制到 100，monitor 在请求超 100/min 时报警）
- 目标代码作者创建的 dashboard，widget 对应代码测量或防着的东西
- 代码合并前刚尖峰、之后平稳的 metric
- 引用目标代码、相同符号或相同错误串的 incident 记录
- 展示防御性代码要防的错误模式、时间戳落在改动前窗口内的 log

## 常见坑

- **相关不是因果。** PR 前尖峰、之后平稳是暗示性的，不是定论。同一窗口可能有其他改动落地。查邻近 PR。
- **对找到的那张图过拟合。** Datadog 可视化是人*做的*，反映那个人的框法。一张叫 "retry success rate" 的图证明团队在乎重试成功率，不证明某行代码因它而存在。
- **消失的遥测。** metric 会被改名、删除、保留期短。相关窗口找不到数据是缺口，不是 null 结果。
- **规模下的噪音。** 拿常见字符串搜 log 会返回几千条。按 service、tag、时间激进收窄。用 `analyze_datadog_logs` 聚合而不是倒原始 log。
- **被 instrument ≠ 是原因。** 一个 metric 的存在说明有人觉得值得测，不说明代码*因为它*而被加。和 commit/PR 日期交叉对照。

## 返回什么

每个相关条目：
- 类型（dashboard / monitor / metric / log pattern / trace / incident / notebook）
- 标题或名字
- 链接或标识符（dashboard ID、monitor ID、metric 名、incident ID）
- owner/作者和创建/修改日期
- 与问题相关的具体条件、query 或引文（尽量逐字）
- 相关性：它对目标代码暗示什么、关联强度如何
