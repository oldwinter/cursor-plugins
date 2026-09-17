# pstack

我是 [poteto](https://x.com/poteto)。我不是什么总裁或 CEO，但我在 Meta、Netflix 和 Cursor 经手过数百万行代码。我也是 React 核心团队的成员，参与构建和维护 React Compiler。

越来越多的人觉得 AI 写了太多 slop 代码（粗制滥造的代码）。我同意。我不想像一个二十人的 slop 艺术家团队那样交付。没有质量保障的吞吐量不是我追求的目标。if you want to go fast, go deep first——想走得快，先往深处走。

**pstack 就是我的答案。** 这些是我每天在 Cursor 交付高质量代码时实际使用的同一批 skill。它能把 Cursor 变成一支真正的工程团队。目标不是最大化 loc，恰恰相反：pstack 帮你写更少、但更高质量的代码。

**pstack 给你无所畏惧的并行能力。** 当你能让一个 agent 深入到底、并信任它写出好且可验证的代码时，你才能真正放心地并行。用 `poteto-mode` 同时启动多个 agent，相信它们会把严谨的工程原则应用到各自的工作中。

**Cursor 让你集各家之长。** 每个前沿模型都有自己的强项和短板。pstack 可以搭配任何模型使用。事实上，我的很多 skill 都使用 multi-model 工作流，以发挥每个模型的独特优势。

fork 它，改进它，把它变成你的。欢迎 PR！

## 安装

**中文版安装（本 fork）**：本仓库是 [cursor/plugins](https://github.com/cursor/plugins) 中 `pstack/` 的中文翻译 fork（当前同步至上游 commit `c1c0a32`）。把 `pstack/` 目录放进 Cursor 本地 plugin 目录即可：

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/oldwinter/cursor-plugins.git \
	&& cd cursor-plugins && git sparse-checkout set pstack \
	&& cp -r pstack ~/.cursor/plugins/local/pstack
```

然后重启 Cursor（或执行 `Developer: Reload Window`）。安装后 Cursor 会读取已中文化的 `.cursor-plugin/plugin.json`、`skills/**/SKILL.md` 和 `agents/`。

上游英文原版则通过 Cursor 官方 marketplace 安装：

```bash
/add-plugin pstack
```

## 上手

两步：

1. 运行 [`/setup-pstack`](./skills/setup-pstack/SKILL.md)，选一个 reasoning budget，并选择你想用的模型。
2. 每当需要做需要严谨对待的事情时，使用 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)。

第一次用？[pstack 指南](./docs/guide/README.md)会带你走完第一个真实任务，从 setup 和 prompt 一路讲到 verification 和 overnight run。

就这些。其他 skill 都是情境化的；mode skill 会在需要时替你调用它们。开箱即用状态下，mode 按模型强项分工：代码类委托（feature、refactoring、bug fix、perf、hillclimb）交给 grok，而最困难的改动、prose 和 judgment 交给 fable 5.1。默认 panel 是 fable 5.1 / sol / grok / opus 5。[`/setup-pstack`](./skills/setup-pstack/SKILL.md) 可以修改其中任何一项。

## 用法

在任务开始时使用 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)。它会读取你的请求，从一组 playbook 中挑选合适的，并在各步骤需要时运行其他 skill。

### 只用 [`/poteto-mode`](./skills/poteto-mode/SKILL.md) 就够了

这个 skill 是主要的快捷方式。每当我需要 agent 做严谨的工程工作时都会用它。它自带二十三个 playbook：

```
/poteto-mode 这个 pr 有个隐蔽的 bug：即使在空闲时滚动位置也会每 750ms 漂移一次。
先复现，然后修复并验证。
```

```
/poteto-mode 我要去睡了。就算 ci 偶尔 flake 也要把这个 stack 落地。我希望早上之前
全部合并完。
```

<details>
<summary>二十三个 playbook</summary>

| playbook | 适用场景 |
|---|---|
| [investigation](./skills/poteto-mode/playbooks/investigation.md) | 只读问题。x 是怎么工作的，y 为什么这样构建，我们确定吗。 |
| [bug fix](./skills/poteto-mode/playbooks/bug-fix.md) | 复现一个缺陷、定位根因，并用 runtime 证据修复。 |
| [perf](./skills/poteto-mode/playbooks/perf-issue.md) | 追踪一处已测量到的缓慢，并相对 baseline 改进它。 |
| [hillclimb](./skills/poteto-mode/playbooks/hillclimb.md) | 对单个指标持续、科学地改进直到达成目标：循环假设、前后测量、每个被接受的改进一个 commit。 |
| [runtime forensics](./skills/poteto-mode/playbooks/runtime-forensics.md) | 通过 instrumentation 诊断活着的症状（泄漏、idle-cpu 空转、glitch）。 |
| [trace forensics](./skills/poteto-mode/playbooks/trace-forensics.md) | 诊断已捕获的 profiling 产物（cpuprofile、trace、spindump、heap snapshot）。 |
| [feature](./skills/poteto-mode/playbooks/feature.md) | 从一个具名数据形态出发，构建新增或变更的行为。 |
| [refactoring](./skills/poteto-mode/playbooks/refactoring.md) | 保持行为不变的结构或形态调整。 |
| [prototype](./skills/poteto-mode/playbooks/prototype.md) | 用一次性的草图廉价地做出设计或行为决策，或通过观察来平息一个经验性分歧。 |
| [visual parity](./skills/poteto-mode/playbooks/visual-parity.md) | 两个实现之间像素级精确的 ui 等价。 |
| [authoring a skill](./skills/poteto-mode/playbooks/authoring-a-skill.md) | 编写或编辑 SKILL.md。 |
| [eval](./skills/poteto-mode/playbooks/eval.md) | 以盲测方式检验某个 skill 或 prompt 变更对 agent 行为的影响。 |
| [babysit](./skills/poteto-mode/playbooks/babysit.md) | 把一个 pr 或一个 stack 推进到可合并状态：冲突、review 讨论串、ci。 |
| [shipping](./skills/poteto-mode/playbooks/shipping.md) | 独立验证一个全绿的 stack，然后默认通过 github（可用时用 origin）自底向上把连续已验证的部分落地。 |
| [autonomous run](./skills/poteto-mode/playbooks/autonomous-run.md) | 中途不停顿地把一个长任务推进到完成。 |
| [orchestrate](./skills/poteto-mode/playbooks/orchestrate.md) | 交给一个 coordinator chat 长期持有的项目：跨多天、大量 stacked pr、成群 subagent。 |
| [autopilot-full](./skills/poteto-mode/playbooks/autopilot-full.md) | 把多个相互独立的 pr 跑到合并：每个 pr 一个 owner，并对每个 merge-ready 的 head 做 root 级验证。 |
| [autopilot-stack](./skills/poteto-mode/playbooks/autopilot-stack.md) | 构建并验证一条线性 base-branch stack，交给 operator 审查和落地。 |
| [session pickup](./skills/poteto-mode/playbooks/session-pickup.md) | 恢复或接管前一个 agent 正在进行中的工作。 |
| [pause safely](./skills/poteto-mode/playbooks/pause-safely.md) | 干净地暂停正在进行的工作，以便之后恢复。 |
| [multi-phase plan](./skills/poteto-mode/playbooks/multi-phase-plan.md) | 跨阶段或跨 stacked PR 的工作。 |
| [worktree cleanup](./skills/poteto-mode/playbooks/worktree-cleanup.md) | 通过剪除已合并或被遗弃的 worktree 和过期的 ios simulator 回收磁盘，带安全闸门。 |
| [opening a pr](./skills/poteto-mode/playbooks/opening-a-pr.md) | 用小型有序 commit 开一个可提交的 pr：conventional commits 标题加简报式正文。在每个其他 playbook 的结尾被调用。 |

</details>



被调用时它会：

1. 把你的任务匹配到一个 [playbook](./skills/poteto-mode/playbooks/)，并打开一个 todo list，其最前面的条目就是该 playbook 的步骤，逐字复制进来。
2. 在各步骤触发时路由到其他 skill。
3. 写出经过 unslop 的回复，面向 consumer 和 maintainer 组织措辞。

完整规则和 playbook 在 [`skills/poteto-mode/SKILL.md`](./skills/poteto-mode/SKILL.md)。

[`/poteto-mode`](./skills/poteto-mode/SKILL.md) 也是一个 sticky mode：一旦进入就会跨多轮保持开启——当某个 playbook 匹配或任务需要严谨时它就生效，其他时候不挡路。随时可以说一声来退出。

[`/poteto-mode`](./skills/poteto-mode/SKILL.md) 和 Cursor 的 `/loop` 命令配合得极好。你可以让 Cursor 连续工作很多小时而不牺牲严谨性。

## skills

[`/poteto-mode`](./skills/poteto-mode/SKILL.md) 会在步骤需要时替你运行其中大多数 skill（`how`、`why`、`architect`、`arena`、`swarm`、`interrogate`、`unslop`、`no-comments`、`technical-writing`、`tdd`，以及各个 principle）。下面这张表是给你想单独直接调用某一个时用的：

```
/how 我们怎么取消 run？逐个查 run 来取消会不会有 n+1 问题？
```

```
/interrogate review 这个 pr。
```

<details>
<summary>全部 skills</summary>

| skill | 什么时候用 |
|---|---|
| [`/poteto-mode`](./skills/poteto-mode/SKILL.md) | 任何非平凡任务的默认入口。 |
| [`/how`](./skills/how/SKILL.md) | 你想要一份某个子系统工作原理的走读。 |
| [`/why`](./skills/why/SKILL.md) | 你想知道某物为什么被建成这样。运行时发现可用的 MCP，并并行查询每一类证据（source control、issue tracker、长篇文档、实时聊天、基础设施可观测性、错误追踪、分析数仓）。 |
| [`/recall`](./skills/recall/SKILL.md) | 你正要开始或恢复工作，想根据你自己的聊天记录和共享记录重建关于某个主题的近期上下文，拿回一份紧凑的现状简报。 |
| [`/blast-radius`](./skills/blast-radius/SKILL.md) | 你有一个看起来很小的改动，想知道它还可能弄坏什么——并且让它安全所依赖的那一个事实由运行中的代码来证明，而不是空口断言。 |
| [`/architect`](./skills/architect/SKILL.md) | 你正要写跨越函数边界的代码，想先把调用方的用法、类型和模块形态定下来。 |
| [`/arena`](./skills/arena/SKILL.md) | 你想让 N 个并行候选同时做同一件事，然后摘取每个里面最好的部分。 |
| [`/swarm`](./skills/swarm/SKILL.md) | 你想让 N 个并行 worker 覆盖不同切片或赛跑，然后拿到一份汇总报告。 |
| [`/interrogate`](./skills/interrogate/SKILL.md) | 你手上有个 diff，想让几个不同的模型设法攻破它，包括一个严格的 code-quality 视角。 |
| [`/automate-me`](./skills/automate-me/SKILL.md) | 你想要属于你自己的 `-mode` skill，根据你实际的工作方式起草。 |
| [`/make-bot-ui`](./skills/make-bot-ui/SKILL.md) | 你想要一个页面或 dashboard，其按钮能通过 webhook 唤醒一个 Grok Bot，包括 sender-key 交接和 Tailscale。 |
| [`/setup-pstack`](./skills/setup-pstack/SKILL.md) | 你想挑选 pstack 每个角色用哪个模型。它会检测你的模型并写入一条 config rule。 |
| [`/reflect`](./skills/reflect/SKILL.md) | 一个长任务落地了，你想把这次的做法沉淀为一次 skill 编辑。 |
| [`/teach`](./skills/teach/SKILL.md) | 你想真正理解一个改动或子系统，而不只是拿到一份摘要。运行 how + why 并把结果织成一份通俗解释，一张图一张图地铺开。 |
| [`/tdd`](./skills/tdd/SKILL.md) | 你在修 bug 且存在一条便宜的本地测试路径。先写失败的测试，再写修复。 |
| [`/no-comments`](./skills/no-comments/SKILL.md) | review 前剥掉注释；召唤 Comment Sicko，修复被接受的发现，并为声称的约束给出编码方案。 |
| [`/typescript-best-practices`](./skills/typescript-best-practices/SKILL.md) | 你在读或改 typescript。把 type-system-discipline 原则落到具体语法上。 |
| [`/figure-it-out`](./skills/figure-it-out/SKILL.md) | 没有内置 playbook 适用。为任务设计一套严谨、可审计的 playbook。 |
| [`/show-me-your-work`](./skills/show-me-your-work/SKILL.md) | 你想要一条可审查的决策轨迹。把决策记录到一个可以提交的 tsv。 |
| [`/create-verification-skill`](./skills/create-verification-skill/SKILL.md) | 你的项目没有脚本化手段来证明 app 行为。生成一个带 feature map 的项目本地 verify skill，适用于任何语言或平台。 |
| [`/maintain-verification-skill`](./skills/maintain-verification-skill/SKILL.md) | 你的 verify skill 的 feature map 已经和 app 脱节。一波 source 扫描 + 一次实机 pass，至多一个只含已证实修正的 PR。 |
| [`/unslop`](./skills/unslop/SKILL.md) | 你在清理文字。移除 AI 腔。 |
| [`/bro`](./skills/bro/SKILL.md) | 你想把上一条消息用大白话重述一遍，不带术语。 |
| [`/technical-writing`](./skills/technical-writing/SKILL.md) | 分层文档标准（Diátaxis + Google developer style + STE + Global English），用于 docs、RFC、readme、PR 描述、commit message。 |

</details>



### 示例

大多数时候我在任务开始敲一个 [`/poteto-mode`](./skills/poteto-mode/SKILL.md)，让它路由到某个 playbook。其他 skill 随步骤需要自动触发。有几个我会直接调用。


<details>
<summary>全部示例</summary>

```
bug fix:           /poteto-mode 这个 pr 有个隐蔽的 bug：即使空闲时滚动也会每 750ms 漂移。
                   先复现，再修复并验证。
perf:              /poteto-mode 一个大列表即使做了 virtualize 也要一两秒才能加载。
                   跑一次 cpu trace 告诉我为什么。
feature:           /poteto-mode 在 feature flag 后面构建一个小功能。验证它真的能用。
prototype:         /poteto-mode 给 markdown 渲染器做两个 prototype 方便对比。
                   每个 spawn 一个 agent。
multi-phase:       /poteto-mode 把这些 skill 开源成插件。不许泄漏内部信息，
                   在临时目录里做，先给我看依赖图。
overnight run:     /poteto-mode 我要去睡了。就算 ci flake 也要把 stack 落地。
                   我要早上之前全部合并完。
babysit:           /poteto-mode 看看 pr 123。还有什么没处理的吗？
visual parity:     /poteto-mode 这个 flag 打开时行距太高。第二张图才是对的。
                   复现并修到一致为止。
figure it out:     /poteto-mode 我要离开一会儿。把所有调用方从同步 store 迁到新的
                   异步 store，行为保持完全一致。我希望回来时能信任它是被正确完成的。
how:               /how 我们怎么取消 run？逐个查 run 来取消会不会有 n+1 问题？
why:               /why 这个 feature flag 为什么还没开？
architect:         把这套 instrumentation 设计成高信号、零误报。先 /architect 一下。
arena:             /arena 把我的 prompt 原样带进 arena。我想对比它们的方案和你的。
swarm:             /swarm 对照各自的 check.sh 检查 packages/ 下每个包。
                   一个包一个 worker。一份报告。
interrogate:       /interrogate review 这个 pr。
tdd:               /tdd 实现
unslop:            能不能 unslop 一下、把新改动收紧？
reflect:           /reflect 刚才太慢了。把学到的东西沉淀下来，下次别再重蹈覆辙。
show-me-your-work: /show-me-your-work 留一条我回来能审查的决策轨迹。
automate-me:       /automate-me
```

</details>

## `poteto-agent` 和 Comment Sicko 两个 subagent

pstack 还附带一个能把我的风格端到端跑起来的 subagent。在父 agent 中通过 [`subagent_type: "poteto-agent"`](./agents/poteto-agent.md) 召唤它。它在做任何工作之前会先完整读一遍 `poteto-mode`，包括其中的 principles 内联索引。用 `generalPurpose` 顶替会跳过这次阅读并产生漂移。

[`/poteto-mode`](./skills/poteto-mode/SKILL.md) 和 [`subagent_type: "poteto-agent"`](./agents/poteto-agent.md) 走同一个 wrapper 路由。

pstack 还附带 [Comment Sicko](./agents/comment-sicko.md)，一个只读注释审查员，以 `subagent_type: "Comment Sicko"` 形式提供。一般通过 [`/no-comments`](./skills/no-comments/SKILL.md) 调用它，而不是直接调用。

## principles

二十三个短 skill，每个讲一条原则。`poteto-mode` 把它们编成内联索引，并在任务开始时读取该索引。独立文件的存在是为了让其他 skill 能按名字引用某条原则，也让索引可以指向每条原则的完整规则。

<details>
<summary>全部二十三条 principles</summary>

| principle | 分组 | 规则 |
|---|---|---|
| [laziness-protocol](./skills/principle-laziness-protocol/SKILL.md) | core | 偏向删除，偏向能解决问题的最小改动。 |
| [foundational-thinking](./skills/principle-foundational-thinking/SKILL.md) | core | 在写逻辑之前应用：选定核心类型和数据结构、安排 scaffold 与 feature 的先后、问清并发 actor 之间共享什么。把数据结构搞对，下游代码自然显而易见。 |
| [redesign-from-first-principles](./skills/principle-redesign-from-first-principles/SKILL.md) | core | 把新需求当作从第一天起就是基础假设来重新设计，而不是硬生生螺栓上去。 |
| [attack-the-premise](./skills/principle-attack-the-premise/SKILL.md) | core | 当两个或更多共享同一前提的修复在同一道闸门上失败时应用。先盘点哪些 actor 持有这种失衡，然后质疑前提，而不是再写一个同样假设它的修复。 |
| [subtract-before-you-add](./skills/principle-subtract-before-you-add/SKILL.md) | core | 先移除死重、冗余校验器和存根引用，再在更简单的地基上构建。 |
| [minimize-reader-load](./skills/principle-minimize-reader-load/SKILL.md) | core | 数清从问题到答案之间的层数、以及读者脑中需要维持的隐藏状态；折叠只有一个调用方的 wrapper，收缩可变状态的作用域。 |
| [outcome-oriented-execution](./skills/principle-outcome-oriented-execution/SKILL.md) | core | 在带明确阶段边界的计划性重写和迁移中应用。向目标架构收敛；不要用过渡期兼容代码去维护平滑的中间状态。 |
| [experience-first](./skills/principle-experience-first/SKILL.md) | core | 把用户愉悦置于实现便利之上；宁可少交付几个打磨过的功能，也不要多交付一堆粗糙的。 |
| [exhaust-the-design-space](./skills/principle-exhaust-the-design-space/SKILL.md) | core | 在定下方案之前先构建 2-3 个互相竞争的 prototype 并排比较。 |
| [build-the-lever](./skills/principle-build-the-lever/SKILL.md) | core | 应用于任何非平凡工作，不只是批量工作：编辑、迁移、分析、检查。构建那个能干活或能证明的活工具（codemod、脚本、生成器，或一份你的 subagent 可以遵循的 skill），而不是手工硬做。这个工具本身就是审查者可以重跑的制品。 |
| [model-the-domain](./skills/principle-model-the-domain/SKILL.md) | architecture | 把领域编码进结构里，而不是散落一地的条件判断。 |
| [boundary-discipline](./skills/principle-boundary-discipline/SKILL.md) | architecture | 把防御集中在系统边界（CLI、config、network、外部 API）；信任内部类型，把业务逻辑留在纯函数里。 |
| [type-system-discipline](./skills/principle-type-system-discipline/SKILL.md) | architecture | 让非法状态无法被表示，给语义 primitive 打 brand，在边界解析外部数据，拒绝对编译器撒谎，穷尽 variant，从权威 schema 派生。 |
| [make-operations-idempotent](./skills/principle-make-operations-idempotent/SKILL.md) | architecture | 无论之前跑过多少次部分运行，都收敛到同一个终态。 |
| [migrate-callers-then-delete-legacy-apis](./skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | architecture | 迁移调用方和删除旧 API 放在同一波里完成，而不是保留兼容层。 |
| [separate-before-serializing-shared-state](./skills/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | 先消除共享；只有当"单一写者"是真正的不变量时，才做结构化串行化。 |
| [prove-it-works](./skills/principle-prove-it-works/SKILL.md) | verification | 在完成任务后、宣布完成前应用。对着真实制品验证（运行功能、读取实际值、检查 diff），而不是看代理指标、自我汇报或"能编译"。 |
| [fix-root-causes](./skills/principle-fix-root-causes/SKILL.md) | verification | 把每个症状追溯到根因并在根因处修复；先复现，追问为什么直到抵达根因，抵制那些只是让崩溃安静下来的 nil-check 守卫。 |
| [sequence-verifiable-units](./skills/principle-sequence-verifiable-units/SKILL.md) | verification | 应用于多步骤工作（sweep、迁移、一串相似编辑）以及 commit 和 PR 的堆叠方式。把工作拆成小的单元，每个单元都结束于一个可验证状态，先验证再做下一个，并让交付顺序本身能向审查者自证。 |
| [test-behavior-not-implementation](./skills/principle-test-behavior-not-implementation/SKILL.md) | verification | 在编写、修改或保留一个测试时应用。以用户调用代码的方式去调用它，并断言用户观察到的结果等于一个字面量期望值。如果让每个被 import 的函数都返回 undefined 测试仍然通过，就重写断言或者删掉这个测试。 |
| [guard-the-context-window](./skills/principle-guard-the-context-window/SKILL.md) | delegation | 把批量内容路由给 subagent；主线程只留摘要，不要原始负载。 |
| [never-block-on-the-human](./skills/principle-never-block-on-the-human/SKILL.md) | delegation | 先推进，拿出结果，让人类事后纠偏；确认只留给不可逆的操作。 |
| [encode-lessons-in-structure](./skills/principle-encode-lessons-in-structure/SKILL.md) | meta | 把规则编码成 lint、metadata 标志、运行时检查或脚本，而不是再多写一段文字。 |

</details>

## 这里没有附带的东西

`poteto-mode` 引用了几样但没有打包进来的东西：

- `/deslop` 和 `deslop` skill 在 `cursor-team-kit` plugin 里。
- `control-cli`（用于 CLI 和 TUI）和 `control-ui`（用于浏览器、Electron、web）也在 `cursor-team-kit` 里。
- `/create-skill` 是 Cursor 内建的。Cursor 还自带一个内建 `/babysit`；在 `poteto-mode` 内部，[babysit playbook](./skills/poteto-mode/playbooks/babysit.md) 对 pr 状态类请求优先于它。

如果想要完整套装，把 `cursor-team-kit` 和 pstack 一起装上。

## 为什么没有 planning skill？

Cursor 已经有一个很好的 plan mode，和 pstack 配合得很好。但我个人不相信 planning。最好的 spec 就是代码。如果你确实想做个计划，[`/poteto-mode`](./skills/poteto-mode/SKILL.md) 也覆盖得到，只是它不是默认动作。

## 把它变成你的

`poteto-mode` 是我的风格。你可能不想要一模一样的。

输入 [`/automate-me`](./skills/automate-me/SKILL.md)。它会挖掘你最近的 transcript，按你实际的工作方式起草一份 `<your-name>-mode` skill，并在底层经由 pstack 路由。你把 pstack 留作底座，最终得到一个和 `poteto-mode` 并排的、属于你自己的路由 skill。

模型也是可配置的。输入 [`/setup-pstack`](./skills/setup-pstack/SKILL.md)。它会检测你可用的模型，并写入一条始终生效的小 rule，把每个角色（code、judgment、review panel）映射到一个模型。每个 skill 都会读它，在 rule 缺失时回退到合理默认值，所以你只需覆盖你想改的部分。

## automations

pstack 还附带一个休眠中的 [benny automation pack](./automations/benny/)。benny 会 triage 来自 slack 的 issue 报告，然后用真实 ui 证据复现并修复确认的 bug。它的文件没有注册为 slash skill。

要启用它，把 Cursor 指向 [`FOR_AGENTS.md`](./automations/benny/FOR_AGENTS.md)。setup 会把这套 pack 复制到目标仓库的 `.cursor/automations/benny/`，在那里为共享 skill 启用 pstack，并把用户配置保留在被复制的 pack 之外。

## license

MIT
