---
name: principle-migrate-callers-then-delete-legacy-apis
description: "当旧调用方还在时要引入新的内部 API 时应用。迁移调用方和删除旧 API 放在同一波里完成，而不是保留兼容层。"
disable-model-invocation: true
---

# Migrate Callers Then Delete Legacy APIs（先迁调用方，再删旧 API）

当我们认定新 API 是正确设计时，在同一波重构里迁移调用方并移除旧 API，而不是保留兼容层。

**规则：**
- 不要只因为内部调用方还存在就保留旧 API 路径
- 盘点调用方，迁移它们，立刻删掉旧 API
- 把临时 adapter 当作例外且限期的存在，不是默认架构
- 更新测试去断言新契约；删掉那些只守护重构前实现细节的测试

**适用条件：**
- 没有外部用户依赖向后兼容
- 项目能承受协调好的破坏性变更
- 新 API 属于一次简化或重构行动

同时保留新旧两套 API 会制造双路径复杂度、拖慢清理，并让代码库感觉只增不减。
