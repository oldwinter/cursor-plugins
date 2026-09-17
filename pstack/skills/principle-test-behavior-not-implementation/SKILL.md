---
name: principle-test-behavior-not-implementation
description: "在编写、修改或保留一个测试时应用。以用户调用代码的方式去调用它，并断言用户观察到的结果等于一个字面量期望值。如果让每个被 import 的函数都返回 undefined 测试仍然通过，就重写断言或者删掉这个测试。"
disable-model-invocation: true
---

# Test Behavior, Not Implementation（测行为，不测实现）

测试以用户调用代码的方式调用它，并断言用户观察到的结果等于一个字面量期望值。断言代码发起了哪些调用、或复述代码里某个常量的测试，两样都没做到。

检验：保留一个测试之前，先问：如果它 import 的每个函数都返回 `undefined`，它还会通过吗？会，说明它没有观察任何行为，也不可能因缺陷而失败。重写断言，或删掉这个测试。

**为什么：** 不会为缺陷失败的测试白耗 CI 时间和 review 注意力，什么也抓不到。常量钉死还有另一个坏处：一旦有人改那个常量或它复述的 prompt 就挂，等于阻止那次编辑。

**五种在每个被 import 函数都返回 `undefined` 时仍通过的形态：**

- **弱断言或没断言。** 没有 `expect`，或只有 `toBeDefined`、`toBeTruthy`、`not.toThrow`、`toBeInstanceOf`、`toBeGreaterThan(0)`。
- **只断言 mock 或缺失。** 只有 `toHaveBeenCalled`、`not.toHaveBeenCalled`、`toBeUndefined`、`toEqual([])`、`toHaveLength(0)`、`not.toBe(wrongValue)`。
- **自我引用。** 期望值来自被测代码本身：`expect(f(a)).toBe(f(a))`、`expect(parsed.url).toBe(buildUrl(...))`。
- **常量钉死。** 断言复述一个手工维护的常量、config 默认值、表行或 prompt 字符串：`expect(LIMITS.maxTools).toBe(8)`、`expect(PROMPT).toContain("You are")`。
- **fixture 断言 fixture。** 断言读的是测试自己构造的数据或 `beforeEach` 里算出的值，被测对象根本没在测试体里跑过。

**修法：** 在测试体里用一个具体输入调用被测对象，断言字面量输出或可观察的副作用：`expect(slugify("Hello, World!")).toBe("hello-world")`。断言缺失时，在同一个测试里对另一个输入断言其存在。对常量，用一个输入测读它的机制，而不是复述那个值。对 mock，断言它收到的 payload 或调用后的状态，而不是它被调用了。不存在这样的断言时，删掉测试。

**保留**两类：跨表行断言关系的测试（两个表都存在的 key、确实存在的 parent），以及 `*.test-d.ts` 文件里的编译期检查。
