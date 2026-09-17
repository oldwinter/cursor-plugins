# 把它变成你的

poteto-mode 是一个人的风格。底下的机器——playbook、路由、模型角色——套上你的风格一样好用。本页讲怎么生成个人 mode、把一次会话的教训沉淀下来、编写一个聚焦的 skill，以及在信任一次 skill 变更之前先测试它。

## 用 `/automate-me` 生成你自己的 mode

```text
/automate-me
```

你不用描述自己的风格，因为 [`/automate-me`](../../skills/automate-me/SKILL.md) 会从你的历史里把它读出来。它挖掘你在当前工作区最近的 transcript，寻找重复的偏好——你喜欢的回复方式、delegation、verification、代码、文字、流程——然后问你哪些模式真的是你。它经由 Cursor 内建的 `create-skill` 流程起草 `.cursor/skills/<your-name>-mode/SKILL.md`，把草稿过一遍 [`/unslop`](../../skills/unslop/SKILL.md)，再从 worktree 开一个 PR，让你像对待其他改动一样 review。

每当你的习惯漂移了，再跑一次：

```text
/automate-me 用这个 skill 上次编辑以来的一切更新我的 mode skill
```

update 模式只挖 skill 上次变更之后的历史。它保留你没推翻过的规则，修订有新证据的，只为真正的新模式添加小节。

## 用 `/reflect` 沉淀一次会话的教训

在刚教会你一些东西的任务之后，立刻跑：

```text
/reflect 刚才太慢了。把学到的东西沉淀下来，下次运行别再重复。
```

[`/reflect`](../../skills/reflect/SKILL.md) 把 transcript 发给三个并行 reviewer，然后由 synthesizer 把提案分进 `Accepted`、`Rejected`、`Backlog`，并在任何 skill 变更之前等你批准。只批准那种会改变未来某个决策的提案。一次奇怪的会话是轶事，不是规则。

## 编写聚焦的 skill

当你已经知道要沉淀的工作流：

```text
/poteto-mode 写一个在本仓库验证数据库迁移的 skill
```

写 skill 会匹配到 [Authoring or modifying a skill playbook](../../skills/poteto-mode/playbooks/authoring-a-skill.md)，它经由 Cursor 内建 `create-skill` 路由、校验 frontmatter 和链接，并经由 Opening a PR playbook 交付结果。面向 agent 的文字比面向人类的文字门槛更高，因为一句没写好的话会变成某个未来 agent 遵循的指令。让 playbook 守住这道门槛，别徒手裸写 `SKILL.md`。

有一个特例有自己的生成器：必须驱动你的 app 并证明行为的 skill 是 verification skill，改用 [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md) 和 [`/maintain-verification-skill`](../../skills/maintain-verification-skill/SKILL.md)。[验证并交付](./06-verify-and-ship.md#create-a-project-verification-skill)两个都讲了。

## 用 `/technical-writing` 按标准写文档

skill 不是你唯一交付的文字。docs、RFC、readme、PR 描述、commit message 都适用：

```text
/technical-writing review 这份 readme 的改动
```

[`/technical-writing`](../../skills/technical-writing/SKILL.md) 应用一套分层标准，目标只有一个：疲惫的工程师第一遍就能读懂的文字。它先判定文档的 mode（tutorial、how-to、reference 或 explanation），然后逐句打磨：谁做什么、一句一个想法、没有任何能读出两种意思的句子。用它来 review 你或 agent 刚写的东西，或者在你要一份文档时提前点名。

## 盲测一次 skill 变更

skill 编辑会影响此后每个会话，所以要把它当实验来测：

```text
/poteto-mode 对这次 skill 变更跑 eval playbook。两个变体跑同一个任务，候选保持盲态。
```

[Eval playbook](../../skills/poteto-mode/playbooks/eval.md) 围绕一种失效模式构建：观察者效应。知道自己在被评估的 agent 行为会变形。所以候选 agent 拿到的是在消毒目录里看起来自然的任务——永远看不到 "eval" 或 "candidate" 字样，也永远不知道彼此存在。一个 judge 在中性标签下给所有输出打分，链式跟随依据每个候选实际读了哪些文件来评分，而不是看它自称读了什么。

接受裁决之前自己读一遍每份输出。如果你不同意 judge，先怀疑 rubric，再怀疑自己的判断。

**陷阱：** 不要因为 skill 表现不好就在任务中途改它。把它放在自己的 PR 里修，让任务继续走。缠进 feature 工作里交付的 skill 编辑，对 review 不可见、也无法评估。

下一页：[配方与陷阱](./10-recipes-and-pitfalls.md)。
