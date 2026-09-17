# TypeScript 模式

`SKILL.md` 每条规则的代码示例。背后的原则是语言无关的。见 **type-system-discipline** 和 **boundary-discipline** 原则 skill。

## Branded type

给原始类型打 brand 防止混用。在边界校验一次。下游代码信任该类型。

```ts
type AgentId = string & { readonly __brand: "AgentId" };

function parseAgentId(input: string): AgentId {
  if (!isUUID(input)) throw new Error(`Invalid agent id: ${input}`);
  return input as AgentId;
}

function focusAgent(id: AgentId): void {
  /* input is trusted */
}
```

匹配 `readonly __brand: 'X'` 形态。别发明新约定。

## Discriminated union

用字面量判别字段建模变体。每个变体共享字段名、各自值唯一，所以不可能的组合不可表示。

```ts
// 别。boolean + optional 让矛盾状态存在。
type DiffState = { loading: boolean; diff?: GitDiff; error?: string };

// 要。只有合法状态存在。
type DiffState =
  | { kind: "loading" }
  | { kind: "ready"; diff: GitDiff }
  | { kind: "error"; error: string };
```

选定一个判别字段名（`kind`、`type`、`tag`）就守到底。

## 构造式建模

从全合法的部分搭出类型，而不是用运行时检查去限制松散类型。

非空，用变长元组：

```ts
type NonEmpty<T> = [T, ...T[]];

// 别：T[] 加一个每个调用方都要重复的长度检查
function pickWinner(entries: string[]): string {
  if (entries.length === 0) throw new Error("no entries");
  return entries[Math.floor(Math.random() * entries.length)];
}

// 要：该类型的空值无法存在
function pickWinner(entries: NonEmpty<string>): string {
  return entries[Math.floor(Math.random() * entries.length)];
}
```

拿到普通 `T[]` 的地方，用守卫收窄一次。这个事实随后由类型携带：

```ts
const isNonEmpty = <T>(arr: T[]): arr is NonEmpty<T> => arr.length > 0;
```

偶数长度，用对子：

```ts
type Pairs<T> = [T, T][];
```

时间区间，用 start 加 duration：

```ts
// 别：不变量靠注释守着
type TimeRange = { start: Date; end: Date }; // start <= end

// 要：负区间写不出来；需要时推导 end
type TimeRange = { start: Date; durationMs: number };
```

`durationMs` 保持普通 number。只有当裸 number 可能被传到期望 duration 的地方才打 brand（按 Branded types），别凭反射打。选让坏状态构造不出来的表示，然后在上面暴露你要的读法（`pairs.flat()`、`rangeEnd()` helper）。

## 最简全函数类型

别什么都加强。其上每个操作都全（total）时保持 `T[]`：

```ts
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0); // [] is 0, fine
```

松散类型在使用点逼出谎言时才加强。征兆是 `!`、`arr[0] as T`、`"should never happen"` throw：

```ts
// 别：把部分性偷运过编译器
function newestSession(sessions: Session[]): Session {
  return sessions.at(0)!;
}

// 要：加强输入，断言消失
function newestSession(sessions: NonEmpty<Session>): Session {
  return sessions[0];
}
```

把结果放宽成 `Session | undefined` 是另一个全函数签名。

## `unknown` 而非 `any`

外部数据永远是 `unknown`。用前收窄。

```ts
// 别
function handle(input: any) {
  return input.foo.bar;
}

// 要
function handle(input: unknown) {
  if (typeof input === "object" && input !== null && "foo" in input) {
    // 收窄了；编译器验证访问
  }
}
```

外部来源包括 RPC payload、`JSON.parse`、`postMessage`、IPC、文件内容、环境变量、数据库结果。

## schema 先于手搓守卫

为外部数据手写逐属性 type guard 之前，先找仓库的运行时 schema 库和既有 schema。让一个 schema 拥有校验，TypeScript 类型从它派生。不要同时维护会各自漂移的 schema、重复 interface 和 guard。

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

type User = z.infer<typeof UserSchema>;

function parseUser(input: unknown): User {
  return UserSchema.parse(input);
}
```

失败是预期分支时用 `safeParse`。仓库用别的 schema 库时用等价的推导 helper。别为一个 guard 加新 schema 依赖。这条规则优先代码库已信任的 schema 系统。

## 不要 `as` cast

每个 `as` 是潜在的运行时崩溃。只在类型系统验证了声称之后 cast。

```ts
// 别
const user = data as User;

// 要。在边界挣到 cast。
function parseUser(data: unknown): User {
  if (typeof data !== "object" || data === null) {
    throw new Error("expected object");
  }
  if (!("id" in data) || typeof (data as Record<string, unknown>).id !== "string") {
    throw new Error("expected id");
  }
  // ... 校验所有字段
  return data as User; // OK，完整验证后挣得的 cast
}
```

从现有代码里重构掉 `as` 时，先弄清 TypeScript 为什么推不出来：

- 缺判别字段：加一个，换成 discriminated union。
- 源类型太宽（如 `Record<string, unknown>`）：收窄它。
- 边界无类型：加解析函数或 schema。
- 真的表达不了：用 branded type 或 `satisfies`。

## 收窄层级

从最好到最后手段：

1. **Discriminated union switch / if。** 编译器自动收窄。
2. **`in` 运算符。** `"key" in obj` 收窄到含该 key 的变体。
3. **`typeof` / `instanceof`。** 原始类型和类实例。
4. **自定义 type guard。** 上面不够时。
5. **`as` cast。** 只在验证之后。

```ts
function area(s: Shape): number {
  if ("radius" in s) return Math.PI * s.radius ** 2; // 收窄到 circle
  return s.width * s.height; // 收窄到 rect
}
```

## Type guard

guard 必须真验证声称。撒谎的 guard 比 `as` 更糟。

```ts
function isCircle(s: Shape): s is Shape & { kind: "circle" } {
  return s.kind === "circle";
}
```

能用判别字段收窄就优先用它。

## 穷尽性

default 分支里把判别字段赋给 `never` 类型的局部变量。

```ts
// 有返回值的 switch
function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "rect":
      return s.width * s.height;
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

// void switch
function handle(s: Shape): void {
  switch (s.kind) {
    case "circle":
      drawCircle(s);
      break;
    case "rect":
      drawRect(s);
      break;
    default: {
      const _exhaustive: never = s;
      void _exhaustive;
    }
  }
}
```

返回值 switch 用 return 式，语句 switch 用 void 式。

## `satisfies` 而非 `as`

`satisfies` 验证而不拓宽字面量类型。

```ts
// 别。拓宽了，丢了字面量类型。
const config = { theme: "dark", cols: 3 } as Config;

// 要。验证且保留字面量类型。
const config = { theme: "dark", cols: 3 } satisfies Config;
// config.theme 是 "dark"（字面量），不是 string
```

## 边界校验

在数据跨入处校验一次。内部信任类型。见 **boundary-discipline** 原则 skill。

- **Wire format**（proto、JSON-RPC）：带 `ignoreUnknownFields` 解析，前向兼容改动不打断老客户端。
- **持久化 JSON：** 带版本的 blob，parse 外包 try/catch。
- **不要在调用链深处重复校验。**

## schema 派生类型

`.proto`、OpenAPI spec、GraphQL schema 或数据库迁移已定义形态时，从生成类型派生而不是复刻。

```ts
// 别。复刻形态，schema 变了就漂移。
type CheckSummary = {
  totalCount: number;
  checks: { name: string; status: string }[];
};
function renderChecks(s: CheckSummary) {
  /* ... */
}

// 要。从生成的 schema 类型派生。
import type { ChecksMessage } from "<generated module>";
function renderChecks(s: Pick<ChecksMessage, "totalCount" | "checks">) {
  /* ... */
}
```

写新 interface 之前先用 `Pick`、`Omit`、`Parameters`、`ReturnType`、`Awaited`、`typeof`。

## 对象参数

```ts
// 别。两个参数对调仍能编译。
openFile(uri, {
  startLineNumber: 10,
  startColumn: 1,
  endLineNumber: 10,
  endColumn: 1,
});

// 要。与顺序无关、自文档化。
openFile({
  uri,
  selection: {
    startLineNumber: 10,
    startColumn: 1,
    endLineNumber: 10,
    endColumn: 1,
  },
});
```

热路径跳过：逐帧渲染、tokenizer、parser、分配成本要紧的紧循环。
