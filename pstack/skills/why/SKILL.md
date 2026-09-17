---
name: why
description: "用于“X 为什么这样工作”、“我们为什么选 Y”、设计理由、regression、postmortem、或数据支撑的阈值。发现可用的 MCP 并并行查询每一类证据（source control、issue tracker、长篇文档、实时聊天、基础设施可观测性、错误追踪、产品分析数仓），然后交回一份带引用的决策与取舍解读。运行时行为用 how。"
disable-model-invocation: true
---

# Why

调查代码背后的动机与意图。

`how` skill 的搭档。`how` 回答代码做什么、怎么工作，`why` 回答什么力量把它塑造成这样。

## 工作姿态

以**细心、谨慎、精确的调查员**姿态工作。诚实区分你知道什么和你在推断什么。完整的置信度框架和措辞指南见 `references/epistemics.md`。synthesizer 必须遵守它。

## Step 1. 理解目标和问题

解析用户在问什么。**目标**通常是一段代码、一个模式、一个功能或一个具名的设计决策。**问题**通常是设计理由、取舍、促成性的边角案例、外部约束、死代码、或一次大范围历史扫查。

如果目标含糊（"我们为什么这么做？"且没有明确所指），从对话上下文给出最佳猜测（打开的文件、最近的编辑、光标位置、刚讨论的东西）。简短说明你的解读以便用户纠偏，然后继续。

## Step 2. 建立代码锚点

spawn investigator 之前，把调查锚定在具体代码上。你需要：

- 相关文件路径和行范围
- 关键符号（函数名、类名、常量）
- 一份初始 commit 列表：最近触碰目标的几个 commit
- 从 merge commit 提取的 PR 号（subject 行里的 `(#1234)` 模式）

内联构建这些。

```bash
# 对目标行 blame 出最近触碰的 commit
git blame -L <start>,<end> <file>

# 完整文件历史（含 patch），跨越改名
git log --follow -p -- <file>

# 最近 N 个触碰该文件的 commit，PR 号可见
git log --oneline -20 -- <file>

# 从 commit message 提取 PR 号
git log -1 --format=%B <commit>
```

对任何实质性 commit，用 `gh` 拉 PR 正文和讨论：

```bash
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews
```

把这些收成种子上下文（文件路径、符号、commit、PR 号、关联 ticket ID），传给 investigator。

## Step 3. 并行 spawn Investigator（默认姿态）

**默认走完整并行调查。**

### 发现

spawn investigator 之前，从 Cursor 环境列出可用 MCP。有 available-tools map 就用它；否则检查 Cursor 为已启用 MCP server 暴露的 `mcps/` 目录。

把每个可用 MCP 映射到一个证据类别：

1. Source control history
2. Issue / ticket tracker
3. Long-form documents
4. Real-time team chat
5. Infrastructure observability
6. Error / exception tracking
7. Product analytics warehouse

source control 永远可通过 git 和 `gh` 获得。其他六类按 MCP 名字、server instructions、tool 名和 resource 描述符归类。一个 MCP 可进多个类别时，选匹配其主要证据的那个。含糊情形记进 coverage map。

目标是完整的 **coverage map**，不是最小集合。把 null 也记录下来，不要跳过搜索。

在一条消息里启动所有匹配的 investigator 让它们并发。别让一个 agent 覆盖多个 MCP。

Subagent 配置（每个）：
- `subagent_type`：`generalPurpose`
- `model`：你配置的 why-investigators 模型（默认 `grok-4.6-fast-xhigh`）
- `readonly`：`false`（agent 模式）。**不要用 readonly/Ask 模式。** 它会剥掉 MCP 访问，让 MCP  backed investigator 整体失效。investigator 反正也不该写任何东西。

每个 investigator 拿到：
1. `references/investigator-prompt.md` 的基础 prompt
2. 所选 MCP 对应的类别 playbook `references/sources/<source>.md`，改编自 `references/source-playbook.md` 的示例
3. **如果目标代码看起来是防御性的**（null check、retry 逻辑、timeout 处理、rate limiting、feature flag、egress 守卫、OOM handler），加上跨类别的 `references/sources/incident-postmortem.md`
4. Step 2 的代码锚点（文件路径、符号、commit hash、PR 号、ticket ID）
5. 用户的原始问题

### Investigator 名册：每个可用证据类别一个

每个有匹配 MCP 的类别 spawn 一个 investigator。每个恰好拥有一个 tool 或 MCP。

每行注明类别和它独有能浮出的那种"why"。用它知道该期待什么回来、某类返回空时怎么命名缺口、以及（仅在有确凿证据表明无关的罕见情形）如何说明跳过理由。

1. **Source control investigator**。git 历史、`gh` 拉 PR、代码注释、测试。永远 spawn。唯一有保证的来源。最擅长浮出*实现当时被 review 记录下来的理由*。

2. **Issue / ticket tracker investigator**（如 Linear、Jira、GitHub Issues、Plane、Shortcut MCP）。最擅长浮出*产品或业务 forcing function*。当 why 在工程之外时最强。

3. **Long-form documents investigator**（如 Notion、Confluence、Google Docs、Coda MCP）。最擅长浮出*长篇设计理由*——why 在变成代码之前被写下来的地方。

4. **Real-time team chat investigator**（如 Slack、Discord、Microsoft Teams、Mattermost MCP）。最擅长浮出*从未到达文档的实时 deliberation*。当 source control、ticket、文档的纸面轨迹稀薄时尤其重要。

5. **Infrastructure observability investigator**（如 Datadog、New Relic、Honeycomb、Grafana、Splunk MCP）。infra/runtime 视角。最擅长浮出*促成这段代码的基础设施和运行时现实*。当目标对 infra 信号做出反应（timeout、retry、rate limit、circuit breaker）时最强。

6. **Error / exception tracking investigator**（如 Sentry、Rollbar、Bugsnag、Airbrake MCP）。最擅长浮出*促成防御性或纠正性代码的具体异常与错误轨迹*。对 catch block、null 守卫、type check、retry 等防御最强。

7. **Product analytics warehouse investigator**（如 Databricks、Snowflake、BigQuery、ClickHouse、dbt、Redshift MCP）。产品/数据视角。最擅长浮出*塑造代码的产品与数据现实*。对 flag 门控代码、实验驱动的发布、数据迁移和"这个数字哪来的"类问题最强。

### 何时跳过某个 investigator

只有给出**明确的书面理由**才可跳过，且写进最终 "Sources Consulted" 一节。两个有效理由：

- **该类别在本环境没有可用 MCP**。标记为缺口而不是选择。例："Real-time team chat skipped. No matching MCP available, so the conversational record was not searchable."
- **该来源可确证无关**，不只是"大概无关"。门槛很高。例："Error / exception tracking skipped. Target is a build-time script with no runtime code path."

如果你的范围评估认定这是单 commit 的平凡目标、且 PR 描述已含完整答案，你**只有**在确认全部七个可用类别搜索都会冗余之后才可以内联作答，并明确说出来。这应该很罕见。

## Step 4. 综合

spawn 一个 synthesizer subagent：

- `subagent_type`：`generalPurpose`
- `model`：你配置的 why-synthesizer 模型（默认 `claude-fable-5-1-thinking-max`）
- `readonly`：`false`（agent 模式）。synthesizer 的质量检查要抽查 citation，可能需要 MCP 访问。readonly/Ask 模式会剥掉 MCP，让它失效。

synthesizer 拿到：
1. investigator 发现，包括任何 null 结果和带理由跳过的类别
2. Step 2 的代码锚点（文件路径、符号、commit hash、PR 号、ticket ID）
3. 用户的原始问题
4. `references/epistemics.md` 的 epistemics 框架
5. `references/synthesizer-prompt.md` 的 synthesizer prompt 模板

## Step 5. 呈现

把 synthesizer 的输出呈现给用户。可以为清晰做轻度编辑或补对话上下文，但**不要改写置信度措辞**。

## 输出格式

输出结构就是 `references/synthesizer-prompt.md` 里那套：The Question、The Code in Question、What We Found、What We Can Reasonably Infer、Competing Hypotheses、What We Don't Know、Sources Consulted、Confidence Summary。可按需调整，但置信度分层必须保持完整，Sources Consulted 必须保持每个 investigator 一行——包括返回空的和被跳过的，附理由。

在 Sources Consulted 块之后，如果用户的 `why` 问题是改动这段代码的前奏，把谱系发现转成适合规划改动的 Preserve / Change / Avoid / Risk 约束集。

## 要避免的常见失效模式

- **近因偏差。** 假设最近的 commit 是权威的。当前形态常是许多早期决策的沉积。往回追。

## 参考文件

- `references/epistemics.md`。置信度分层和措辞指南。synthesizer 必须遵守。
- `references/investigator-prompt.md`。investigator subagent 的基础 prompt 模板。
- `references/source-playbook.md`。指向下面各类别 playbook 的索引。
- `references/sources/*.md`。每个类别一份自足示例 playbook，外加跨类别的 `incident-postmortem.md`。给 investigator 匹配它类别的那一份，并适配到可用 MCP。
- `references/synthesizer-prompt.md`。synthesizer subagent 的 prompt 模板，含输出格式。
