# PM4 指标返佣网站

PM4 的正式网站源代码。生产域名为 [cpm4.com](https://cpm4.com)，由 Cloudflare Worker `pm4-website` 托管。

## 正式发布链路

1. `main` 分支保存当前网站源代码。
2. Cloudflare 从 GitHub 构建并部署 `pm4-website`。
3. `cpm4.com` 绑定到该 Worker，作为唯一正式网站地址。

旧 ChatGPT Sites 与 Vercel 部署不再属于当前发布链路。

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
