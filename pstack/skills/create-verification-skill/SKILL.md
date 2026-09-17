---
name: create-verification-skill
description: "生成一个项目本地的 verification skill，像用户一样驱动你的 app——任意语言、框架或平台。用于 /create-verification-skill、'make a control skill for this repo'，或项目没有脚本化手段来证明 UI/CLI/服务行为时。"
disable-model-invocation: true
---

# 创建 verification skill

每个正经项目都需要一个脚本化方式来驱动真实 app 并证明行为：启动它、像用户那样操作一个功能、捕获证据。本 skill 把这生成成一个项目本地 skill（`.cursor/skills/verify-<app>/`），按仓库定制。生成器的输出是写给下一个 agent 的，不是给人的——它会被一个从没见过这个 app 的 agent 在任务中途冷读。

## 1. 采访仓库，不是采访用户

从代码库回答这些问题，只问观察不到的东西：

- **Surface**：用户实际碰的是什么？web UI、CLI/TUI、桌面 app、API、移动 app、库？一个仓库可以有好几个——挑主要的，记下其余。
- **Run**：app 本地怎么启动？优先仓库自己文档化的 dev 命令（package script、Makefile、README quickstart）。记下端口、env var、seed 数据、auth。
- **Drive**：agent 怎么编程式地和它交互？现有 harness 优先——Playwright/Cypress spec、expect 脚本、PTY helper、可 curl 的端点、debug 端口。其次才选通用配方：web 和 Electron 用 browser/CDP，CLI/TUI 用 tmux/PTY harness，服务用裸 HTTP。
- **Observe**：能捕获什么证据？截图、终端 transcript、响应体、日志、exit code、DB 状态。
- **Isolate**：两个实例能并排跑吗（端口、数据目录、profile）？不能就在生成的 skill 里写明：拒绝对共享实例双重驱动，胜过搞坏用户的会话。

如果 checkout 原样 build 不起来或起不来，先生成之前修它（或精确报告）——基于坏底座写出的 skill 教的是错误步骤。当一个无关缺失资产挡住启动（API 从不服务的静态目录、示例 config），生成的 skill 可以创建它，明确标为 verification 脚手架，并在 cleanup 里移除。

## 2. 生成 skill

写 `.cursor/skills/verify-<app>/SKILL.md`，带 YAML frontmatter（`name: verify-<app>`，`description` 点名 app、surface、何时该用它——没有 frontmatter，skill 永远不会注册），以及以下各节，每节都基于采访实际发现（不留占位符）：

- **Launch**：为验证启动 app 的确切命令，以及怎么判断它就绪（某行日志、端口应答、出现 prompt）。包括 teardown。短命的 CLI 或 TUI 没有要保活的服务器：launch 意味着 build 二进制（或装依赖）一次，然后每次驱动在各自隔离的 PTY 或 tmux 会话里启动。
- **Doctor**：一个只读检查，回答"这个实例值得驱动吗"——进程在、版本/build 对、端口归我们、auth 有效。agent 在任何异常时先跑它。
- **Drive**：harness 配方，用本仓库真实的 selector/命令，不是示例。优先稳定句柄（ARIA label、data 属性、prompt 字符串、路由路径）而非坐标和 tab 顺序。
- **Evidence**：一份证明要捕获什么、放哪里。写明证明标准：走真实用户路径，不是内部 setter 或测试专用端点；捕获动作*和*结果状态，不只是最终画面；连同可见的东西一起验证副作用（写下的文件、插入的行、发出的消息）；只有在生产边界本就隔离外部系统的地方才用 mock。当安全路径是 dry-run 或 test 模式时，通过观察（文件、网络、git ref）核实它实际跳过了什么，而不是信它的名字——有些 dry-run 仍会碰网络或开浏览器。
- **Cleanup**：怎么拆掉本次 run 创建的实例。绝不按进程名杀；杀你启动的。cleanup 移除实例和临时状态，绝不动证据：证明产物在 teardown 后存活，位置由 skill 点名。
- **Helper**：skill 附带的任何脚本可执行，其调用方式在 skill 正文里展示。要读者逆向工程的 helper 不算 helper。

## 3. 播种 feature map

创建 `.cursor/skills/verify-<app>/features/README.md`，再给你能识别的每个用户可见功能建一个文件（先瞄准前 3-5 个，从路由、命令、菜单或文档里找）。形态按 [`references/feature-map-example/`](references/feature-map-example/)：一个 README 索引，每功能一文件。每个文件从用户视角回答：这功能是什么、怎么到达、怎么用 harness 驱动、什么可观察的终态证明它工作。四个 H2 固定为 `Sub-features`、`How to get to it (user POV)`、`Driving it with <harness>`、`Gotchas`。这份 map 是仓库维护的验证源：map 列了其他入口却只驱动一个方便入口的证明，是不完整的。

## 4. 交付之前先证明生成的 skill

端到端跑一遍它自己的指令：launch、doctor、驱动*一个*已建图的功能（一个就够——map 存在就是让以后的 run 覆盖其余）、捕获证据、cleanup。cleanup 之后确认证据仍在点名位置——把证明吃掉的 cleanup 让这步失败。修掉失败的，并且每轮失败迭代后也跑生成的 cleanup，别让坏尝试挂住进程和端口。从没被执行过的生成 skill 是草稿，不是交付物。

## 5. 提出维护循环

指给用户 `/maintain-verification-skill`，让 map 随 app 变化保持诚实。他们问才建议节奏。
