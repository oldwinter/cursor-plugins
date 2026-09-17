# 验证已有修复

开着的 pull request 或已合并 commit 可能修了这份报告时用本模式。

已有修复物拥有该修复。验证它。不要编辑它、不写竞争补丁、不开另一个 pull request。

## 判定修复物资格

要求一个具体修复物：

- 开着、代码改动针对该症状的 pull request
- 已合并的 pull request
- 已合并、代码和意图都匹配的 commit

thread 里的声称、tracker 状态、分支名或没有 pull request 或 commit 支撑的原因假设都不够。

多个修复物并存时，选源 thread 或 tracker 链接的那个。否则选最接近受影响代码的并说明原因。

## 保护工作树

仓库支持时用隔离的 worktree 或另一个干净 checkout。不要覆盖用户改动。

记录：

- baseline 修订版
- 打过补丁的修订版
- pull request 或 commit URL
- 两次运行共享的 build 和环境输入

用常规 `github.com` pull request 链接。

## 测 baseline

开着的 pull request 用其 base 分支作 baseline。

已合并修复用紧邻修复之前的修订版——前提是该修订版能 build 且代表旧行为。

经配置的 control adapter：

1. 拉起 baseline app。
2. 确认正确的 app 和环境。
3. 经真实 UI 动作跑报告的路径。
4. 观察判别性症状。
5. 重置并重复。
6. 捕获 baseline 录像、截图和状态检查。

baseline 上症状没出现两次就没有 baseline。不要声称修复有效。

## 测打过补丁的 build

用同一环境和数据 build 并运行该 pull request 或修复 commit。

1. 跑同一 UI 路径。
2. 重复两遍。
3. 确认损坏状态已消失。
4. 确认期望状态出现。
5. 捕获 after 录像、截图和同一状态检查。

别停在编译或测试。after 结果必须来自运行中的打过补丁的 app。

## 结果

### 已确认

baseline 复现两次且打过补丁的 build 两次都消除它。

- operations 状态标为已验证。
- 链接修复物。
- 源 preflight 后发一条简洁的源 thread 回复。
- 含 before 和 after 结果。
- 不开 pull request。

### 修复不足

baseline 和打过补丁的 build 上都出现症状。

- operations 状态标为已复现但未修复。
- 链接修复物并说明它没消除症状。
- 本次运行还没用过正常确认复现的源更新就发它。
- 不开竞争性 pull request。

### 无定论

baseline 不复现、打过补丁的 app 跑不起来、或证据没显示判别性状态。

- 不要声称成功。
- 说明哪一半测不了。
- 结果留在 operations thread 或运行输出。
- 源 thread 什么也不发，除非有直接提问必须回答。

## 清理

停掉两个 build，按保留策略移除临时 profile 和捕获物，不丢弃用户工作地把仓库还原到先前状态。
