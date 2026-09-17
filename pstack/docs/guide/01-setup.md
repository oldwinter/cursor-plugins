# 安装 pstack

本页你会安装 plugin、挑选 pstack 使用的模型，并跑通你的第一个任务。Setup 就是一条命令加一段简短对话。

## 安装 plugin

在 Cursor 聊天中运行：

```text
/add-plugin pstack
```

Cursor 会确认 plugin 已安装。

## 挑选模型

运行：

```text
/setup-pstack
```

[`/setup-pstack`](../../skills/setup-pstack/SKILL.md) 会检测你有权访问的模型，询问 reasoning budget，向你展示每个角色（code 委托、judgment、review panel），并询问你的选择。回答问题即可。它会写入 `~/.cursor/rules/pstack-models.mdc`——一条每个 pstack skill 都会读取的小 rule。

你只覆盖自己关心的部分。在 rule 里没有对应行的角色会保留 skill 的默认值。以后想恢复默认值，删掉那个角色的那一行，或者直接再跑一遍 `/setup-pstack`。

你可能会好奇用 Auto 会怎样。把某个角色设为 `inherit-parent` 或 `auto`，pstack 就会省略 subagent 的 `model` 字段，让 subagent 继承你父聊天的模型。两个值含义相同，也都不是模型 slug。对于 panel 角色，这个值是一个列表，每个条目各跑一个 subagent，所以列表长度决定 panel 规模。Setup 还会配置 `swarm workers`，即每个 `/swarm` worker 的默认模型——除非某次 race 为每个分支单独指名了模型。

## 接受 verification 提议，或不接受

在 setup 结尾，`/setup-pstack` 会在你的项目里寻找能证明 app 行为的手段——一个 `verify-*` skill 或一套现成的 harness。如果两者都没找到，它会提议一次：用 [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md) 生成一个。

答应的话，它会写出 `.cursor/skills/verify-<app>/`——一个项目本地的 skill，教 agent 像用户一样驱动你的 app，并在交付之前先证明它自己能跑通一次。拒绝的话 setup 就继续往下走。你随时可以自己运行 `/create-verification-skill`。[验证并交付](./06-verify-and-ship.md#create-a-project-verification-skill)讲了它什么时候值得存在。

setup 结束后，开一个新聊天。模型 rule 对新会话生效。

## 跑你的第一个任务

挑一件真实但小的事，用你跟同事描述的口气描述它：

```text
/poteto-mode 给这个命令加一个 --json flag。text 输出保持逐字节一致。两种都验证。
```

观察 todo list。它最前面的条目就是匹配到的 playbook 的步骤，逐字复制进来的——对这个 prompt 来说是 Feature playbook。如果 `/poteto-mode` 跳过某一步，该步骤会带着 `skip: <reason>` 留在列表里，所以你能看清它选择不做什么。

从这里开始你可以正常追问。`/poteto-mode` 是 sticky 的：它会对整段对话保持开启，直到你明说退出。

下一页：[通过 `/poteto-mode` 路由工作](./02-poteto-mode.md)。
