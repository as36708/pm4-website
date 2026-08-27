# PM4 指标返佣网站

PM4 的正式网站源代码。生产域名为 [cpm4.com](https://cpm4.com)，由 Cloudflare Worker `pm4-website` 托管。

## 正式发布链路

1. `main` 分支保存当前网站源代码。
2. Cloudflare 从 GitHub 构建并部署 `pm4-website`。
3. `cpm4.com` 绑定到该 Worker，作为唯一正式网站地址。

旧 ChatGPT Sites 与 Vercel 部署不再属于当前发布链路。

## Cloudflare 生产配置

正式 Worker 需要在 Cloudflare 中配置以下三项服务端环境绑定：

- `PM4_ADMIN_INGEST_URL`：普通环境变量，值为 PM4 管理后台的 `/api/frontend-ingest` HTTPS 接口。
- `PM4_ADMIN_INGEST_SECRET`：Worker secret，用于管理后台 Bearer 认证。
- `PM4_ADMIN_SITES_BYPASS_TOKEN`：Worker secret，用于访问 Sites 上的管理后台。

真实 secret 只保存在 Cloudflare Worker 运行环境，不写入前端代码、`.env.example` 或 Git。`vite.config.ts` 中的 `keep_vars: true` 只会保留已配置的值，首次部署前仍需在 Cloudflare 中手动建立它们。

申请接口使用 Cloudflare Workers Rate Limiting binding `APPLICATION_RATE_LIMITER`。该 binding 在 `vite.config.ts` 中以独立的 `namespace_id` `2026082801` 配置，对每个匿名来源每 60 秒最多接受 5 次有效申请。不要将此 `namespace_id` 用于账户中其他限流规则，否则同键计数器会共享。

## 发布前检查

1. 在 Cloudflare 中确认上述一个普通环境变量、两个 secret 与 `APPLICATION_RATE_LIMITER` binding 均已存在，且名称完全匹配。
2. 运行 `npm test`，确认构建产物包含 5 次/60 秒的 Rate Limiting binding，且后端代理测试通过。
3. 使用专用测试 UID 通过正式网站提交一次申请，确认前端收到 `submitted: true`。
4. 在 PM4 管理后台查询该记录，核对交易所、UID、TradingView、Discord，以及 `consentAccepted: true`、ISO 格式的 `consentedAt` 和 `policyVersion: "2026-08-28"`。
5. 删除测试记录，并在发布记录中保留烟测时间与结果；不要在日志或截图中暴露 secret。

## 本地开发

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev
npm run build
npm test
```

主要目录：

- `app/`：页面、内容和交互
- `public/`：图片、视频、Logo 等静态资源
- `worker/`：Cloudflare Worker 入口
- `tests/`：生产页面验证
