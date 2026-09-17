# Feature-map 示例

把 Benny 可能要复现的每个用户可见功能都建图。驱动 app 之前读相关小节。本 map 保持用户视角。内部实现和当前代码路径在运行时发现，不要冻结在这里。

把本文件复制到 `.cursor/automations/benny/` 之外，比如 `.cursor/benny/feature-map.md`，并把 `control.feature_map_path` 指向该副本。pack 刷新不得覆盖它。

## 单功能模板

### `<feature name>`

`<一行用户可见用途>`

#### 用户怎么到达

- 点击路径：`<screen> -> <menu, tab, or panel> -> <control>`
- 键盘快捷键：`<shortcut or none>`

#### control adapter 怎么驱动它

- `<adapter action>` 配 `<inputs>` 应当 `<visible result>`。
- 重置：`<adapter 如何回到 fresh 状态>`。

#### 稳定 selector

- `<role and accessible name>`
- `<ARIA relationship>`
- `<data-component or purpose-named data attribute>`

绝不用生成的 CSS 或 StyleX class、动态 hash、子索引或脆弱的 DOM 位置。

#### 要操练的状态

- Default、hover、focus-visible、active、disabled
- Loading、empty、error
- Selected、open、expanded
- `<相关的功能特有变体>`

不适用的状态标出来。

#### 前置条件和 setup

- Auth：`<account state>`
- 数据：`<fixture>`
- 权限：`<role>`
- Flag：`<flag or none>`
- 服务：`<required availability>`

#### 证据和交叉核对

- 截图：`<app identity, feature, and discriminating state>`
- 视频：`<entry path, interaction, and final state>`
- 交叉核对：`<确认 UI 的只读状态或值>`

#### 坑

- `<已知死路或错误界面>`
- `<安全的环境转译>`

## 虚构示例

这些功能属于一个虚构的任务 app。它们是例子，不是 Benny 必需的功能。

### Sign in

让用户进入任务 app。

#### 用户怎么到达

- 打开 app 选 `Sign in`。无快捷键。

#### control adapter 怎么驱动它

- `open_app`、`click Sign in`、`fill credentials`、`click Continue` 应打开条目列表。
- 登出并清掉可丢弃会话即重置。

#### 稳定 selector

- 按钮 `Sign in`，文本框 `Email` 和 `Password`，`data-component="sign-in-form"`

#### 要操练的状态

- Default、focus-visible、submitting、disabled、loading、error

#### 前置条件和 setup

- 可丢弃账号和可用的认证服务

#### 证据和交叉核对

- 录从落地页到条目列表。查只读会话状态。

#### 坑

- 营销页是错误界面。认证服务缺失是阻碍。

### Item list and detail

让用户浏览条目并打开一个。

#### 用户怎么到达

- 打开 `Items` 标签页，然后选一行。

#### control adapter 怎么驱动它

- `select_tab Items` 和 `click <fixture item>` 应打开其详情。
- 关掉详情并清掉选择即重置。

#### 稳定 selector

- 名为 `Items` 的标签页和列表，以 fixture 命名的行，`data-component="item-detail"`

#### 要操练的状态

- Loading、empty、error、selected、open、expanded

#### 前置条件和 setup

- 命名的 fixture 条目、读权限、可用的条目服务

#### 证据和交叉核对

- 展示选中和匹配的详情标题。查选中条目 ID。

#### 坑

- 搜索结果可能看着像但走的路径不同。

### Item editor

让用户创建或编辑条目。

#### 用户怎么到达

- 从详情选 `Edit` 或从列表选 `New item`。

#### control adapter 怎么驱动它

- `click Edit`、`fill <field>`、`click Save` 应更新详情。
- 还原 fixture 即重置。

#### 稳定 selector

- 按钮 `Edit`、`New item`、`Save`，表单 `Item editor`，label 关联的字段

#### 要操练的状态

- Default、focus-visible、dirty、validating、disabled、saving、error、success

#### 前置条件和 setup

- 可编辑 fixture、写权限、可用的保存服务

#### 证据和交叉核对

- 展示字段变更到更新后的详情。只读地查存储的条目值。

#### 坑

- 不要注入表单状态。只读详情字段不是编辑器。

### Settings

让用户改个人偏好。

#### 用户怎么到达

- 打开 profile 菜单，然后选 `Settings`。

#### control adapter 怎么驱动它

- `open_menu Profile`、`click Settings`、`toggle <preference>` 应更新该控件。
- 还原起始偏好即重置。

#### 稳定 selector

- 按钮 `Profile`，菜单项 `Settings`，区域 `Settings`，按用途命名的偏好属性

#### 要操练的状态

- Closed、open、selected、focus-visible、disabled、loading、error

#### 前置条件和 setup

- 已登入测试账号、已知偏好、可用的偏好服务

#### 证据和交叉核对

- 展示菜单路径和最终控件状态。只读地查偏好值。

#### 坑

- 操作系统设置是另一个界面。

## 完整性清单

- 每个可复现的用户可见功能都有一节。
- 每节点明用户路径、adapter action 和重置。
- selector 用 role、名称、ARIA、稳定组件标记或按用途命名的属性。
- 没有 selector 用生成的 class 或 DOM 位置。
- 相关的交互、loading、empty、error、selected、expanded 状态都覆盖。
- Auth、fixture、权限、flag、服务都显式。
- 截图、视频和底层交叉核对要求都显式。
- 错误界面、死路和安全的环境转译都列出。
- 实现细节留作运行时发现。
