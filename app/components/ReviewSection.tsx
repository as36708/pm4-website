"use client";

import { useMemo, useRef, useState } from "react";
import { EXTERNAL_LINKS } from "../links";

const reviewExchanges = ["Bybit", "Bitget", "BingX", "Gate"];

type ReviewField = "exchange" | "uid" | "tradingView";
type ReviewErrors = Partial<Record<ReviewField, string>>;

type ReviewSectionProps = {
  prefillExchange?: string;
  prefillUid?: string;
  prefilled?: boolean;
  standalone?: boolean;
};

export default function ReviewSection({ prefillExchange = "", prefillUid = "", prefilled = false, standalone = false }: ReviewSectionProps) {
  const [exchange, setExchange] = useState(prefillExchange);
  const [uid, setUid] = useState(prefillUid);
  const [tradingView, setTradingView] = useState("");
  const [notice, setNotice] = useState(prefilled ? "已带入交易所和 UID，请继续填写 TradingView 用户名" : "");
  const [errors, setErrors] = useState<ReviewErrors>({});
  const exchangeRef = useRef<HTMLSelectElement>(null);
  const uidRef = useRef<HTMLInputElement>(null);
  const tradingViewRef = useRef<HTMLInputElement>(null);
  const HeadingTag = standalone ? "h1" : "h2";

  const reviewText = useMemo(() => [
    "【PM4 指标开通审核】",
    `交易所：${exchange || "—"}`,
    `交易所 UID：${uid || "—"}`,
    `TradingView 用户名：${tradingView || "—"}`,
  ].join("\n"), [exchange, uid, tradingView]);

  const discordUser = `${exchange || "交易所"}_${uid.trim() || "UID"}`;
  const tradingViewHandle = tradingView.trim() ? `@${tradingView.trim().replace(/^@/, "")}` : "@TradingView用户名";

  function clearError(field: ReviewField) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function copyReview() {
    const nextErrors: ReviewErrors = {};
    const normalizedUid = uid.trim();
    const normalizedTradingView = tradingView.trim().replace(/^@/, "");

    if (!reviewExchanges.includes(exchange)) nextErrors.exchange = "请选择合作交易所。";
    if (!normalizedUid) nextErrors.uid = "请输入交易所 UID。";
    else if (!/^\d+$/.test(normalizedUid)) nextErrors.uid = "交易所 UID 只能包含数字。";
    if (!normalizedTradingView) nextErrors.tradingView = "请输入 TradingView 用户名。";
    else if (/\s/.test(normalizedTradingView)) nextErrors.tradingView = "TradingView 用户名不能包含空格。";

    setErrors(nextErrors);
    const firstError = (["exchange", "uid", "tradingView"] as const).find((field) => nextErrors[field]);
    if (firstError) {
      setNotice("请检查标注字段后再复制审核信息");
      const firstErrorRef = {
        exchange: exchangeRef,
        uid: uidRef,
        tradingView: tradingViewRef,
      }[firstError];
      firstErrorRef.current?.focus();
      return;
    }

    try {
      await navigator.clipboard.writeText(reviewText);
      setNotice("审核信息已复制。下一步：先加入 Discord 服务器，再前往审核频道粘贴提交。");
    } catch {
      setNotice("复制失败，请手动复制预览内容");
    }
  }

  return (
    <section id="review" className={standalone ? "review-embed review-standalone" : "review-embed"} aria-labelledby="home-review-title">
      <div className="review-lines" aria-hidden="true" />
      <div className="review-heading">
        <span className="review-kicker"><i /> 资料审核</span>
        <HeadingTag id="home-review-title">提交指标审核资料</HeadingTag>
        <p>完成注册与任务后，提交交易所 UID 和 TradingView 用户名，申请开通 PM4 专属指标。</p>
      </div>

      <div className="review-layout">
        <section className="review-form-card" aria-labelledby="home-review-form-title">
          <div className="review-card-heading">
            <span>完成注册后</span>
            <h3 id="home-review-form-title">提交交易所 UID 与 TradingView 用户名</h3>
            <p>填写并复制审核资料。下一步先加入 Discord 服务器，再前往审核频道粘贴提交。</p>
          </div>

          <form noValidate onSubmit={(event) => { event.preventDefault(); void copyReview(); }}>
            <label>
              <span>交易所选择 <b>*</b></span>
              <select
                ref={exchangeRef}
                value={exchange}
                required
                aria-invalid={Boolean(errors.exchange)}
                aria-describedby={errors.exchange ? "review-exchange-error" : undefined}
                onChange={(event) => { setExchange(event.target.value); clearError("exchange"); }}
              >
                <option value="">请选择交易所</option>
                {reviewExchanges.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
              {errors.exchange && <span id="review-exchange-error" className="review-notice" role="alert">{errors.exchange}</span>}
            </label>
            <label>
              <span>交易所 UID <b>*</b></span>
              <input
                ref={uidRef}
                value={uid}
                required
                aria-invalid={Boolean(errors.uid)}
                aria-describedby={errors.uid ? "review-uid-error" : undefined}
                onChange={(event) => { setUid(event.target.value); clearError("uid"); }}
                inputMode="numeric"
                placeholder="例如：12345678"
              />
              {errors.uid && <span id="review-uid-error" className="review-notice" role="alert">{errors.uid}</span>}
            </label>
            <label>
              <span>TradingView 用户名 <b>*</b></span>
              <input
                ref={tradingViewRef}
                value={tradingView}
                required
                aria-invalid={Boolean(errors.tradingView)}
                aria-describedby={errors.tradingView ? "review-tradingview-error" : undefined}
                onChange={(event) => { setTradingView(event.target.value); clearError("tradingView"); }}
                placeholder="例如：PM4example"
              />
              {errors.tradingView && <span id="review-tradingview-error" className="review-notice" role="alert">{errors.tradingView}</span>}
            </label>
            <div className="review-preview" aria-live="polite">
              <strong>审核信息预览</strong>
              <pre>{reviewText}</pre>
            </div>
            <div className="review-actions">
              <button className="review-primary" type="submit"><span>▣</span> 复制审核信息</button>
              <a className="review-secondary" href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">下一步：加入 Discord 服务器 <span>↗</span></a>
            </div>
            <a className="review-discord-help" href={EXTERNAL_LINKS.discordReview} target="_blank" rel="noopener noreferrer">已加入服务器？前往审核频道粘贴提交 <span>↗</span></a>
            {notice && <p className="review-notice" role="status">{notice}</p>}

            <details className="discord-template" aria-labelledby="discord-template-title">
              <summary className="discord-template-heading">
                <span className="discord-template-icon" aria-hidden="true">DC</span>
                <span>
                  <h3 id="discord-template-title">审核通过通知示例（无需填写）</h3>
                  <p>审核完成后由 PM4 审核组发送</p>
                </span>
              </summary>
              <div className="discord-message-preview">
                <div className="discord-bot-avatar" aria-hidden="true">P4</div>
                <div className="discord-message-body">
                  <div className="discord-bot-name">PM4 权限通知 <b>APP</b></div>
                  <div className="discord-embed-card">
                    <strong>✅ PM4 指标已送达</strong>
                    <dl>
                      <div><dt>用户</dt><dd>{discordUser}</dd></div>
                      <div><dt>TradingView</dt><dd>{tradingViewHandle}</dd></div>
                      <div className="discord-wide"><dt>交易所 / UID</dt><dd>{exchange || "—"} / {uid.trim() || "—"}</dd></div>
                      <div><dt>指标状态</dt><dd>专属指标已开通</dd></div>
                      <div><dt>审核状态</dt><dd>审核已通过</dd></div>
                      <div className="discord-wide"><dt>操作管理员</dt><dd>PM4 审核组</dd></div>
                    </dl>
                  </div>
                </div>
              </div>
            </details>
          </form>
        </section>

        <div className="review-side-column">
          <aside className="review-steps" aria-labelledby="home-review-steps-title">
            <div className="review-steps-title">
              <span>≡</span>
              <h3 id="home-review-steps-title">审核步骤</h3>
            </div>
            <ol>
              <li><b>1</b><span>选择合作交易所并填写 UID</span></li>
              <li><b>2</b><span>填写 TradingView 用户名</span></li>
              <li><b>3</b><span>复制审核信息</span></li>
              <li><b>4</b><span>加入 Discord 后，前往审核频道粘贴提交</span></li>
            </ol>
            <div className="review-warning">
              <b>!</b>
              <p>请勿提交交易所密码、验证码、API 密钥或其他敏感信息。</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
