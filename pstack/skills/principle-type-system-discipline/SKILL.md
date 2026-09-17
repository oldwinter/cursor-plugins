---
name: principle-type-system-discipline
description: "在设计类型、review 函数签名、或用任何静态类型语言写代码时应用。让非法状态无法被表示，给语义 primitive 打 brand，在边界解析外部数据，拒绝对编译器撒谎，穷尽 variant，从权威 schema 派生。"
disable-model-invocation: true
---

# Type System Discipline（类型系统纪律）

type checker 是一个证明助手。用它把不可能的状态、不匹配的 primitive 和未处理的 variant 消灭在编译期。类型放你漏掉的分支，会变成编译器本可以拦下的运行时故障。宁可把错误和特例从定义上消除，也不要增殖 handler。无法表示的状态、total function 和接口重设计（下述模式）就是工具。

适用于任何类型语言。`typescript-best-practices` 这类 skill 把它落到具体语法上。

**模式：**

- **让非法状态无法表示。** 用 sum type 建模 variant：TypeScript 的 discriminated union，Rust/Swift/Kotlin 带 payload 的 enum，Scala 的 sealed class，Haskell/OCaml 的 ADT。不要把状态建模成一包 optional 字段——矛盾组合照样能编译。一个隐蔽反模式：`{ completed: boolean; completedAt?: Date }` 容许 `completed: true; completedAt: undefined`，这没有意义。从单一来源派生 boolean，比如 `completedAt !== null`，或把 variant 显式建模为 `{ kind: 'open' } | { kind: 'done'; at: Date }`。如果一个 bug 逼出"等等，这个组合真的会发生吗？"这种问题，类型就太松了。
- **类型是构造，不是限制。** 从你想要的值出发把类型建起来，而不是从更松的类型里拿检查往外砍。看似需要 refinement type 的不变量，通常只差一种构造。非空列表是 head 加 rest，不是一个带长度检查的 list。合法时间范围是 start 加 duration，不是两个你得保持有序的 timestamp。没有哪种表示是特权表示：pair 列表换个解释就是偶数长度列表。选那个造不出非法值的形态，再在上面暴露调用方需要的接口。
- **给语义 primitive 打 brand。** `UserId` 和 `OrderId` 底层都是 string，但不该可互换。Rust 的 newtype、Swift 的 opaque type、Kotlin 的 value class、Haskell 的 phantom type、TypeScript 的 branded intersection。创建时校验一次，下游信任类型。
- **外部数据在解析之前是无类型的。** RPC payload、JSON、IPC 消息、CLI 参数、config 文件、环境变量、数据库行。每个边界都要有 parse 函数把无结构输入变成类型化模型。校验放哪里见 **boundary-discipline** 原则 skill。
- **别对类型系统撒谎。** cast、不安全的强转、绕过编译器的 assertion 函数，都是潜伏的运行时崩溃。编译器证明不了的事实，要么你来证明（校验、收窄、精化模型），要么承认这个 cast 是隐患。
- **穷尽匹配是编译器的活。** 对 sum type 做 match 时，新增 variant 而没有处理分支必须让编译失败。用你语言提供的惯用法：TypeScript 的 `never` 类型绑定、Rust 不加标注的 `match`、Haskell 的 `-Wincomplete-patterns`、Kotlin 的 sealed-class match 穷尽性。
- **从权威 schema 派生类型。** 当 protobuf、OpenAPI spec、GraphQL schema、数据库迁移或 design-system token 文件定义了形态，从它派生，别手搓平行类型。见 **encode-lessons-in-structure** 原则 skill。
- **只在出现 partiality 的地方加强类型。** 一个运行时断言、null check 或"这不该发生"的 throw，标记的正是类型太弱的位置。把那个检查抬进类型里。然后停手。类型系统的职责是追踪每个使用点必须处理的分支，不是尽可能精确地描述数据。优先 total function：空列表的 `sum` 是 0，所以它收普通 list；空列表的 `head` 没有答案，所以它要求非空 list。

**检验：**

- "我能写注释解释这组字段什么组合合法吗？" 能，类型就太松。拆成 sum type。
- "我有两个函数参数共享一个 primitive 类型但含义不同吗？" 给它们打 brand。
- "这个 `any`、这个 `as`、这个 `assertNotNull` 哪来的？" 追溯到边界，在那里校验。
- "下个月加了新 variant，编译器会告诉下一个 agent 去哪儿加分支吗？" 不会，match 就没穷尽。
- "这个类型在复制另一个文件拥有的形态吗？" 改为派生。
- "我加强这个类型是为保持某个操作 total，还是只为更精确？" 如果没有别的东西会 panic，保留朴素类型。
