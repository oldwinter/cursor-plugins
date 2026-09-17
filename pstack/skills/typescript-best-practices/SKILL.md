---
name: typescript-best-practices
description: TypeScript best practices. Use when reading or editing any .ts or .tsx file.
paths: ["**/*.ts", "**/*.tsx"]
disable-model-invocation: true
---

# TypeScript 最佳实践

先应用 **type-system-discipline** 原则 skill。

| 规则 | 摘要 |
|------|---------|
| Discriminated union | 用 `kind` 字面量判别字段建模变体，让不可能的状态不可表示。不用 optional 字段袋。 |
| Branded type | 原始类型打 `& { readonly __brand: "X" }` brand，防止混用。在边界校验一次。 |
| 构造式建模 | 建出让非法值构造不出来的形态。非空用 `[T, ...T[]]`，偶数长度用 `[T, T][]`，区间用 `start` 加 `duration`。不是运行时守卫，也不是指望 refinement type。 |
| 最简全函数类型 | 其上每个操作都全（total）时保持 `T[]`。只在松散类型逼出 `!`、cast 或 "should never happen" throw 的地方加强到 `NonEmpty<T>`。 |
| `unknown` 而非 `any` | 外部数据是 `unknown`。 |
| schema 先于守卫 | 手写逐属性 type guard 之前，用仓库的运行时 schema 库并从 schema 推类型，如 `z.infer`。 |
| 不要 `as` cast | 每个 `as` 是等着的运行时崩溃。只在验证之后 cast。 |
| 收窄层级 | 判别字段 switch > `in` 运算符 > `typeof`/`instanceof` > 自定义 type guard > `as`。 |
| Type guard | 必须真的验证声称。撒谎的 guard 比 `as` 更糟——bug 躲在声称安全的名字后面。命名 `isX` 或 `hasX`。 |
| 穷尽性 | default 分支里内联 `const _exhaustive: never = x;`，新增变体时编译器报错。 |
| `satisfies` 而非 `as` | 验证值而不拓宽字面量类型。 |
| 边界校验 | 在数据跨入处解析成具名领域类型。`Record<string, unknown>`（不论怎么拼）止步于那次解析。内部信任类型。见 **boundary-discipline** 原则 skill。 |
| schema 派生类型 | 声明新 interface 之前先用 `Pick`/`Omit`/`Parameters`/`ReturnType`/`Awaited`/`typeof`。 |
| 对象参数 | 传对象不传位置参数，参数顺序自文档化。热路径跳过（逐帧渲染、tokenizer、parser）。 |
| 真测试 | 能跑的别 mock。优先框架的真测试原语（带泄漏/disposable 检查），UI 在运行中的 build 里验证。只 mock 本地跑不了的。 |
| 结构化遥测 | 优先结构化 logger 诊断，上下文够凭一个 id 调试。交付代码里不留 `console.log`。 |

示例：`references/patterns.md`。
