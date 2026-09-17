---
name: unslop
description: Cut AI tells from any writing. Must always apply.
disable-model-invocation: true
---

# Unslop

编辑文本去掉 AI 模式。

## 流程

1. 扫下面的模式。
2. 改写。保含义，配预期语气。
3. 自审："什么让这一眼就是 AI 写的？"修掉剩余破绽。

## 要检测和修的模式

规则编号是稳定 id，其他 skill 引用它们。删掉一条规则会留下缺口。

### 内容

3. **表面的 -ing 短语。** "highlighting..."、"ensuring..."、"reflecting..."、"showcasing..."、"fostering..."。删掉或用真实出处展开。
5. **含糊的归因。** "Experts believe"、"Industry reports suggest"、"Some critics argue"。点名出处或删掉。

### 用词

7. **AI 词汇。** Additionally、crucial、delve、enduring、enhance、fostering、garner、interplay、intricate、landscape（抽象义）、pivotal、showcase、tapestry（抽象义）、testament、underscore、vibrant。换成平常的词。
8. **花哨的 "is"。** "serves as"、"stands as"、"boasts"、"features"。直接说 "is" 或 "has"。
9. **"Not just X, but Y."** 直接陈述要点。
10. **三段式。** 把想法硬凑成三个一组。用自然的数量。
11. **同义换词。** 同一段里 protagonist、main character、central figure、hero 轮着用。选定一个，重复它。
12. **假区间。** "from X to Y" 而 X 和 Y 不在有意义的尺度上。直接列主题。

### 风格

13. **em dash 滥用。** 完全不用 em dash。只用句号或逗号（不用括号、不用 en dash、不用连字符冒充破折号）。想法需要分隔就结束句子或用逗号。
14. **冒号滥用。** 列表或例子前的冒号没问题。句中连接符不行。"If you're coming from traditional automation: instead of registering event handlers, you describe conditions" 里的冒号没加任何东西。改写成要点自己站得住、不靠对比框定："Describing when the scheduler should fire works best as plain English."意思相同，没了拐杖标点。
15. **粗体滥用。** 别给每个专名或缩写都加粗。
16. **内联标题式列表。** 破绽是粗体标签加冒号复述整行："**Performance:** Performance improved..."。这种改成散文。以句号收尾、点名条目、后面跟真正新细节的粗体引导（"**Schema in TypeScript.** Tables live in one file."）没问题，不是破绽。
17. **标题式大小写。** 用句子式大小写。
18. **装饰性 emoji。** 从标题和 bullet 里去掉。
19. **弯引号。** 换成直引号。

### 对话腔残留

20. **聊天机器人短语。** "I hope this helps!"、"Let me know if..."、"Of course!"、"Certainly!"、"Found the smoking gun!"删掉。
22. **谄媚语气。** "Great question! You're absolutely right!"直接回答。

### 填充

23. **填充短语。** "In order to" 变 "To"。"Due to the fact that" 变 "Because"。"It is important to note that" 删掉。
24. **过度对冲。** "could potentially possibly be argued that it might" 变 "may"。
25. **空洞收尾。** "The future looks bright."写具体计划或事实。

### 行话

26. **抽象比喻名词。** Substrate、wedge、vector、locus、vantage、nexus、primitive（作名词）、harness（作比喻）、surface（如 "API surface"）、bedrock、scaffolding（作比喻）、modality、paradigm、gold-plating、ratchet（作比喻）、evacuate（指移动代码）、endgame、north star、flywheel。这些读着技术，但通常有更平实的具体词。"Substrate" 变 "base"。"Wedge in" 变 "add"。"Vector" 变 "way" 或 "method"。"Gold-plating" 变 "more than the job needs"。"Ratchet" 变机制的真名或 "a limit that only tightens"。"Evacuate" 变 "move out"。"Endgame" 变 "the last phase"。选具体的词。

### 口语化直写

27. **说它做什么，不说它感觉如何。** "the database stays close at hand"、"SQL you can read"、"types that follow your schema" 说的是一种感觉。改法是说机制或数字："`.toSQL()` returns the exact string sent to the database"、"a column rename fails the build"。问这句要读者做什么或知道什么，然后写那个。没法重述成具体指令、事实或数字就删掉。再查一遍：这句能原封不动出现在别的项目文档里，它就没说这个项目任何事。删掉。
28. **密实的句子缩短或拆开。** 读者要回头重读才能解析的句子，拆成两句或删从句。一句一个想法。
29. **主动语态。** 优先。抓 "is/are/was/were + 过去分词"，点名施动者："queries are validated" 变 "the compiler validates queries"，"the file is parsed by the loader" 变 "the loader parses the file"。只在施动者未知或真不重要时用被动。
30. **删副词，或换更强的动词。** "runs quickly" 变 "is fast" 或给数字。"significantly improves" 变实测差值。副词撑着弱动词说明动词选错了。
31. **优先平常的词。** "utilize" 变 "use"、"leverage" 变 "use"、"facilitate" 变 "help"、"numerous" 变 "many"、"in the event that" 变 "if"。更花哨的同义词很少更清楚。
32. **做作的散文。** 存在字面说法时用比喻或花活：格言式（"wire it or delete it"）、为效果而写的修辞碎片、拟人化代码（"the plan holds it"）、比喻动词（"rides along"、"stands on"）、套话框架。"A dial worth turning" 变 "a parameter worth varying"。说你的意思。规则 26 管比喻名词。
33. **过度压缩。** 丢冠词、无动词碎片、符号腔、让读者解码而非阅读的缩写。"Parser rejects bad date → exit 2, no write" 变 "The parser rejects a bad date, exits with code 2, and writes nothing."写完整的句子，带上冠词和动词，箭头和缩写拼出来。
