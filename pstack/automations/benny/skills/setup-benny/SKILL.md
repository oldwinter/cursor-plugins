---
name: setup-benny
description: Configure Benny and prepare its triage and repro automations. Use when installing Benny or changing its Slack, tracker, repository, routing, control, model, or budget settings.
disable-model-invocation: true
---

# 设置 Benny

Benny 以休眠 automation pack 的形式随 pstack 分发。plugin manifest 只暴露 pstack 的常规 skill 根目录；本文件和两份 operational 文件不是 slash skill。

人类通过把 Cursor 指向 pack 的 `FOR_AGENTS.md` 进入 setup。bootstrap 流程把整个 pack 复制进目标仓库，然后直接读 `.cursor/automations/benny/skills/setup-benny/SKILL.md` 处的本文件。

Benny 需要外部配置和两个线上 Cursor automation。

用户明确要求之前不要创建或更新 automation。绝不把 secret 值放进 plugin 文件、prompt 或提交的配置。

## 1. 复制 pack 并启用共享 pstack skill

在问 Benny 配置之前、调用内建 `/automate` skill 之前做这步。

问哪个仓库将运行这些 automation。源 pack 是包含 `FOR_AGENTS.md` 的目录。目标是 `<target-repository>/.cursor/automations/benny/`。

把整个源 pack 合并进目标：

1. 目标不存在就创建。
2. 每个源文件复制到相同的相对路径。
3. 保留仅目标端存在的文件。安装或刷新时绝不删无关文件。
4. 用户拥有的配置、feature map、routing map 放在目标之外。绝不覆盖。
5. 源管理路径上的既有文件不同时，检查 diff 并合并且不丢弃本地编辑。归属含糊就停下问，别替换。
6. 核实目标里有 `FOR_AGENTS.md`、本 setup 文件、两份 operational 文件、它们的 references 和 templates。

如果本文件正是从目标位置被读的，把复制视为完成，继续之前跑同样的核实。

把 pstack 加进目标仓库的 `.cursor/settings.json`。文件或 `.cursor` 目录不存在就创建。

把这条目合并进现有 JSON 或 JSONC：

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

保留每个无关顶层设置和其他 plugin 条目。`plugins.pstack` 已存在就只改它的 `enabled` 值。文件用 JSONC 时保留注释和合法 JSONC 语法。编辑后校验文件。

重载目标项目或在那里起一个 fresh agent。核实这些共享 pstack skill 能从项目 scope 解析：

- `how`
- `why`
- `tdd`
- `unslop`
- `principle-separate-before-serializing-shared-state`
- `principle-minimize-reader-load`
- `principle-guard-the-context-window`
- `principle-sequence-verifiable-units`
- `principle-fix-root-causes`
- `principle-prove-it-works`

当前会话加载的或 user-scope plugin 的不算数。检查必须证明目标仓库里的 fresh agent 通过项目设置拿到 pstack。

项目级 plugin 安装不可用、或任何共享依赖解析不了，停下并说明失败。

Benny 文件从 `.cursor/automations/benny/` 直接读。不要把该目录加进 plugin manifest，也别指望它的 `SKILL.md` 出现在 slash-skill 列表里。

告诉用户：启用任一 automation 之前必须提交 `.cursor/settings.json`、`.cursor/automations/benny/` 和任何被引用的无 secret 配置。用户没让就别提交。

检查通过后，线上 automation prompt 可以按稳定的仓库相对路径读提交的 operational 文件。不得内嵌 plugin 缓存路径或复制文件内容进 prompt。

## 2. 改写配置

打开这两个复制过去的例子：

- `../../templates/configuration.example.yaml`
- `../reproduce-and-fix-issues/references/feature-map.example.md`

在 `.cursor/automations/benny/` 之外创建用户拥有的副本。它们是配置文件不是 pack 文件。示例位置：

- 项目配置，如 `.cursor/benny/configuration.yaml`
- 项目 feature map，如 `.cursor/benny/feature-map.md`
- 项目 routing map，如 `.cursor/benny/routing.md`
- 用户配置，如 `~/.config/benny/configuration.yaml`
- 用户 feature map，如 `~/.config/benny/feature-map.md`

为 automation 可能要复现的每个用户可见功能填一节 feature map。保持用户视角。不要在 map 里冻结实现细节或当前代码路径。

不要编辑复制过去的例子。pack 刷新可在冲突 review 后更新源管理文件，但绝不碰用户拥有的副本。

当 fresh automation checkout 必须读这些文件时，优先目标仓库里提交的无 secret 文件。否则把所需值转述进线上 prompt。只有内建 `/automate` skill 确认文件已提交在 automation 运行的同一仓库后才引用仓库文件。

提交的 pack 和配置文件用稳定的仓库相对路径。线上 automation 绝不引用 plugin 源目录或 plugin 缓存路径。

## 3. 填必填选项

问或确认：

- 源 Slack 频道 ID
- 可选 operations 或状态频道 ID
- 仓库 URL 和默认分支
- 分诊身份或 Slack 用户 ID
- issue tracker 类型、team、project、label、intake status
- tracker adapter skill 或 MCP action
- 可选 routing map 路径
- 必需的 control skill 名
- 必需的用户可见 feature-map 路径
- 状态 emoji 字符串
- PR URL 格式
- 轮询和 effort 预算
- 分诊、复现、代码工作、媒体 review 的模型 slug

只用用户 Cursor model picker 或受支持模型列表里显示可用的模型 slug。不要猜 slug，不要沿用私有默认值。

源频道、分诊身份、仓库、tracker adapter、control skill、feature map 必须显式。任何必填值含糊就让 setup 失败。

最终的 automation 名字、描述和 prompt shim 保存之前过 pstack 的 `unslop` skill。

## 4. 检查集成能力

分诊 automation 需要：

- 配置的源 Slack 频道及其 thread 的读权限
- 该频道的 thread 回复权限
- 报告带媒体时的附件元数据和文件下载权限
- 经配置的 issue-tracker adapter 的搜索、读、创建、更新权限

复现 automation 需要：

- 源 thread 读权限
- 源频道 thread 回复权限
- 可选：配置的 operations 频道发和编辑权限
- 仓库读和历史访问
- 能开 draft PR 的 pull request action
- 配置的 control-adapter skill

读和发优先配置的 Cursor Slack action。可选 `BENNY_SLACK_BOT_TOKEN` 只填窄缺口，比如编辑那一条 operations 状态消息或下载附件。值放 secret manager 或环境变量，不放 YAML。

不要用未文档化的集成端点。

## 5. 准备 routing map

用户要转路由或 owner ping 时：

1. 把 `../triage-issue-reports/references/routing.example.md` 复制到 `.cursor/automations/benny/` 之外。
2. 每个占位符换成公开的或组织内部的值。
3. owner ping 默认关。
4. 只对配置的功能 owner 或已确认的可能回归作者允许 ping。

没配 routing map 时，分诊可以归类报告但不得猜目的地或 owner。

## 6. 验证 control adapter

读 `../reproduce-and-fix-issues/references/control-adapter.md` 和用户完成的 feature map。

确认点名的 skill 能：

- 拉起目标 app
- 经真实 UI 走完每个已建图功能
- 经声明的 adapter action 操练已建图状态
- 不强造结果地检查状态
- 截图
- 起停录屏
- 清理自己的进程和临时数据

缺任何能力，repro automation 保持禁用。它必须 fail closed，而不是声称做了没做的复现。

## 7. 准备线上 automation

问是首次创建还是配置既有 automation。

两条路都把复制 pack 里的 `../../FOR_AGENTS.md` 当主要用户意图来源。用它理解两个触发、工具、指令、产出和共享规则。

### 首次创建

一次创建一个 automation。

每个 automation：

1. 读对应的复制 prompt 模板作为次要内部素材。
2. 把 `FOR_AGENTS.md`、完成的 Benny 配置和模板意图转成一份完整的自然语言请求。
3. 告诉线上 prompt 读并遵循 `.cursor/automations/benny/` 下它那份确切的已提交 operational 文件。
4. 用稳定的仓库相对路径，不是 plugin 源或缓存路径。别把 operational 文件内容复制进线上 prompt。
5. 读并遵循内建 `automate` skill。
6. 让 `automate` 发现 Slack 频道、仓库和已连接集成。
7. 让 `automate` 确认复制的 pack 和引用的配置文件已提交在 automation 将运行的同一仓库。
8. 让 `automate` 展示草稿表、取得批准、问就绪、打开 Automations 编辑器。
9. 完成这个 automation 的编辑器交接再开始下一个。

给 `automate` 这份完整的分诊意图，按配置填：

- 名字 `benny-triage`。
- 每次运行读并遵循 `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`。
- 在配置的源 Slack 频道每个新顶层报告上触发。
- 读触发的 thread 且只在其中回复。
- 用配置的 issue-tracker 集成。
- 归类、查证据、追因、去重，只为明确的全新 bug 建 ticket。
- 以一条仅 thread 的判定收尾，带配置的 `[benny:bug]`、`[benny:performance]` 或 `[benny:other]` 标记和可选 tracker URL。
- 绝不发源频道顶层消息。

分诊编辑器交接完成后，给 `automate` 这份完整的复现修复意图：

- 名字 `benny-reproduce`。
- 每次运行读并遵循 `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`。
- 在配置的源 Slack 频道同样的新顶层报告上触发。
- 用配置的仓库和默认分支。
- 读源 thread 且只在其中回复。
- 含 pull request 创建和配置的 tracker、control-adapter、feature-map 要求。转述已建图的用户路径和状态，除非 `automate` 确认同一仓库里有可用的已提交文件。
- 等可信分诊标记再行动。
- 经已建图真实 UI 把确切症状复现两遍并捕获证据。
- 验证已有修复而不在其上重写。
- 确认复现后才尝试一次可选的有边界修复，证明和检查通过才开 draft PR。
- 绝不发源频道顶层消息。

不要重复 `automate` 的 Slack、仓库、集成、完整性、认证、草稿 review、批准、就绪或编辑器交接工作。

### 既有 automation

内建 `automate` skill 只管创建。别用它搜索、检查或更新既有 automation。

先完成配置、routing、control-adapter、feature-map 验证。然后给用户这份简明编辑器清单。

既有分诊 automation 更新：

- 名字和描述
- 直接指令：读 `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`
- 新顶层 Slack 报告触发和源频道
- Slack thread 读和回复能力
- issue-tracker 集成
- 转述的分诊指令、仅 thread 规则、Benny 判定标记

既有复现 automation 更新：

- 名字和描述
- 直接指令：读 `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`
- 匹配的 Slack 触发和源频道
- 仓库和默认分支
- Slack thread 读和回复能力
- pull request action
- tracker、control-adapter、feature-map 要求
- 转述的等标记、证据、验证和有边界修复指令

请用户直接在各自的 Automations 编辑器里更新每个既有 automation。不要创建替代品或重复项。

### 创建边界

绝不直接调 automation 后端服务或后端 automation 工具。绝不用携带草稿字段的浏览器 URL。绝不构造或打开 Cursor 协议 deep link。新 automation 唯一的完成路径是内建 `automate` skill 经 review 的 Automations 编辑器交接。

编辑器保存后 thread 安全测试通过之前，不要启用任一 automation。

## 8. 测试 thread 安全

用测试频道或无害测试报告。

测试之前确认：目标仓库的 `.cursor/settings.json`、`.cursor/automations/benny/`、每个被引用的无 secret 配置文件都提交在 automation checkout 所用的分支上。确认两个线上 prompt 指向各自确切的已提交 operational 文件。任何检查失败就停。告诉用户 automation 还不能启用。

验证：

1. 分诊存根 `thread_ts` 并以回复形式恰好发一条判定。
2. 判定含恰好一个配置的标记。
3. 复现只接受来自配置分诊身份的标记。
4. 复现保持同一组不可变源坐标。
5. 不出现源频道顶层消息。
6. 被委托的 worker 用不了任何 Slack 写 action。
7. 坐标缺失、父级被删、preflight 失败时不发帖也不建 tracker issue。

七项全过才放开正常流量。
