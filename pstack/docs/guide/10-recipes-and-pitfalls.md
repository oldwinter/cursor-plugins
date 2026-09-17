# 配方与陷阱

值得抄的 prompt，然后是每个人都会犯一次的那些错误。换上你自己的路径和完成条件。配方刻意写得随意——实际就是这么敲进去的，skill 读得懂意图。

![她品尝做好的菜，机器人们照着配方卡盒做菜，台面上方钉着写着 /how、/tdd、/loop 的卡片。](./images/recipes.jpg)

## 理解一个不熟悉的子系统

```text
先用 /how 搞懂这段初始化是怎么工作的。再用 /why 弄清它最近为什么坏了。
```

先机理，后历史。每个 skill 的报告都会告诉你它搜了哪些来源，让你知道答案立在什么上。

## 给一个设计要第二意见

```text
让 /arena 给这个讨论串和我们的方案出个第二意见
```

你当下的设计变成若干候选之一，综合结果会告诉你 panel 找到了更好的还是确认了你已有的。在高价承诺之前的廉价保险。

## 并行检查相互独立的切片

```text
/swarm 对照各自的 check.sh 检查 packages/ 下每个包。一个包一个 worker。一份报告。
```

每个 worker 拥有一个包。父 agent 等所有切片返回，给出一份 `PASS`、`ISSUES` 或 `BLOCKED` 报告，而不是原始 worker 倾倒。

## 带着怀疑 review 一个 branch

```text
/interrogate 整个 branch，但要带着怀疑眼光。先别改任何东西。除非是真正的 bug 或行为 regression，否则别挑刺。
```

这些限定词在干实事。"先别改任何东西"让它保持只读，nitpick 规则预先滤掉噪音，让 `Act on` 档的发现值得你花时间。

## 通过一个失败测试修 bug

```text
/poteto-mode 先复现重复写入。如果有便宜的测试路径就 /tdd。然后修复并重跑。
```

"如果有便宜的测试路径"这句要紧。靠脆弱 mock 硬憋出来的测试，证明力不如直接跑真实命令——playbook 被允许这么说。

## 离开时让 run 保持诚实

```text
我要去睡了，自主继续直到每个 fixture 通过。不要停。记一份我早上能审计的决策日志。
```

完整契约在[overnight 一页](./07-overnight.md)。当任务和完成条件已经在对话里时，用短格式就行。

## 把跑偏的 run 扳回来

掌舵 prompt 只要一行：

```text
我说了目标是复现。我还没让你修。
```

```text
应用 prove it works。给我看真实输出，不是 build 日志。
```

```text
/unslop 那段，不要用破折号
```

你很少需要更多字。你需要的是正确的名字——[principles 一页](./08-principles.md)就是词汇表。

## 让它用大白话回复

```text
/bro
```

这就是全部 prompt。[`/bro`](../../skills/bro/SKILL.md) 把上一条消息像人对人说话一样重述，不带术语、更短。当一条回复技术上很完备而你仍然不知道它说了什么时用。

## 陷阱清单

- **在 prompt 里罗列 skill。** "先用 /how 再 /architect 再 /arena" 会重排 playbook 已经排好的步骤。陈述目标和约束就好。只为覆盖默认值才点名 skill。
- **含糊的完成条件。** "把它弄好点" 没给 `/loop` 任何可检查的东西。给一条能 pass 或 fail 的命令或制品。
- **多个并行 agent 挤在一个 worktree。** 它们互相覆盖，diff 变成考古现场。说一句"每个尝试独立 worktree"，隔离就是免费的。
- **拿 `/arena` 当覆盖率工具。** `/arena` 重复同一份设计或代码 brief，然后选 base 并嫁接最好的部分。`/swarm` 切分切片或声明好的 race 分支，并汇总一份报告。
- **照单全收每条 review 评论。** bot 和人类都把真正的抓捕和噪音塞进同一个列表。`/interrogate` 把发现分进 act-on 和 dismissed 两档并附理由，两个方向你都可以推翻。
- **把 `auto` 当成模型 slug。** `auto` 和 `inherit-parent` 意思是"省略 model 字段，让 subagent 继承父聊天模型"。角色配置见[安装一页](./01-setup.md)。
- **拿绿色 build 当成功上报。** build 只证明能编译。要真实命令、流程、存下的值或 profile，并期待回复里带证据。
- **徒手裸写 `SKILL.md`。** 经由 [Authoring or modifying a skill playbook](../../skills/poteto-mode/playbooks/authoring-a-skill.md) 走，让校验和 review 发生。

指南到此为止。如果你是跳读来的，回到[安装](./01-setup.md)跑一个真实任务。习惯来自使用，不来自阅读。

回到[指南索引](./README.md)。
