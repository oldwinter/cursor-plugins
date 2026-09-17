### Refactoring

**你拥有契约。结构变，行为不变。** 区别于 Feature——那个加行为；也区别于 Bug fix——那个纠正行为。

清理中暴露出缺失功能或真 bug 时，拆出去，先对照钉住的契约交付结构改动。重新设计是允许的，但要点名它并路由到 Feature。大的或横切的结构工作归 **figure-it-out** skill。本 playbook 管聚焦到中等规模的改动。

1. 先钉住行为契约。对受影响子系统跑 **how** skill 学契约，然后在任何结构移动之前写一个刻画测试、快照或等价 harness 来捕获当前行为。该区域没覆盖就先写 pin 再动结构。类型检查和 lint 不算 pin。
2. 按 **principle-model-the-domain** 点名代码缺的那个结构。形态已经清楚且局部的乏味代码留着。重塑必须删掉分支或非法状态，不是加间接层。
3. 点名目标形态。说出今天从零建的话模块布局、类型和调用图该是什么样（**principle-foundational-thinking**、**principle-redesign-from-first-principles**）。目标跨函数边界就在移动之前跑 **architect** skill 做形态的并行设计探索。
4. 先减后加。引入新形态之前：删死代码、压掉单一调用方 wrapper、丢冗余校验器、清孤儿引用（**principle-subtract-before-you-add**）。能到达目标形态的最小改动才交付（**principle-laziness-protocol**）。"might help"的投机清理 revert 掉。
5. 小步走、每步保持行为、保持 pin 绿。API 重塑时同一波迁移所有调用方并删除旧 API（**principle-migrate-callers-then-delete-legacy-apis**）。不留兼容垫片、不留新旧并行路径。每个 rename 对照实际文件抽查——rename 会静默漏掉字符串、散文和反向引用里的用法。机械编辑委托给 subagent，用你配置的 refactoring 模型（默认 `grok-4.6-fast-xhigh`），给具体 scope（文件路径、被移动的名字、要保持的行为）。亲自 review diff。
6. 对真实产物证明行为未变，不是"能编译"（**principle-prove-it-works**）。更大的重塑跑一次等价检查：diff 新旧输出的脚本、对新代码重放的录制基线、或经相关 control skill 在匹配 surface 上的冒烟跑。验证由你亲自拥有。别信 delegate 的"looks good"摘要。
7. 确认改动值得留。成功度量是读者负担下降（**principle-minimize-reader-load**）。diff 没在某处降低读者负担就 revert。
8. rebase 成小而有序的 commit。先一个减法 commit，再重塑，再后续清理。用 **sequence-verifiable-units** 原则 skill 塑形，让每个保持行为的切片绿了之后再有下一个。跑 **Opening a PR**。

**回复：** 变了什么结构、钉它用的 pin、等价性证明、读者负担差值、什么交付了什么 revert 了。没有新行为。
