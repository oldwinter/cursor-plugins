# Code Archaeology（git + 仓库内）

## 这个来源包含什么

- commit 历史（message、日期、作者、diff）
- PR 描述、review 评论和讨论串（经 `gh`）
- 行内代码注释、TODO、FIXME、deprecation 说明
- ADR（架构决策记录），如果仓库有维护
- 测试：名字和断言经常编码了促成改动的边界情形
- 同一 commit 里被一起修改的相关文件（co-change 信号）
- 仓库里的 CHANGELOG 条目、release note
- commit message 和 PR 正文里提到的 issue/ticket ID

最可信赖的来源，直接绑定代码，也最完整。凡是经过这个仓库的都该在这里。

## 怎么搜

扩展种子 commit 列表：

```bash
# 跨越改名的完整文件历史
git log --follow --oneline -- <file>

# Pickaxe：加入或移除这段确切文本的 commit
git log -S '<exact_string_from_code>' -- <file>

# 或按模式：
git log -G '<regex>' -- <file>

# 每行是谁、什么时候写的
git blame -L <start>,<end> <file>

# 某个 commit 的完整 diff
git show <hash>

# 两个点之间影响此文件的 commit
git log <old>..<new> -p -- <file>
```

对每个实质性 commit，拉 PR 上下文：

```bash
# 从 merge commit 或 branch 找 PR 号
git log -1 --format=%B <hash>

# 完整 PR 上下文：正文、review 评论、关联 issue
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews,files

# --json 的 reviews 和 comments 字段才是真的信号所在
```

找带外文档：

```bash
# ADR 常住在 docs/adr/ 之类的地方
rg -l -i 'architecture.decision' --glob '*.md'

# 目标附近的 TODO 和 FIXME
rg -n -C2 '(TODO|FIXME|HACK|XXX|NOTE)' <target_file>

# 相关测试：名字经常编码了"为什么"
rg -l '<symbol>' --glob '*test*'
```

## 这里什么样的证据算好

- 解释了在解决什么问题的 PR 描述，而不只是改了什么（"This fixes the pagination bug that caused X"）
- 辩论过替代方案的长 review 串
- 目标行附近解释非显然约束的行内注释
- 一个叫 `test_handles_edge_case_when_X` 的测试，揭示了促成代码的边界情形
- 引用 ticket 或 incident ID 的 commit message
- 总结了用户可见理由的 CHANGELOG 条目

## 常见坑

- **Squash-merge 平地。** 仓库 squash PR 的话，branch 历史里的单个 commit 会丢。退回 PR 正文和评论。
- **误导性 commit message。** "Small refactor" 有时藏着有意为之的行为变更。看 diff，别看 message。
- **Cargo-cult 的模式。** 作者可能照抄了一个模式而不懂为什么。查这个模式是不是更早就在代码库里出现，去调查*那个* commit。
- **Bot commit 和自动合并。** Dependabot、Renovate、自动 backport 通常不携带动机。找意图时跳过它们。
- **把代码当作意图证据。** 代码本身不是它存在原因的证据。证据来自 commit message、PR、注释、测试、文档。别引用"函数名叫 X"当意图证据。

## 返回什么

每个和问题相关的 commit/PR/comment，附：
- 确切文本（引用）
- hash / PR 号 / file:line
- 作者和日期
- 是 direct（明确回应问题）还是 circumstantial（间接）
