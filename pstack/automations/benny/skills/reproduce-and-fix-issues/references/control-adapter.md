# Control-adapter 契约

Benny 不知道怎么拉起和驱动每个 app。用户必须配置一个为目标 app 实现本契约的 control skill 或 adapter。

把它的 skill 名设进 `control.skill_name`。

把完成的用户可见 feature map 路径设进 `control.feature_map_path`。在 `.cursor/automations/benny/` 之外复制填写 [`feature-map.example.md`](./feature-map.example.md)，不要编辑复制过去的例子。

skill、feature map 或必需能力缺席、含糊或不完整时，复现和修复工作必须 fail closed。

## 必需能力

### 拉起

在请求的测试环境里启动请求的 app 修订版。

输入：

- 仓库和修订版
- build 或启动模式
- workspace、账号、fixture、功能状态要求
- artifact 目录
- 完成的 feature-map 路径

返回：

- 会话标识符
- adapter 如何确认正确的 app 和环境
- 稳定的 app 标记
- 后续调用需要的运行进程或目标细节
- 任何缺失的能力

adapter 必须把目标 app 和相似窗口、shell 或生产实例区分开。

### 驱动 UI

执行真实用户动作：

- 点击
- 打字
- 按键
- 滚动
- 拖拽
- 缩放
- 经 app 控件导航

优先 role、label 和稳定 selector。只有新截图之后才用坐标。

返回每个动作和观察到的状态变化。

不要设置内部状态、调隐藏 app 方法、直写存储、或注入 DOM 改动来制造症状。

### 驱动已建图的功能和状态

驱动 app 之前读相关 feature-map 小节。

adapter 必须暴露途径来：

- 经用户可见路径导航每个已建图功能。
- 调用该功能列出的 adapter action 名。
- 适用时与 default、hover、focus-visible、active、disabled、loading、empty、error、selected、open、expanded 和功能特有状态交互。
- 经安全 fixture 数据、权限、flag、服务响应或受支持的测试控件安排一个状态。
- 为第二次独立复现尝试重置该功能。
- 捕获 feature map 点名的截图、视频和只读交叉核对。

用 role、无障碍名称、ARIA 关系、稳定组件标记和按用途命名的 data 属性。绝不用生成的 CSS 或 StyleX class、动态 hash、子索引或脆弱的 DOM 位置。

安排前置条件不等于许可注入报告的症状。复现本身仍须来自真实用户交互。

### 检查状态

读状态以确认 UI 显示了什么。

例子：

- 无障碍树
- DOM 或视图层级
- 进程状态
- 本地日志
- 网络请求状态
- app 暴露的 debug 状态

检查是只读的。查询会改状态就归入 `drive UI`，且必须代表真实用户动作。

### 截图

把当前 app 状态捕获到请求的路径。

返回：

- 文件路径
- 捕获时间
- app 标记或窗口标题
- 应可见内容的短描述

截图必须显示足够的 app 外框来证明被测的是正确的 app。

### 录像

围绕完整复现路径起停一段录屏。

返回：

- 文件路径
- 起止时间
- 捕获的窗口或区域
- 是否略去了音频或敏感悬浮层

录像必须显示判别性的最终状态，不是只有 setup 或加载画面。

### 清理

停掉 adapter 创建的进程和会话。

移除一次性的：

- 浏览器或 app profile
- 临时 workspace
- adapter 创建的测试账号或 fixture
- debug 端口和隧道
- 过了保留窗口的捕获物

返回停掉、移除、保留或留给人处理的内容。

清理不得删除用户工作。

## Adapter 行为

adapter 必须：

- 复现开始前报告能力。
- 报告哪些 feature-map 小节能驱动、哪些受阻。
- baseline 和打过补丁的 build 用同一组环境输入。
- 启动失败要表面化为失败。
- 重试要有界。
- secret 不进日志和材料。
- 捕获物留在仓库之外。
- 两次复现尝试之间支持 fresh 或重置状态。
- 除非用户显式配置了安全测试动作，避免生产改动。

## 环境转译

宣布环境受阻之前，用不带平台专属名词的方式重述缺陷，问同一行为能否在可用环境里安全测试。

例子：

- 点名的浏览器可能意味着任何外部浏览器。
- 点名的按键可能意味着配置的快捷键。
- 点名的远程主机可能意味着延迟或断连的远程目标。

转译尝试只在测试同一底层行为时使用。标为转译证据。缺失环境本身是缺陷一部分时，不要称之为精确复现。

硬件弹窗、操作系统权限对话框、设备专属 API 和不可用的账号状态可能是真的阻碍。

## Setup 检查

启用复现 automation 之前，跑一次无害的 adapter 检查：

1. 拉起 app。
2. 确认稳定 app 标记。
3. 加载一节完成的 feature map。
4. 经其用户路径导航到该功能。
5. 经已建图 adapter action 操练一个可丢弃状态。
6. 检查产生的状态。
7. 截图。
8. 录一小段。
9. 清理。

九步全成且不涉及源频道 Slack 发帖，才启用复现工作。
