# 11号｜PM4 正式官网 Worker 切换清单

更新：2026-09-13。本次交付是生产仓库 as36708/pm4-website 的本地兼容修复，基于 main 的 9e4c2c92cc167de074ba14aa0b975be4cd83ba4d。未推送、未部署、未修改线上绑定；生产尚未应用本提交。

## 1. 生产实证、配置归属与密钥契约

### 1.1 已核实的部署信息

| 项目 | 事实 |
| --- | --- |
| 正式官网 | Cloudflare Worker **pm4-website**，唯一自定义域 **cpm4.com**，Origin 为 https://cpm4.com |
| 其他入口 | 两条 workers.dev 入口（正式、预览）；完整地址未提供，不拼造 |
| Git 自动构建 | **as36708/pm4-website**；生产分支已配置，发布前核对控制台为 main；监视路径 * |
| 构建令牌 | 名称 **pm4-website build token**；不记录真实值 |
| 兼容配置 | **2026-05-22 / nodejs_compat**，本次保持原配置 |
| 演练项目 | Pages **pm4-website-rehearsal-1330a50d**；不是正式官网，切换后清理 |
| 线上 URL | 用户控制台实证仍为 https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest |
| 线上 Secret | 官网 ingest secret、Sites bypass token 均已设置；不能据此声称与新后台同值 |
| DNS | 已证实 cpm4.com 绑定 Worker；本次不改官网域名或 DNS。未提供底层 type/content/proxy/TTL，不猜测 |

### 1.2 面板变量不会被当前正常 Git 构建恢复旧值

vite.config.ts 的 Cloudflare 插件配置含 **keep_vars: true**，没有 vars 中的 PM4_ADMIN_INGEST_URL 定义。本次构建生成 dist/server/wrangler.json 后，自动测试也确认 keep_vars 为 true、没有 URL 默认值。因此 URL 继续由 **Worker 运行时 Variables and Secrets** 管理，不必把新地址写入仓库。

本结论以现有构建链没有额外同名 --var 覆盖为前提；实际 Build/Deploy command 尚未取得控制台实证，发布时核对既有命令。以后增加同名 vars 或命令覆盖时须重新核对。**Builds 的构建环境变量不是 Worker 运行绑定。** 普通部署保留 Secrets；删除代码引用不会自动删除旧 Secret。[Cloudflare 配置说明](https://developers.cloudflare.com/workers/wrangler/configuration/#source-of-truth)、[Builds 配置](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)

### 1.3 运行绑定清单和两端确切键名

| 位置 / 键名 | 类型与要求 |
| --- | --- |
| 官网 PM4_ADMIN_INGEST_URL | 必填明文；完整 HTTPS /api/frontend-ingest 地址，不接受凭据、查询参数或片段；无默认地址 |
| 官网 PM4_ADMIN_INGEST_SECRET | 必填 Secret；用作出站 Authorization: Bearer 的值 |
| 后台 PM4_FRONTEND_INGEST_SECRET | 后台接收 Bearer 的确切键名；必须与官网 PM4_ADMIN_INGEST_SECRET **同值** |
| 官网 PM4_ADMIN_SITES_BYPASS_TOKEN | **可选 Secret**。有非空值才带 OAI-Sites-Authorization: Bearer；不存在或全空白则不带该头，也不因缺它返回 503。旧 Sites 过渡期使用；切换成功后必须删除 |
| 官网 APPLICATION_RATE_LIMITER | 保留 vite.config.ts 既有限流绑定：namespace_id 2026082801，5 次 / 60 秒 |
| 官网 ASSETS / IMAGES | 保留已有构建与图片绑定，不属于本次 ingest 变量切换 |

**官网 PM4_ADMIN_INGEST_SECRET ↔ 后台 PM4_FRONTEND_INGEST_SECRET：改一边必须同时改另一边。** “同时”指同一受控暂停提交窗口内完成两端配套并验证后恢复流量；不是要求两次保存物理上同一毫秒。轮换或回滚都不得只改一端，真实值不进 Git、聊天或日志。

核对依据：官网 worker/index.ts 构建 Bearer；后台 worker/index.ts 的 handleFrontendIngest 读取 PM4_FRONTEND_INGEST_SECRET 并检查认证。同值契约已通过合成值离线测试；**线上新后台与正式 Worker 当前真实值是否相同尚未实证**。发布操作者须经既有安全通道完成配套并用真实上报验证，只记录同值结论，不回传真实值。

sourceKey 沿用生产算法，由当日客户端地址和 ingest secret 散列为 32 位十六进制；eventKey 沿用事件/交易所/时间桶散列为 48 位十六进制。本提交不引入演练分支的固定 sourceKey 环境变量，不更改表单、统计、去重或限流口径。

## 2. 切换时的精确操作顺序

### 2.1 先发布兼容代码，保留旧链路

1. **PM4/Claude：Workers & Pages → pm4-website → Settings → Builds**。核仓库、生产分支 main、Watch paths=*、构建令牌名称与既有 Build/Deploy command；不得附加同名旧 URL 覆盖。记录当前活动 Worker 版本和关联提交。
2. 官网负责人已在生产仓库准备本提交：解除旧主机锁、可选 bypass、禁止跟随重定向，新增 /api/track 和 /api/applications，保留页面原接口。完整离线结果见 §6。
3. **只有获得 PM4 推送授权后**，将通过检查的候选合入生产分支并推送，触发 Git 自动构建。当前这一步尚未执行。先保持旧 URL、旧配套 secret、旧 bypass；兼容修复支持此组合，不要求此时切后台。
4. 核 Builds 成功且 Deployments 活动版本关联正确候选 SHA；按现有验收流程核旧链路可用。记录旧 URL、旧 secret 的受控版本引用及旧 bypass 的恢复材料，不把真实值写入回执。

### 2.2 窗口内切到新后台

1. 按总 runbook 的停收/停写安排暂停官网提交；本页不假定存在某个未实现的维护开关。
2. **Workers & Pages → pm4-website → Settings → Variables and Secrets**。编辑 **PM4_ADMIN_INGEST_URL** 为 **https://admin.cpm4.com/api/frontend-ingest**。这里是 Worker 运行绑定，不进入 Pages 项目或 Builds 环境变量。
3. 核官网 **PM4_ADMIN_INGEST_SECRET** 与新后台 **PM4_FRONTEND_INGEST_SECRET** 同值；若需改值，在本窗口中完成两端配套，官网使用 Secret 类型。**改一边必须同时改另一边。**
4. 在同一面板删除官网 **PM4_ADMIN_SITES_BYPASS_TOKEN** 绑定。代码只要发现它存在，就会发送该头（包括新地址），不会根据主机名自动省略。若先保留它完成过渡验证，成功后仍必须删除，并重新部署、复验无 token 的最终状态。
5. 保存并按面板 **Deploy / Save and deploy** 确认配置版本部署；若仅保存了版本，到 **Deployments** 将该版本部署生效。确认活动代码仍为兼容候选、URL 为新值、Secret 已设置、bypass 绑定不存在，记录版本和时间。不要只看输入框已保存。[Cloudflare Secret 面板步骤](https://developers.cloudflare.com/workers/configuration/secrets/#via-the-dashboard)
6. 执行 §3 五分钟验证，成功后按总 runbook 恢复官网提交。官网唯一自定义域仍 cpm4.com；本次不改 DNS，不运行 Pages 部署。
7. 保留一次切换后同一候选的正常 Git 构建/重建回执，再核 URL 仍指新后台、bypass 仍不存在；不为验证推无关代码。此项尚未在线执行。

## 3. 生效后 5 分钟内真实验证

| 方向 | 方法和精确路径 | 请求 / 验证点 |
| --- | --- | --- |
| 浏览器 → 官网 | **POST https://cpm4.com/api/track** | eventType=exchange_click、exchange=Gate；Origin=https://cpm4.com |
| 浏览器 → 官网 | **POST https://cpm4.com/api/applications** | exchange、数字 uid、tradingViewUser、discordUser、acceptedPrivacy=true；website 蜜罐为空 |
| 当前页面原接口 | **POST /api/frontend-events**、**POST /api/indicator-applications** | 分别与上面两个新路径共用处理器；现有页面无需更改 |
| Worker → 新后台 | **POST https://admin.cpm4.com/api/frontend-ingest** | action=track/application；Bearer 从官网 Secret 读取；最终状态无 Sites 头；redirect=manual，不跟随重定向 |

1. **0～1 分钟，PM4/Claude + 6号：** 记活动 Worker 版本、T0 和新正式后台 UTC 当日 Gate exchange_click/application_submit 基线；使用约定的非客户验收资料，不能拿旧演练记录充数。
2. **1～2 分钟，PM4/Claude：** 打开 https://cpm4.com 并保留 Network。点击一次 Gate 入口，确认 POST /api/frontend-events 返回 tracked=true；提交一次官网申请表，确认 POST /api/indicator-applications 返回 submitted=true。这两条实际页面路径与 /api/track、/api/applications 的处理逻辑相同。浏览器不放后台密钥。
3. **2～4 分钟，6号：** 在 **admin.cpm4.com 对应新正式库** 核 frontend_ingest_events 出现本次 track；front_daily_metrics 对应点击与申请指标各新增一次；frontend_applications 与 admin_users 可关联本次申请并查到后台 **recordKey**。官网申请响应仍为 uid/submittedAt，不透传 recordKey；由后台查询确认。
4. **4～5 分钟：** 记 HTTP 状态、关联时间、活动版本和脱敏入库结论。额外页面 visit 不当作这次点击；首页 200 不能代替入库验证。失败保持暂停提交并转 §4。重复事件不重复计数仍按总验收标准核查，不修改口径。

本次没有在线发送验收请求，也没有声称新库已收到记录。

## 4. 回滚

1. 暂停官网提交，按总 runbook 确认旧 Sites 仍可作为落点；新后台已有或不能排除增量时，6号先完成批准的数据回切，不能只改 URL。
2. **保留本次兼容代码即可回旧地址**，无须为了发送旧 Sites 头撤销本提交。若需回退代码，也必须同步 Git 生产分支与 Worker 活动版本，避免下次构建前滚。
3. **Workers & Pages → pm4-website → Settings → Variables and Secrets**：PM4_ADMIN_INGEST_URL 改回 **https://pm4-rebate-admin.chexin1103.chatgpt.site/api/frontend-ingest**；官网 PM4_ADMIN_INGEST_SECRET 与旧后台 PM4_FRONTEND_INGEST_SECRET 恢复配套。**改一边必须同时改另一边。**
4. 从受控恢复材料重新设置旧 PM4_ADMIN_SITES_BYPASS_TOKEN Secret。代码允许无 token 转发，但旧 Sites 自身可能要求它；生产回滚使用已验证的旧地址 + token 组合。
5. 保存并部署，核活动版本和绑定，然后按 §3 在旧后台核真实 track 和 application 入库，再按总安排恢复提交。cpm4.com 及其 DNS 不变。
6. 旧 token 已撤销或 Sites 已停用时，不得宣称本回滚可执行；恢复材料不得从聊天找回或事后读取已删除的 Secret。

## 5. 收尾

- 成功切换后，确认正式 Worker 已删除 PM4_ADMIN_SITES_BYPASS_TOKEN 绑定；keep_vars 不会替你删除。
- 留存演练回执并确认无继续使用后，**Workers & Pages → pm4-website-rehearsal-1330a50d → Settings → Delete project**，核完整名称后清理。不要删除 pm4-website Worker。
- Access、旧交易所 Key、Sites 停用和后台 DNS 仍按总目录对应负责人清单操作，本提交没有执行这些动作。

## 6. 本地离线验收回执

运行：npm test（含 vinext build 与全部 tests/*.test.mjs）。四种组合均在实际生成的 dist/server/index.js 上测试；上游 fetch 被替换为校验 Bearer/请求体并接受请求的离线替身，无生产网络请求。

| 组合 | 预期 | 实际 |
| --- | --- | --- |
| 旧地址 + token | 转发到配置旧地址，带 Sites 头；track/application 均 200 | 两条新路径与两条现有路径均 200，通过 |
| 旧地址 + 无 token | 转发到配置旧地址，不带 Sites 头；不得因本地缺 token 拒绝 | 两条新路径与两条现有路径均 200，通过 |
| 新地址 + token | 转发到配置新地址，存在 token 才带 Sites 头 | 两条新路径与两条现有路径均 200，通过 |
| 新地址 + 无 token | 转发到配置新地址，不带 Sites 头；track/application 均 200 | 两条新路径与两条现有路径均 200，通过 |

**37 / 37 测试通过，0 失败。** 还覆盖缺失/非法 URL、缺失 ingest secret 零转发并明确报错；错 Origin 403、错方法 405；上游 302/307/401 均报失败且不跟随；别名共享原有去重；生成配置 keep_vars=true 且无 URL 默认值。

离线通过证明官网转发兼容性，**不证明真实旧 Sites 在无 token 时放行**。真实上游若拒绝或重定向，官网仍返回相应上报失败 503，不能伪报成功；这不同于旧代码在缺少可选 token 时根本不发送请求的配置错误。

npm run lint 通过（退出码 0）。未推送、未部署、未操作生产。
