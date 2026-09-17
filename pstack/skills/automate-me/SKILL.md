---
name: automate-me
description: "用于 “automate me”、“创建/更新/刷新我的 -mode skill”、“把我的偏好或工作风格做成 skill”，或想让 agent 按用户的方式工作。经由 create-skill + unslop 起草或修订一份个人 -mode skill，可选地从最近 transcript 提取新证据。"
disable-model-invocation: true
---

# Automate me

把用户的工作惯例变成 agent 会遵循的 skill 的引导流程。产出是一份为他量身定制的 `-mode` skill（如 `jay-mode`、`priya-mode`）。

本 skill 编排另外三个：内联挖掘（见步骤 1）、Cursor 内建 `create-skill`（编写）、**unslop** skill（文字纪律）。它负责排序，不替代它们。

## 流程

### 0. 检查已有 skill

递归查找 `.cursor/skills/**/*-mode/SKILL.md` 和 `~/.cursor/skills/*-mode/SKILL.md` 中匹配用户 handle 的。mode skill 可以住在个人类别目录（`.cursor/skills/<handle>/`），不只顶层。已存在就用 `AskQuestion` 确认意图（除非用户已经说了"update my skill"之类）：

- 更新现有 skill（重复运行的默认）
- 从零开始（罕见，做之前问为什么）

update 模式会改变后续流程：
- 步骤 1 只挖 skill 上次编辑以来的历史（`git log -1 --format=%cI <path>`）。
- 步骤 2 问什么变了、缺什么，而不是从零要捕获什么。
- 步骤 4 就地编辑现有文件。保留用户没推翻过的小节，修订有新证据的，只为真正的新规则加新节。

### 1. 挖掘历史

fan out 之前先定位当前工作区的 transcript。系统提示里有该工作区的 `agent-transcripts/` 目录，只用那个路径。不要 glob `~/.cursor/projects/*/`——那会跨越工作区边界、读到无关项目的私密聊天。

在该范围内调查最近的 agent 对话找重复模式。并行跑多个 subagent 分片扫历史（如最近 2-4 周，切成 3 片让每片材料够厚）。每个分片挖掘 subagent 读父级提供的工作区路径下的 transcript，找下面的信号，返回它看到的模式的简短结构化清单并附证据指针。默认值得找的信号：

- 回复偏好（长度、语气、格式、"说人话"类纠正）
- 委托习惯（subagent、模型、专门化工作流、并行度）
- 验证姿态（什么叫"done"、单测 vs 实机复现、reviewer）
- 代码与文字纪律（风格、引用的原则、lint/format 工具）
- 流程惯例（worktree、commit、PR、review/merge 工具）
- meta 偏好（任务中途修 skill、提议新 skill）

提升某个信号之前跨切片交叉验证。出现在 2+ 切片的模式是高置信的；孤立信号很弱，通常丢弃。

### 2. 直接问用户

挖掘抓不到还没浮现过的意图。用 `AskQuestion` 工具（结构化多选）而不是让用户徒手敲字。

形态：一两道题、每题 4-6 个选项，类别题用 `allow_multiple: true`。先宽泛（"哪些方面最重要？"），再对选中的方面用具体选项追问。结构化轮次之后，一道自由聊天题接住选项漏掉的东西。

别一次倒 20 道题。

### 3. 聚类发现

把合并的信号分组成小节。常见的（只用适用的）：

- **Response style**：长度、语气、格式。
- **Autonomy**：不问就做多少、MCP 工具使用。
- **Understand first**：圈定范围或调查改动时先用哪些 skill。
- **Subagents**：默认值、并行、模型-任务配对、专门化工作流。
- **Prose / code discipline**：原则、lint 工具、风格指南。
- **Review and verify**：复现姿态、verification skill、实测工具。
- **Process**：git worktree、commit、PR、review/merge 工具。
- **Skills**：写 skill 的习惯、先修 skill 再说、提议新 skill。

**poteto-mode** skill 是形态参照。读它拿粒度感，别抄内容——用户的规则和 poteto-mode 的不一样。

### 4. 起草 skill

用 Cursor 内建 `create-skill` skill 来写。放置：

- 路径：已有 mode skill 保留其类别。新 mode：仓库已为该 handle 建立个人类别时用 `.cursor/skills/<handle>/<handle>-mode/SKILL.md`；否则默认项目里 `.cursor/skills/<handle>-mode/SKILL.md`（用户想要个人 skill 时用 `~/.cursor/skills/<handle>-mode/`）。
- Handle：用户的名或自选标识。
- Frontmatter `description`：触发词写"他们的名字 + `/<handle>-mode` + work in their style"，不要写 "write code"、"review PR" 这种泛关键词。
- Frontmatter 格式：遵守 `create-skill` 的 YAML 规则。`description` 保持单个 YAML scalar；有标点或换行需要时加引号，或用 `description: >-` 加缩进续行。
- Frontmatter 默认 `disable-model-invocation: true`。只有用户明确想让 mode 每轮都应用时才去掉。

### 5. 打磨文字

对每一行应用 **unslop** skill 和 `create-skill` 的写作指南。

把草稿给用户看并收反馈。预期多轮迭代。无情地删。mode skill 不是说明书。

### 6. 落地

在 main 上开的 worktree 里工作。commit 并开 PR。别直接推 main。

## 护栏

- **别对单次对话过拟合。** 说过一次又自相矛盾的偏好是噪音。写成规则前要求多个实例。
- **别抖机灵。** 复述其他 skill 的内容、发明比喻、为 agent 读者写"诗意"散文，都是没收益的成本。保持可操作性。
- **引用，别内联。** 用户依赖的其他 skill 应以路径引用出现，不贴摘录。他们在别处维护的原则文档同理。
- **小节保持最小。** 只有用户在某个方向有具体的、非默认的规则才加那节。"Communicate clearly"不算一节；"短段落。对比选项用表。条目真正平行才用 bullet。"算。
- **惯例写通用的。** 祈使句里用"the user"或"the human"，不用作者的名字。
- **别强凑对称。** 用户没有值得写下的流程规则，就整节跳过 Process。

## 评估

`-mode` skill 是主观产物。`create-skill` 式的 test/iterate benchmark 循环在这里没用。和用户 vibe-check：读起来像不像他？漏了什么？然后交付。

只有当 skill 的触发准确率在实践中真成了问题，才跑 description 优化循环。

## 什么时候别用

- 用户要的是任务专用 skill（不是工作惯例）：单用 `create-skill`，不用挖掘。
- 用户想捕获一条窄工作流（如"我怎么写 commit message"）。那是普通 skill，不是 mode skill。
