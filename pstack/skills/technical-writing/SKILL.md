---
name: technical-writing
description: "分层技术写作标准：Diátaxis 结构、Google developer style 句式、STE 指令规则、Global English 语法。用于 /technical-writing，或写/review 文档、RFC、readme、PR 描述、commit message 时。"
disable-model-invocation: true
---

# Technical writing

目标是写出让疲惫的工程师一遍读懂的文字。四层到达那里，每层一个问题：这是什么类型的文档、句子怎么称呼读者、每句承载多少、有没有句子能读出两种意思。四层都用。

三条规则坐在层之上：

- **删掉每个不干活的词。** 句子少了它还成立，它就走。"In order to" 就是 "to"。"It is important to note that" 什么都不是。
- **用短而日常的词。** "use" 不 "utilize"。"help" 不 "facilitate"。"do" 不 "perform"。长词要靠精确买回它的长度。
- **规则让句子变差时，换个修法或放过它。** 规则服务读者。每条规则都遵守却读着像机器写的句子是失败的。

代码库就是词表。写真实的符号、文件、flag 或命令名，不写同义词或对它的描述。

不要发明行话。用开发者会念出口的词："move"、"delete"、"a budget that only decreases"，而不是 "evacuate"、"ratchet"、"endgame"。文档第一次说清含义时命名模式没问题。发现新的违规词时，在你的回复里把"违规词+替换词"作为 `unslop` 抽象比喻规则的补充提议出来并附 diff——不要直接改那个 skill。

## 变化节奏

各层决定文档说什么、每句承载多少。一份全守住了仍可能读着像机器写的文档：每句都剪得短、到处没观点、没有具体的东西。

- 有意混用句长。短句落地一个点。从容的长句承载一个带条件或后果的事实。
- 一句一个想法不等于一句一个长度。承载两个想法的句子拆开。承载一个的长句留着。
- 模式允许的地方要有观点。explanation 要权衡取舍——说出你怎么看，而不是列利弊清单。reference 保持干。
- 具体优于无菌。不写 "schema changes can cause issues"，写 "a column rename fails the build"。

## 先选模式（Diátaxis）

一份文档一个模式。两个问题选定它：内容是服务行动（doing）还是理解（thinking），服务学习还是工作？

- 行动 + 学习：**tutorial**。
- 行动 + 工作：**how-to**。
- 理解 + 工作：**reference**。
- 理解 + 学习：**explanation**。

罗盘可用于整份文档，也可用于单个句子。

**Tutorial：做中学。** 你是老师。学习者的成功是你的职责，不是他们的。开头说学习者将做出什么，不是将"学到"什么。每一步产出可见结果，早给、常给。告诉他们该看到什么：预期输出、prompt 变化、那行日志。解释压到一个从句加一个链接。教学性停顿打断课程。保持具体。以 "we" 写作，祈使句："First, do x. Now, do y."

**How-to：通往目标的步骤。** 解决人遇到的问题，不是机器能执行的操作。假定能力。跳过教学。只给行动：不跑题、不铺背景、不为完整而完整。那些用链接。允许分岔和判断："If you want x, do y."用任务给指南命名："How to calibrate the radar array"，不是 "Radar array calibration"。

**Reference：供查阅的事实。** 描述。只描述。不指导、不劝服、不观点。干、全、确定。陈述事实、选项、限制、错误，不含糊。镜像所描述事物的结构，让代码和文档能对照导航。材料放在读者预期的地方。能由代码生成就生成，保持为真。

**Explanation：理解与为什么。** 一个有界的主题，离开产品也能读。每个标题应能容忍前面加隐含的 "About..."。锚在真"为什么"问题上。给上下文：设计决策、历史、约束、备选。观点只许在这里出现。

别混模式：tutorial 里不塞 reference 表，reference 里不做手把手，how-to 里不争论。拆开加链接。

来源：diataxis.fr，2026-07-18 抓取。

## 对着读者写句子（Google developer style）

- 以 "you" 称呼读者，用现在时。"Will" 只给真正稍后发生的事。
- 说清谁做什么："the compiler checks"，不是 "is checked"。只在施动者未知或无关紧要时用被动。
- 指令写成命令："Click Submit."。事实平铺直叙。绝不写 "should be done"。
- 条件放指令前："To delete the document, click Delete."读者跳过不适用的。
- 常见情形放前。例外放后。
- 读起来像懂行的朋友。不用 buzzword、不用比喻、指令里不用 "please"，过程里绝不写 "simply"、"easy"、"quickly"。真简单的话读者不会在这。
- 不预告（"we will soon support..."），连续句子不用同一短语开头。
- 链接文字要说清链到哪：页面标题或简短描述。绝不 "click here"。优先在页面上给一句上下文，而不是把读者链走。
- 标题承载要点而不只是主题（"Pick the mode first" 而非 "Modes"）。句子式大小写。任务标题是裸动词短语（"Create an instance"）。概念标题是名词短语。一页一个 h1，不跳级。
- 序列用编号列表，其他用 bullet。用完整句子引出列表。条目保持平行。
- 代码用 code 字体。UI 元素用粗体。用 serial comma。删掉 "etc."，列表不全就在开头声明。

来源：developers.google.com/style，2026-07-18 抓取。

## 让陈述一次只载一件事（STE 规则）

- 每句一条指令。其他地方每句一个想法。
- 指令超过约 20 词、其他句子超过约 25 词就拆。
- 警告或条件放它守护的步骤之前："If hot oil touches your skin, injuries can occur."
- 保留 "the" 和 "a"："Remove backup file" 有两种读法。"Remove the backup file" 只有一种。
- 每个词一个含义一个职责，然后守住。"check" 意思是 inspect，就别也拿它当 restrain。
- 每个动作选定一个词不换："start"，别这里 "start" 那里 "initiate"。
- 过程写成直接命令，绝不叙述、绝不被动："Install the component"，不是 "the component must be installed"。
- 能避就避 "-ing" 词。它们承担太多语法角色，滋生误读。

来源：asd-ste100.org（Issue 9, 2025），2026-07-18 抓取。编号规则和词典在 spec PDF 里。上面是可迁移的核心原则。

## 不留能读出两种意思的句子（Global English）

- "only"、"not" 这类词贴着它改的那个词放："only fails on growth" 和 "fails only on growth" 说的不一样。
- 拆开长名词串："the proto import budget check script" 变成 "the script that checks the proto-import budget"。
- 每个 "it"、"they"、"this" 指向一个显然的东西。拿不准就重复名词。绝不用 "this" 或 "which" 指整个从句。
- 别丢动词："Phase 1 moves the converters and Phase 2 the runtime" 让 Phase 2 没了动词。给它一个。
- 保留显结构的小词。"Ensure that the switch is off" 留着 "that"，因为它让句子只有一种解析。绝不用清晰换字数。
- 系列里重复冠词能防误读就重复："the client and the host"，两个东西时不是 "the client and host"。
- 句子能两两成组时说清 "and"/"or" 连接哪几个。"Both...and"、"either...or"、"if...then" 是免费的消歧器。
- 用句号不用分号。em dash 换成新句子。
- 括号里的文字要是完整语法单位或独立成句。绝不用 "(s)" 凑复数。
- 不用斜杠：写 "a, b, or both"，不写 "a/b" 或 "and/or"。
- 每个东西到处叫同一个名字。一份文档对同一东西说 "the gate"、"the ratchet"、"the budget check" 等于教了三件事。编辑间改写没变的句子同样花代价。没变的别搅。
- 跳过习语、口语、拉丁缩写和比喻。非母语读者、译者、agent 都最容易解析平直结构。

来源：Kohl, The Global English Style Guide (SAS Press)。指南文本 2026-07-18 取自 Internet Archive 和 SAS 样章。

## 语气和仓库细则

- 本 skill 碰过的每份文档都过 **unslop** skill。那个 skill 拥有 slop 模式目录：AI 词汇、填充、对冲、格式破绽。
- PR 描述和 commit message 也是写作。除 Diátaxis 外每层都适用。PR body 是 reviewer 一分钟内读完的简报。不贴 swarm 日志、SHA 清单、指标表。链接它们。
- 产品 UI 文案不是文档。那些用你产品的 copy 指南。
- 代码片段用 tab 缩进。写真路径真符号。每个计数或树的声明在落地它的 commit 上为真，并附上能重新生成它的命令。

## 实例

改前：

> Configuration of the proto import ratchet budget script parameters is performed via budget.json. Note that it's important to remember that running with --write, which updates the committed budget to reflect the current count, should only be done when lowering it. If exceeded, CI fails.

改后：

> `budget.mjs` reads the committed budget from `budget.json` and counts the files that import protos. If the count exceeds the budget, CI fails. Run `budget.mjs --write` only to lower the budget.

## Review checklist

对本 skill 覆盖的任何散文适用。第 1 条只对文档集合适用：

1. 每个文件是一个 Diátaxis 模式，模式相接处有链接吗？
2. 每条指令都写成命令、条件在前吗？
3. 有句子承载两条指令或两个想法吗？拆。
4. 有删掉不丢意思的词吗？删。
5. "only" 贴着它改的词吗？每个 "it" 指向一个东西吗？每个从句都留着自己的动词吗？
6. 每个东西在所有文档里恰好一个名字吗？
7. 开发者会把这些词念出口吗？把发明的比喻和花哨同义词换成平常的词或真实符号名。
8. 所有符号、路径、计数在本 commit 为真吗，附了能重新生成计数的命令吗？
