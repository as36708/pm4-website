# 官网 ingest 新旧请求对照与预览诊断

比较基线：旧版 9e4c2c92（回滚 63d45592 的源码与其相同），兼容版 a501b7bc。本分支基于 a501b7bc，仅补脱敏失败日志，不调整上游方法、URL、头、body、重定向或超时。

## 已查事实

- 2026-09-13 23:47:38 KST，新版 POST /api/track 返回 503 / FRONTEND_STATS_FAILED，旧 Sites 未新增记录。
- 23:52:26 KST，回滚旧版通过原路径 POST /api/frontend-events 真实复测，仍为相同 503，数据库未新增记录。
- FRONTEND_STATS_FAILED 及对浏览器返回的 503 来自官网 Worker；它将上游非 2xx、缺 tracked=true、JSON 解析失败或 fetch 异常统一转为这个结果，不能把它当作已知的上游 HTTP 状态。
- 旧、新源码均未记录上游 HTTP 码/响应体；生产 traces=false。CLI OAuth 读取历史日志 API 返回 403。不能补造历史上游响应。
- Sites 最近日志接口最多 100 项，已读窗口内日志与错误列表没有给出该请求的上游详情；不把“没看到日志”当作“请求没到”的证明。

## 出站逐项对照

| 项目 | 旧版 | a501b7bc | 结论 |
| --- | --- | --- | --- |
| 方法 | POST | POST | 相同 |
| 地址来源 | PM4_ADMIN_INGEST_URL，限定旧主机 | PM4_ADMIN_INGEST_URL，接受合法 HTTPS 主机 | 已绑定旧 URL 时相同；均无缺失兜底 |
| 实际路径 | /api/frontend-ingest | /api/frontend-ingest | 小写、无尾斜杠，相同 |
| URL 规范化 | trim → new URL → toString；不自动加路径斜杠 | 相同 | 带尾斜杠的路径两版都会在配置校验拒绝 |
| accept | 存在，application/json | 存在，application/json | 相同 |
| authorization | 存在，Bearer [REDACTED]；来自官网 PM4_ADMIN_INGEST_SECRET.trim() | 相同 | 同一运行绑定；真实值未读取 |
| content-type | 存在，application/json | 存在，application/json | 相同 |
| OAI-Sites-Authorization | 必须存在，Bearer [REDACTED]；来自 PM4_ADMIN_SITES_BYPASS_TOKEN.trim() | 有非空 token 才存在，格式相同 | 本次 token 已设置，因此相同 |
| 头构造方式 | 普通对象 | Headers 实例 | 序列化后的头名可小写；HTTP 头名不区分大小写，未改 token 内容/前缀 |
| Origin / Referer / Cookie | 不主动设置 | 不主动设置 | 同源 Origin 是浏览器入站校验，不转发为后台身份 |
| Host / Content-Length / 传输头 | fetch 平台生成 | fetch 平台生成 | 非源码显式头，历史实际线缆值未采集，不能假装比对了每个自动头 |
| track body | action,eventType,exchange,sourceKey,eventKey | 同左 | 字段/算法全部相同 |
| sourceKey | 当日客户端地址和 ingest secret 的 SHA-256 截取 32 位十六进制 | 同左 | 照旧带上 |
| eventKey | sourceKey/事件/交易所/时间桶散列 48 位十六进制 | 同左 | 照旧带上 |
| application body | action,exchange,uid,tradingViewUser,discordUser,sourceKey,consentAccepted,consentedAt,policyVersion | 同左 | 不改表单、同意记录或限流 |
| 跟随重定向 | 未指定，fetch 默认 follow | 显式 manual | 真实行为差异；旧版也失败，尚无证据证明它是本次根因 |
| 超时 | track 5000ms；application 8000ms | 同左 | 相同 |
| cache | no-store | no-store | 相同 |
| 响应成功条件 | 2xx 且 JSON tracked=true / submitted=true | 同左 | 相同 |

两个授权头不能互换：官网 ingest secret 对应后台 PM4_FRONTEND_INGEST_SECRET；Sites 头只供站点入口既有链路使用。禁止代理在本地取得 bypass token 直接调用后台；预览测试只调用官网预览入口，密钥始终留在 Cloudflare 绑定中。

## 原离线测试与真实服务的差距

原测试替换上游 fetch，检查指定 URL、头及 body 后固定接受并返回 JSON。它没有验证 Cloudflare 内实际绑定值的配套性、Sites 入口认证、真实重定向、后台当前写入条件或真实响应体。四组合绿灯只证明代理分支逻辑，不证明真实 Sites 接收成功。

本次新增日志只允许固定错误字符串/代码白名单、状态码、内容类型、是否有 Location、JSON 成功布尔值及异常类型；未知响应文字记 [redacted]。不记录密钥、请求体、用户资料、原始异常消息或重定向 URL。

## 预览边界与修法状态

PM4已授权非生产 Git 分支构建，生产 main 保持 63d45592。先完成上述对照和本地测试，再推本分支；从 GitHub 构建回执/API 取得实际预览地址，不猜 URL，不将预览版本部署为生产。通过已有绑定调用旧 Sites；不读取密钥，不手工带 bypass 直调后台。

先用脱敏日志取得真实上游失败类别，再决定配置修复或代码修复。未取证前不把禁重定向撤掉，也不编造已经修好的根因。预览及修复结果另附回执，生产发布仍须 PM4 按完整 hash 授权。
