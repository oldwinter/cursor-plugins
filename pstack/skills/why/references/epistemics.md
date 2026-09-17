# Epistemics（认识论）

当证据是历史的、碎片的、有时互相矛盾时，如何推理置信度，以及如何传达它而不把它压成虚假确定性。

代码自身不携带动机。你能读出代码*做什么*，读不出它*为什么存在*。那活在 commit、PR、ticket、doc 和对话里——全都不完整、带偏向、有时整个缺失。假装不是这样，就会产出误导用户的、听着自信的猜测。

## 置信度分层

最终输出里的每个断言必须落在这些层级之一。层级决定断言进哪一节、怎么措辞。

### 1. Direct

一条明确回答问题、有文本出处的引用。不是"代码做了 X 所以作者一定想要 X"。是某个作者确实*写下*了为什么。

示例：
- PR 描述写着 "this fixes the bug where users with >1000 items couldn't paginate"
- ticket 写着 "we're adding this because customer Acme requested it in their security review"
- 代码注释写着 "// clamp to 100 because the upstream API rejects larger values"
- 设计文档写着 "we chose option A over option B because we need persistence across restarts"
- 作者的聊天消息说 "switching to this approach since the old one was flaky in tests"

措辞：自信、现在时。"This exists because X." 标注来源。

### 2. Supported

多条间接证据收敛。没有单一来源明说过，但跨来源的模式让它很可能成立。

示例：
- PR 标题说 "improve performance"，ticket 打着 "perf" 标签，周边 commit 全碰同一条热路径
- 随同改动加了多个测试，全都用超大输入压边界情形
- 作者同一周的其他 PR 在描述里都提到同一次 incident

措辞：自信但明显是推得的。"The evidence points strongly to X: [the specific pieces]." 引用多个来源。

### 3. Inferred

对上下文的合理读法，但没有任何东西明确支持它。读者应当明白这是*你的解读*，不是记录里的事实。

示例：
- PR 没说为什么，但鉴于错误当时在生产发生（按 incident 频道时间线）且修复很急（当天合并），它大概是个 hotfix。
- 函数名暗示 retry 逻辑，重试次数是 3，与代码库别处"3 次重试"的团队惯例一致。

措辞：对冲。"It appears"、"likely"、"suggests"、"is consistent with"、"one reading is"。让推断链显式："Given A and B, C seems likely because D."

### 4. Speculative

一个讲得通的假设，但证据稀薄且其他解释同样成立。呈现这些有价值，但要明确标为猜测。

示例：
- "This might be a workaround for a browser bug that's since been fixed, but we found no contemporary evidence of that."
- "It's possible this threshold was chosen to match an SLA commitment, but no SLA doc references it."

措辞：显式投机。"One possibility is X, but we have no direct evidence."通常住在 "Competing Hypotheses" 一节，和其他可能性并排。

### 5. Unknown

你找了但找不到。这是一个有效且重要的结果。记下来。

措辞："We searched X, Y, and Z and found no evidence of why." 具体写*搜了什么*。"We couldn't find out" 不如 "we searched the ticket tracker with keywords A and B, scanned the 6 PRs that touched this file since 2023, and grep'd the repo for string literals matching the threshold. None surfaced a rationale."

## 措辞指南

### 携带置信度的词。小心使用

这些词隐含 **Direct** 或 **Supported** 置信度。别拿它们写推断。

- "because"。隐含一个有证据的因果断言
- "the reason is"。同上
- "was designed to"。声称了作者意图
- "fixes"、"addresses"、"solves"。声称改动达成了目标
- "the team decided"。声称发生过一次集体决策

用这些词时，紧邻位置就该有一条 citation。

### 对冲的词。用于推断

- "appears to"
- "seems to"
- "likely"
- "suggests"
- "is consistent with"
- "one reading is"
- "plausibly"
- "may have been"
- "the evidence points toward"

这些词表明你在解读而不是在报道。在 "What We Can Reasonably Infer" 一节放开用。

### 要避免的词

- "obviously"。真显然的话用户不会问
- "clearly"。几乎总是出现在一个并不清楚的断言前面
- "of course"。同上
- "just"（比如 "it's just X for performance"）。轻蔑，且通常掩盖不确定性
- "I think" / "I believe"。你在综合证据，不是发表个人意见。改用 "the evidence suggests"

### 避免合理化

今天"讲得通"的代码，当初可能是为不再成立的理由写的，或写的时候理由就是错的。别把一套干净的理由回贴到 messy 的历史上。

抵制这些冲动：
- 假设作者做了"对的"事然后倒推合理化
- 假设代码库里一致的模式是有意的——它可能只是复制粘贴
- 把没有证据变成缺席的证据（"没人提过安全问题，所以安全一定不是问题"）

## 谄媚陷阱

用户常在 `why` 问题里嵌入假设："Why do we do it this way, I assume it's for performance?" 别顺手确认。把它当作候选之一，独立对照证据。证据支持它，就带引用地说支持；不支持，就如实说并摆出证据*确实*支持的东西。

用户的猜测是调查的引子，不是要验证的结论。

## 证据互相矛盾时

两个来源不一致（PR 描述说一套，ticket 说另一套），两个都摆出来。别选故事更整齐的那个。典型模式：

- **ticket 说** "we need this for customer X's compliance requirement"
- **PR 说** "cleaning up tech debt in this area"

两者可能都成立（ticket 驱动了工作，PR 是作者对它的框法），也可能有一个是错的。各自带引用摆出来，让用户做判断。

## 证据缺失时

诚实的"we don't know"是这个 skill 能产出的最有价值输出之一。用户由此知道：

- 答案不在显而易见的地方
- 他们得去问人（原作者、product owner、team lead）才能弄清
- 或者他们可以判定这问题不值得再追

漏标缺口并用自信的猜测填上，是在实际伤害用户——他们会按猜测行动。

撞上缺口时，具体命名它：
- 你想回答的问题
- 你搜过的来源
- 每个来源里搜了什么
- 你找到了什么（一无所获，或只有沾边的材料）

## 定稿前的校准检查

交付输出前，synthesizer 应逐条检查 "What We Found" 和 "What We Can Reasonably Infer" 里的断言并问：

1. 这条断言有 citation 吗？没有就补一条，或挪到 "Inferred" / "Hypotheses"。
2. 措辞和层级匹配吗？（Direct 断言可以用 "because"，Inferred 不行。）
3. 我有没有把代码当作它自己意图的证据？有就删掉或重新归类，那不是证据。
4. 输出里有 "What We Don't Know" 一节吗？没提任何缺口就可疑：要么证据罕见地完整，要么有东西被扫进地毯下了。
