# Bugbot 分诊

Babysit playbook（`../playbooks/babysit.md`）处理 Bugbot 或 review 自动化评论时用本参考。目标不是默认无视 Bugbot，是别再每条评论都当成必改的代码变更。

## 判定 rubric

行动前先给每个 Bugbot thread 归类：

- `fix`：评论指出了可信的正确性、安全、隐私、数据丢失、auth、计费、迁移、幂等、race 或已上线行为问题。在最低的归属 PR 里修，回复 commit SHA 并 resolve thread。
- `dismiss`：评论命中某个已记录的低风险噪音模式，且当前代码/上下文证明该担忧不需要改代码。回复简短理由并 resolve thread。
- `ask`：评论是新奇的、高严重度的、涉安全/隐私/数据的、或含糊的。别猜，问用户。

拿不准就问。跳过一条噪音代码质量评论代价很小；漏过一个真数据或安全 bug 代价不小。

## 习得模式的格式

未来加模式用这个形态：

```markdown
### <short pattern name>

- Confidence: candidate | recurring | strong
- Skip when: <conditions that must be true>
- Do not skip when: <risk boundaries>
- Example signal: <phrases or code context that identify the pattern>
- Source: <PR/comment URL or short historical note>
```

一两个例子用 `candidate`。多次真实驳回后用 `recurring`。只有当模式窄、反复验证过、且低风险时才用 `strong`。

## 反复出现的 skip 候选

### 有意的 UI 或 design-system 视觉改动

- Confidence: candidate
- Skip when: PR description、截图、design review 或邻近代码显式表明了视觉改动，而 Bugbot 评论只是在复述"共享视觉默认值变了"。
- Do not skip when: 评论指向无障碍、焦点可见性、键盘导航、色彩对比度，或 PR 无意改动的组件 API 契约。
- Example signal: 关于焦点描边、按钮尺寸、间距或共享组件视觉默认值的评论，owner 回复 "intentional" 或 "intended"。

### Bugbot 看不到的 upstack 或 stack 内使用

- Confidence: candidate
- Skip when: Bugbot 把一个 export、组件、helper 或文件标为未使用，而当前 forge 的 PR 列表和 diff、上层 stack 的 diff、或 PR 上下文显示它被 stack 里后面的 PR 使用。
- Do not skip when: 当前 PR 不属于 stack、该符号是公共 API、或声称的 upstack 使用无法核实。
- Example signal: "Exported component is never used" 配上人类回复 "used upstack"。

### 并行实现期间的暂时重复

- Confidence: candidate
- Skip when: PR 有意重复一小段代码，好让新路径与正在删除、替换或验证中的旧路径并行。
- Do not skip when: 重复的代码涉及安全、计费、数据访问、API 行为，或一个长命共享抽象明显能降风险。
- Example signal: "Significant duplication" 或 "duplicated validation logic"，owner 解释旧路径将被删除或重复逻辑有意保持局部。

### 现有框架或组件不变量已覆盖该警告

- Confidence: candidate
- Skip when: 担忧已被当前 diff 或邻近代码中可见的共享组件、框架契约、类型不变量或 single source of truth 保证。
- Do not skip when: 不变量是假设的而非强制的、依赖时序、或跨越 async/状态边界——那里值会分叉。
- Example signal: 关于内层 popover 缺 max-height 的评论，而共享 popover 已强制视口边界；或 nullable 值，而本地 checked 值与传入值同源。

### owner 声明的后续跟进或延后清理

- Confidence: candidate
- Skip when: PR owner 明确说这是已知的后续项、当前 PR 没让行为更糟、且评论不涉及高风险区域。
- Do not skip when: agent 在没有 owner 输入的情况下行动、问题是中/高严重度的产品行为、或延后会合入一个新回归。
- Example signal: "I'll worry about that later" 或 "we'll delete this eventually"。

### 自我撤回或明确 false-positive 的规则评论

- Confidence: recurring
- Skip when: 评论正文或 Bugbot 后续回复明确说该发现已撤回、合规、或是 false positive，且 agent 能在本地核实相关规则。
- Do not skip when: 唯一证据是某人在高风险问题上说了句 "false positive" 而无解释。
- Example signal: 文件命名规则评论，正文自己说文件已合规。

## 默认问

以下类别不要自动跳过，即使之前的 PR 驳回过类似的：

- 安全、隐私、auth、计费、数据保留、训练数据、权限边界的发现。
- 高严重度发现。
- 迁移、schema、幂等、并发、跨系统行为的发现。
- 建议修复小且明显降风险、不改变产品意图的评论。

历史数据显示人类有时会驳回安全/数据流评论。把那些当作 owner 的判断决定，不是全组通用的 skip 规则。

## 近期 babysit 的候选习得

在 babysit 期间或之后，把看着对团队有用但还没成熟的候选习得追加在这里。几个 PR 确认模式后，优先把反复出现的候选提升到上面那节。

### 手工重造浏览器原生行为

- Confidence: candidate
- Skip when: 实际上几乎不跳。当 diff 用手工等价物替换浏览器原生行为（native sticky → JS 定位克隆、原生滚动定位 → 转发 wheel/touch 事件、绘制序遮挡 → mask/clip-path），Bugbot 对该代码的逻辑 bug 发现一贯成立。
- Do not skip when: 发现涉及事件转发缺口（wheel deltaMode、touch pan、边缘 scroll-chaining、tap slop）、mask/clip 命中测试分叉、或这类代码里 observer-vs-React 状态时序 race。默认 fix。
- Example signal: "masks do not affect hit-testing"、"overlay blocks wheel scroll"、"ignores deltaMode"、"runs in the IntersectionObserver callback before React applies state"。
- Source: 一个 sticky 遮挡 PR：六轮 Bugbot、约十八条发现、每条都是修掉而非驳回。

### contract-test 漂移声明验证很便宜——先跑测试

- Confidence: candidate
- Skip when: 验证本身永远不跳——它只花一条命令。当 PR 交付的 contract test 钉住协议或文档散文（对 SKILL.md 的 regex、文档措辞快照），而 Bugbot 声称"测试不再匹配文档"（或反之），分类之前在 PR tip 上跑那个测试。红了实证声明成立；绿了就是驳回回复的具体反证。
- Do not skip when: n/a——这是验证捷径，不是驳回模式。注意"重复轮次→倾向驳回"的启发式在这里会误伤：钉散文的测试恰恰*因为*前几轮修复改了散文而漂移。
- Example signal: "Contract test omits the pre-fix wait"，出现在一个早期修复 commit 改了被钉段落的 PR 上；在 tip 跑测试，恰好挂在被引用的断言。
- Source: 一个钉散文的 PR，八轮 Bugbot；第七轮时声明成真，尽管之前每轮都已修复并 resolve。

### 同一 PR 后段已修的过时安全 review 发现

- Confidence: candidate
- Skip when: agentic 安全 review（或类似物）声称缺某个 authz/校验调用，而当前 PR tip 明显已包含那道 gate（带测试）——典型情形是 review 跑完后的加固 commit 补上的。
- Do not skip when: 被引的 helper 对所讨论的 principal 是 no-op、检查跑在它守护的副作用之后、或所声称 principal 的覆盖缺失。
- Example signal: 一条 HIGH "missing authorization check" 发现，而那道确切的守卫在 tip 上已于副作用之前调用。
- Source: 一个 webhook 端点 PR，加固 commit 晚于 review 运行。

### 把刻意收窄的错误条件放宽会掩盖真错误

- Confidence: candidate
- Skip when: 发现要求把窄错误条件（具体 `errno`、错误码或状态类别）放宽成 catch-all，而这份收窄编码了真实区分。经典形态是 gate 在 `ENOENT` 上的依赖回退："binary is not installed"与"the command ran and failed"是两种情形。对任何非零退出都重试回退，会把合法失败（not found、auth 过期、网络）重新打到回退上、然后报告回退的错误，盖住真错误。
- Do not skip when: 窄条件漏掉了*同*类别的情形（`EACCES` 这类同样"binary 不可用"的 errno、另一种传输层失败）、未处理路径丢数据或留半成品状态、或重试幂等*且*原始错误仍会浮出。
- Example signal: "only retries when X fails with ENOENT … never tries the fallback even when a working Y exists"，指向的代码其回退是为缺依赖准备的，不是为失败操作。
- Source: 一个 CLI 改名 PR，其回退是为缺 binary 而非失败命令准备的。
