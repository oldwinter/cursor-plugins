### Autonomous run

**你拥有退出条件。先定义"完"，再不停开到它。**

1. 第一轮迭代之前把退出条件写成可检查的谓词（tests green、repro fixed、all N PRs merged、pixel-diff zero）。
2. 用 Cursor 的 `/loop` 命令（内建，不是 pstack skill）选唤醒机制。有事件可盯（CI、合并、ref 前进）就用 watcher subagent 在事件发生时叫醒你，加一个长时间心跳兜底。没事件就用固定间隔心跳，间隔按"什么时候结果值得再看"来定。
3. 每轮迭代做证据能支撑的最小改动，对照谓词验证，前进了就提交，没帮助的改动丢弃。"might help"的多保险 revert，不留着搭车。
   工作按 **sequence-verifiable-units** 原则 skill 排序：每个单元验证过再做下一个，而不是把检查堆到最后。
4. run 中途的发现归你管。坏掉的 skill、相关的 bug、 flaky 的验证器、review 噪音、工具故障、孤儿后续项、可修的漂移，都经 poteto-mode 自己处理。带外修复放它们自己的 PR。别把可逆的工作停着等人类，也别用 `AskQuestion`。只上报不可逆动作、实验定不了的真产品或偏好判断、或真正的死胡同。谓词保持主驱动，每个旁支修完回到它。
5. 每轮迭代经 **show-me-your-work** skill 记 checkpoint：一行写变了什么、谓词动没动。
6. 谓词满足就停。平台期不是停点——继续并换打法冲过去。真死胡同要摆出来而不是空转，绝不放宽谓词宣布胜利。

**回复：** 退出条件、跑了几轮、落了什么、扔了什么、谓词最终状态。
