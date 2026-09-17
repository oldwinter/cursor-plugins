# benny automation 意图

## 我想自动化什么

我要两个在同一 slack issue 频道里协作的 cursor automation。

### automation 1：分诊 issue 报告

- 触发：有人在我配置的源 slack 频道发新的顶层报告时，这个 automation 从该报告启动并保住原 thread 坐标。
- 行为：读 thread 和附件，把报告归类为 bug 或性能问题、功能请求、问题或反馈、或转路由，并在路由前追出可能的归属层。
- tracker：在我配置的 tracker 里搜重复项，确信的重复就更新它，只为明确的全新 bug 建 ticket。
- 工具：slack thread 读写权限、我配置的 tracker 集成、我的可选 routing map。
- 产出：源 thread 里恰好一条回复，短判定加 `[benny:bug]`、`[benny:performance]` 或 `[benny:other]`。bug 或 performance 标记可附 tracker url。
- 边界：绝不在源频道发顶层消息。

### automation 2：复现并修复已确认的 bug

- 触发：从同一个新顶层报告启动，或启动时选另一个受支持的触发，然后等原 thread 里可信的分诊标记。
- 闸门：有人明确认领修复就停。如果已有 PR 或已合并 commit 可能修了该报告，我要的是验证而不是竞品改动。
- 行为：用我配置的 control adapter 和 feature map，经真实 UI 把确切症状复现两遍，捕获截图、视频和只读状态交叉核对。
- 修复：验证已有 PR 而不在其上重写。确认复现后可尝试一次有边界的根因修复，测试便宜时用 tdd，对 blast radius 冒烟，before-and-after 证明通过才开 draft PR。
- 工具：slack thread 读写权限、仓库和历史访问、draft PR 创建、我配置的 tracker、我的 control adapter。
- 产出：源 thread 或可选 operations thread 里的证据和已验证结果，加一个可选的 draft PR。更新保持简洁。
- 边界：绝不在源频道发顶层消息。

### 共享规则

- 整个 run 中源频道和根 thread 坐标保持不可变。
- 工具型和 debug bot 当作证据，不算移交或修复归属。
- 允许 subagent 帮忙，但它们不能发 slack、不能拿 slack 凭据。
- 整个 pack 提交到目标仓库的 `.cursor/automations/benny/`。其中的 `SKILL.md` 文件是直接给 automation 的指令，不是注册的 plugin skill。
- pstack 只经目标仓库提交的 `.cursor/settings.json` 启用，用于 `how`、`why`、`tdd`、`unslop` 和必需的 principle skill 这些共享依赖。
- 每个线上 automation prompt 直接读它提交的那份 operational 文件。不要 plugin 缓存路径、复制的摘录、或 slash-skill 发现。
- 用户拥有的配置、feature map、routing map 和 secret 放在 `.cursor/automations/benny/` 之外，pack 刷新覆盖不了它们。
- 频道坐标、tracker 访问、control adapter 或 feature map 缺失或不确定时，两个 automation 都 fail closed。
- 只要 draft PR。不合并、不部署。

### 我的配置

- 源 slack 频道：`<channel>`
- 可选 operations 频道：`<channel or none>`
- 仓库和默认分支：`<repo>`、`<branch>`
- tracker：`<type, team, project, labels, intake status>`
- routing map：`<path or none>`
- 分诊身份：`<slack identity>`
- control skill：`<configured skill or adapter>`
- feature map：`<committed same-repo path outside the copied pack, or behavior to paraphrase>`
- 模型：`<triage, reproduce, code, media review>`
- 状态 emoji 字符串：`<seen, reproducing, reproduced, blocked, fixing, failed, pull request opened>`
- 预算：`<polling, verdict wait, follow-up, repro, rejection, fix>`
- 可选 bot token 能力：`<none, file download, or editable operations status>`

从 [`configuration.example.yaml`](./templates/configuration.example.yaml) 和 [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md) 开始。在本 pack 之外复制填写，比如 `.cursor/benny/` 下。secret 值放 secret manager 或环境变量。

## 给 agent 的话

人类通过把 cursor 指向本文件进入 setup。不要去找或调用什么 benny slash skill。

1. 问哪个仓库将运行这些 automation。
2. 把包含本 `FOR_AGENTS.md` 的目录当作源 pack。
3. 把整个源 pack 合并进 `<target-repository>/.cursor/automations/benny/`。
4. 保留每个仅目标端存在的文件。绝不删无关文件、绝不覆盖用户拥有的配置、feature map 或 routing map。
5. 源管理路径上的既有目标文件不同时，review diff 并合并且不丢弃本地编辑。归属含糊就停下问，别替换。
6. 核实复制过去的 `FOR_AGENTS.md` 和 `skills/setup-benny/SKILL.md` 存在于目标仓库。
7. 直接从目标仓库读并遵循 `.cursor/automations/benny/skills/setup-benny/SKILL.md`。

我要你把这条目合并进目标仓库的 `.cursor/settings.json`：

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

保留每个无关设置和 plugin。现有文件用 jsonc 时保留注释和合法 jsonc 语法。

我要来自目标仓库根下 fresh agent 的验证：确认 pstack 的 `how`、`why`、`tdd`、`unslop` 和 benny 用到的 principle skill 在项目 scope 内可解析。当前会话加载的或 user-scope 安装的 skill 不算数。

如果项目级 plugin 不可用或任何共享依赖解析不了，停下并说明什么失败了。不要把 `.cursor/automations/benny/skills/` 加进 plugin manifest，也别指望它的文件出现在 slash-skill 列表里。

告诉我：启用任何一个 automation 之前必须先提交 `.cursor/settings.json`、`.cursor/automations/benny/` 和任何无 secret 的配置。我明确要求之前不要创建或更新 automation。

首次创建时，分诊和复现修复各跑一次内建 `/automate`。第一个 automation 的草稿 review、批准、就绪检查和 Automations 编辑器交接全部完成后，再开始第二个。

把这份意图和完成的配置转述进每份草稿。分诊 prompt 必须读并遵循 `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`。复现 prompt 必须读并遵循 `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`。只有在 `/automate` 确认这些仓库相对路径已提交在 automation 将运行的仓库里之后才用它们。

既有 automation 不要用 `/automate` 检查或更新。先验证配置，然后用复制过去的 setup 文件里的简明字段清单，让我能在编辑器里直接编辑每个 automation。不要创建重复项。
