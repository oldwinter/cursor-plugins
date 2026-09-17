---
name: principle-exhaust-the-design-space
description: "面对代码库里没有先例的新型 UI 交互或架构决策时应用。在定案之前构建 2-3 个互相竞争的 prototype 并排比较。"
disable-model-invocation: true
---

# Exhaust the Design Space（穷尽设计空间）

当新型交互或架构决策没有现成先例时，实现之前先探索几个具体候选。做错东西的代价高于探索三个选项。

**规则。** 当正确答案不显然时，构建 2-3 个互相竞争的 prototype 或草图。并排比较。然后才定案。"Design it twice" 是这条规则的另一个名字。第一个形态的第二种口味不算数。

**适用：**
- 新型 UI 交互（代码库里没有先例）
- 有多个可行方案的架构选择
- 用户体验取决于手感而非逻辑的产品设计决策

**不适用：**
- 模式已确立的机械实现
- 目标状态明确的 bug 修复或重构
- 约束已指定唯一可行方案的改动
