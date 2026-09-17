# Linear Ticket

## 这个来源包含什么

- 描述功能、bug 及其动机的 issue
- 挂在 issue 上的项目文档（常是 PRD 或 spec）
- 父子 issue 关系（更大的 initiative → 具体 ticket）
- issue 上的评论（澄清、scope 变更、"我们为什么做这个"的理由）
- 标签（如 `compliance`、`customer-request`、`perf`），标示动机类型
- 解释 scope 变更的状态更新
- 附件和链接的 GitHub PR

Linear 常是产品/业务上下文所在的那一层："我们做这个是因为客户 X 提了"或"这是 Q3 合规 initiative 的一部分"。

## 怎么搜

用 Linear MCP。

1. **从被链接的 ticket 开始。** 种子 commit 或 PR 引用了 ticket ID（如 `ENG-1234`、`[BUG-567]`），先用 `get_issue` 拉这些。读完整 issue 含评论。
2. **按关键词列相关 issue。** 用 `list_issues` 文本搜索功能名、关键符号或业务术语。多试几种措辞。
3. **走 issue 树。** 落在子 issue 上就去拉它的父级。子 issue 是战术层的，"why"常在父级身上。
4. **读项目文档。** issue 属于某个 project 时用 `get_project` 并查所附文档。spec 和理由最常记录在 project 级文档里。
5. **查标签和 milestone。** 标签暗示动机类别（customer-request、incident-followup、compliance）。milestone 把工作绑到 deadline，经常揭示动机。

## 这里什么样的证据算好

- 陈述业务问题的 issue 描述："Customer Acme needs X because of their SOC2 audit"
- 记录了决策的评论："We decided to go with approach B because approach A would require touching the billing service"
- 标题像 initiative 的父 issue："Q3 Enterprise Readiness"、"Reduce Payment Failures"
- 附上的 PRD 或 spec
- `customer:acme`、`incident-followup`、`compliance`、`perf-regression` 这类标签

## 常见坑

- **Scope 漂移。** PR 引用的 ticket 可能曾被关闭又以不同 scope 重开。读完整历史。
- **机械模板。** 有些团队要求填 "Why" 一节但填的是样板。通用话术（"improve user experience"）多半不是真答案。
- **过期 ticket。** 旧 ticket 常反映已变更的旧版计划。核对日期并和代码发布日交叉对照。
- **Closed-as-duplicate 链。** 沿 duplicate-of 关系回到 canonical ticket。
- **私有工作区内容。** 访问不了某 issue 就记为缺口，别猜。

## 返回什么

每个相关 ticket：
- ticket ID 和标题
- 从描述或评论**引用**的问题/动机原文（不要转述——synthesizer 需要精确文本做 citation）
- 标签、父 issue、project
- 作者、创建日期、关闭日期
- ticket 链接（如有）
