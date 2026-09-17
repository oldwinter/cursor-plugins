# pstack 中文本地化档案

本 fork 将上游 `cursor/plugins` 仓库中的 `pstack/` plugin 完整中文化。同步上游后，先读本档案，再翻译新内容。

## 项目定位

- 上游项目：https://github.com/cursor/plugins（仅 `pstack/` 目录，MIT）
- 中文 fork：https://github.com/oldwinter/cursor-plugins
- 当前同步的上游 commit：`c1c0a32802223f4be824112dd83d33ad29a8b26c`
- 主要安装面：Cursor 本地 plugin 目录 `~/.cursor/plugins/local/pstack`
- 目标用户：使用 Cursor 的中文开发者
- 用户安装后实际读取的入口文件：`pstack/.cursor-plugin/plugin.json`、`pstack/skills/**/SKILL.md`、`pstack/agents/*.md`、以及各 skill 的 `references/`、`playbooks/`、`scripts/`
- 不应宣传为中文版安装的入口：Cursor 官方 marketplace 的 `/add-plugin pstack`（该命令安装的是上游英文原版）

## 本地化目标

本 fork 是中文本地化发行版，不是逐句对照译文。翻译应让中文用户能直接安装、理解并使用，同时保留上游项目的技术语义、执行语义和安全边界。

## 语气

- 像真实项目文档，不像机器翻译。
- 面向开发者时保留常用英文技术词，例如 agent、skill、plugin、workflow、prompt、runtime、frontmatter、worktree、subagent。
- 操作步骤用短句，先给可执行命令，再解释原因。
- 产品介绍可以自然中文化，但不要改写事实、能力边界或支持平台。

## 术语表

| 英文 | 中文 | 备注 |
|---|---|---|
| skill | skill | Agent Skills 语境下保留英文小写 |
| plugin | plugin | CLI/plugin manifest 语境下保留英文 |
| subagent | subagent | 保留英文 |
| worktree | worktree | Git 术语，保留英文 |
| playbook | playbook | pstack 概念，保留英文 |
| agent | agent | 保留英文 |
| prompt | prompt | 保留英文 |
| frontier | frontier | watch-pr 术语，保留英文 |
| upstream | 上游 | 指原英文项目 |
| fork | fork | GitHub fork 语境下保留英文 |
| slop | slop | poteto 术语，保留英文 |
| unslop | unslop | skill 名与概念，保留英文 |
| poteto-mode | poteto-mode | skill 名，保留英文 |

## 不翻译清单

- 命令、参数、环境变量、URL、文件路径、包名、plugin 名、skill slug、model slug（如 `cursor-grok-4.6-high-fast`、`claude-fable-5-1-thinking-high`）。
- YAML/JSON/TOML key 与 frontmatter 字段名和字段值（`name:`、`description:` 等触发契约原样保留）。
- 代码块内的可执行代码、命令、regex、协议字段（`trigger`、`thread_ts`、`Authorization`、`X-Automation-Key` 等）。
- SKILL.md/agent frontmatter 中 `name:` 与 `description:`：skill 路由契约，保持英文原文。
- benny 的标记契约字符串：`[benny:bug]`、`[benny:performance]`、`[benny:other]`、`tracker=<URL>`。
- Slack 工具/action 名：`SendSlackMessage`、`PostToSlack`、`chat.postMessage`。
- 测试 golden string、TS `@ts-expect-error` 指令、shell 脚本的输出 token（表头、bucket 名、usage 字符串）。
- `LICENSE`、`configuration.example.yaml` 的 key 与占位值。

## README 中文安装区块

`pstack/README.md` 顶部提供"中文版安装"区块。区块说明：这是中文 fork、一条可复制到 `~/.cursor/plugins/local/` 的安装命令、上游项目和当前同步 commit、以及安装后 runtime 实际读取的中文入口文件。

## 同步后检查

- `git diff --check`
- 精确冲突标记扫描：`rg -n '^(<<<<<<<|=======|>>>>>>>)$' .`
- README 中文安装区块存在且命令指向中文 fork。
- 安装命令对应的 runtime 会读取中文入口文件。
- 新增英文 user-facing 文案已翻译，执行敏感字符串未被误翻。
- SKILL.md frontmatter `name:`/`description:` 与上游逐字节一致。
- 代码块内非注释行与上游逐字节一致。

## 项目特殊规则

- 示例 prompt（如 `/poteto-mode 这个 pr 有个隐蔽的 bug…`）：`/触发词` 保留英文，自然语言部分翻译为中文。
- `technical-writing` 的改前/改后示例与 `why/references/epistemics.md` 的英文措辞示例是教学材料，保留英文。
- mermaid 图的节点/边标签是展示文本，可翻译；`flowchart`、`-->` 等语法 token 保留。
- `automations/benny/` 下的 `SKILL.md` 是 automation 直接读取的指令文件，不是注册的 plugin skill；其中的安全边界（不创建/更新 automation、secret 不入库、Slack 写禁令）不得弱化。
- `show-me-your-work/scripts/log.sh`、`poteto-mode/scripts/worktree-audit.sh` 等脚本：注释中文化，输出 token（表头、bucket、usage）保持英文契约。
- TypeScript 脚本：仅注释中文化；`@ts-expect-error` 等编译指令保持原样。
