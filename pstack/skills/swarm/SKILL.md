---
name: swarm
description: "Fan out N 个并行 worker，等它们全部返回，交回一份报告。用于 /swarm、'swarm this'，或并行覆盖、race、gauntlet 和探索。"
disable-model-invocation: true
---

# Swarm

Fan out N 个并行 cloud worker。它们可以各管一片、对同一份 brief 赛跑、或两者混合。父 agent 等待、汇总、交回一份报告。

## 开始

在启动任何东西之前，开一个每阶段一条的 todolist。

1. Frame
2. Fan out
3. Aggregate
4. Report

## Phase A：Frame

1. 声明 done 谓词，以及 swarm 必须交回的制品或报告。
2. 选形态。切成切片、让 N 个 worker 跑同一份 brief 的 race，或混合。对 race 或混合形态，spawn 之前先声明 `first pass`、`rank all` 或 `best-of`。
3. N 由用户给出或从形态推导。N 是 worker 总数，不是 cloud 并发上限。
4. worker 模型取 `~/.cursor/rules/pstack-models.mdc` 里的 `swarm workers`（存在时）。否则用 `grok-4.6-fast-xhigh`。模型 race 要事先点名每个分支的模型。
5. worker 要写东西时，给每个 worker 自己的可写输出。

## Phase B：Fan out

在一条消息里 spawn 全部 N 个 worker：`subagent_type: generalPurpose`、`environment: "cloud"`、`run_in_background: true`，使用配置的模型。只有当 worker 需要访问用户电脑上的东西时才用 `environment: "local"`。

当 worker 必须从一个非默认的已推送 branch 出发时，传 `cloud_base_branch`。

每份 brief 都要能独立成立。包含目标、scope、确切的切片或 race 分支、怎么验证、报告什么。报告用 `PASS`、`ISSUES` 或 `BLOCKED`，带证据。

worker 掉队就带着 N-1 继续，并记一笔。

## Phase C：Aggregate

读最终结果。覆盖型任务里每个必需切片都要有结果。race 应用事先声明的选拔规则：first pass、rank all 或 best-of。不要原样粘贴 worker 倾倒。

保留一张紧凑结果表、一行一条的带证据问题、以及明确的缺口或掉队记录。

## Phase D：Report

交回一份整合的聊天内报告：表、一行问题、缺口或掉队、用过的 race 规则。
