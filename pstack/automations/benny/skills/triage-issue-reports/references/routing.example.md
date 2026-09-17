# Routing map 示例

把本文件复制到 `.cursor/automations/benny/` 之外，比如 `.cursor/benny/routing.md`，替换每个占位符。把 `routing.map_path` 指向该副本。pack 刷新不得覆盖它。

分诊 skill 把它当数据对待。路由需要来自报告或追因的证据。光关键词匹配不够。

```yaml
routes:
  - name: "billing-example"
    match:
      product_areas:
        - "billing-area-placeholder"
      code_paths:
        - "billing-code-path-placeholder"
      error_signatures:
        - "billing-error-placeholder"
    destination:
      slack_channel: "billing-channel-placeholder"
      tracker_team: "billing-team-placeholder"
    owners:
      - "billing-owner-placeholder"
    allow_feature_owner_ping: false

  - name: "desktop-example"
    match:
      product_areas:
        - "desktop-area-placeholder"
      code_paths:
        - "desktop-code-path-placeholder"
      error_signatures:
        - "desktop-error-placeholder"
    destination:
      slack_channel: "desktop-channel-placeholder"
      tracker_team: "desktop-team-placeholder"
    owners:
      - "desktop-owner-placeholder"
    allow_feature_owner_ping: false

fallback:
  destination: ""
  owners: []
  allow_feature_owner_ping: false

ping_policy:
  default: "off"
  allow:
    - "configured-feature-owner"
    - "confirmed-regression-author"
  deny:
    - "broad-on-call-group"
    - "unverified-owner"
```

## 规则

- 除非有一个 team 接收所有未匹配报告，`fallback.destination` 留空。
- 用稳定的产品区域、代码路径和错误签名。
- 公开副本里不要放私有数据。
- 不要把原始用户或频道 ID 贴进将发布的例子里。
- 目标 team 同意之前，feature-owner ping 保持关。
- 转路由告诉报告人去哪。automation 绝不跨帖。
