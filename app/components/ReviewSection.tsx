"use client";

import { useMemo, useRef, useState } from "react";
import { EXTERNAL_LINKS } from "../links";

const reviewExchanges = ["Bybit", "Bitget", "BingX", "Gate"];

type ReviewField = "exchange" | "uid" | "tradingView" | "discord" | "privacy";
type ReviewErrors = Partial<Record<ReviewField, string>>;

type ReviewSectionProps = {
  prefillExchange?: string;
  prefillUid?: string;
  prefilled?: boolean;
  standalone?: boolean;
};

type SubmissionResponse = {
  submitted?: boolean;
  duplicate?: boolean;
  error?: string;
};

export default function ReviewSection({ prefillExchange = "", prefillUid = "", prefilled = false, standalone = false }: ReviewSectionProps) {
  const [exchange, setExchange] = useState(prefillExchange);
  const [uid, setUid] = useState(prefillUid);
  const [tradingView, setTradingView] = useState("");
  const [discordUser, setDiscordUser] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [website, setWebsite] = useState("");
  const [notice, setNotice] = useState(prefilled ? "已带入交易所和 UID，请继续填写 TradingView 用户名" : "");
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const exchangeRef = useRef<HTMLSelectElement>(null);
  const uidRef = useRef<HTMLInputElement>(null);
  const tradingViewRef = useRef<HTMLInputElement>(null);
  const discordRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const HeadingTag = standalone ? "h1" : "h2";

  const reviewText = useMemo(() => {
    const lines = [
      "【PM4 指标开通审核】",
      `交易所：${exchange || "—"}`,
      `交易所 UID：${uid || "—"}`,
      `TradingView 用户名：${tradingView || "—"}`,
      `Discord 用户名：${discordUser.trim() || "—"}`,
    ];
    return lines.join("\n");
  }, [discordUser, exchange, uid, tradingView]);

  const discordDisplayUser = discordUser.trim() || `${exchange || "交易所"}_${uid.trim() || "UID"}`;
  const tradingViewHandle = tradingView.trim() ? `@${tradingView.trim().replace(/^@/, "")}` : "@TradingView用户名";

  function clearError(field: ReviewField) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function copyReviewToClipboard() {
    try {
      await navigator.clipboard.writeText(reviewText);
      return true;
    } catch {
      return false;
    }
  }

  async function submitReview() {
    if (submitting) return;

    const nextErrors: ReviewErrors = {};
    const normalizedUid = uid.trim();
    const normalizedTradingView = tradingView.trim().replace(/^@/, "");
    const normalizedDiscord = discordUser.trim();

    if (!reviewExchanges.includes(exchange)) nextErrors.exchange = "请选择合作交易所。";
    if (!normalizedUid) nextErrors.uid = "请输入交易所 UID。";
    else if (!/^\d{4,32}$/.test(normalizedUid)) nextErrors.uid = "交易所 UID 需要填写 4–32 位数字。";
    if (!normalizedTradingView) nextErrors.tradingView = "请输入 TradingView 用户名。";
    else if (!/^[A-Za-z0-9_.-]{2,64}$/.test(normalizedTradingView)) {
      nextErrors.tradingView = "TradingView 用户名只能包含字母、数字、点、横线或下划线。";
    }
    if (!normalizedDiscord) nextErrors.discord = "请输入 Discord 用户名。";
    if (!acceptedPrivacy) nextErrors.privacy = "请先阅读并同意隐私政策与服务条款。";

    setErrors(nextErrors);
    const firstError = (["exchange", "uid", "tradingView", "discord", "privacy"] as const).find((field) => nextErrors[field]);
    if (firstError) {
      setNotice("请检查标注字段后再提交审核资料。");
      const firstErrorRef = {
        exchange: exchangeRef,
        uid: uidRef,
        tradingView: tradingViewRef,
        discord: discordRef,
        privacy: privacyRef,
      }[firstError];
      firstErrorRef.current?.focus();
      return;
    }

    setSubmitting(true);
    setNotice("正在保存资料并同步到 PM4 管理后台…");
    const copied = await copyReviewToClipboard();

    try {
      const response = await fetch("/api/indicator-applications", {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          exchange,
          uid: normalizedUid,
          tradingViewUser: normalizedTradingView,
          discordUser: normalizedDiscord,
          acceptedPrivacy,
          website,
        }),
      });
      const payload = await response.json().catch(() => null) as SubmissionResponse | null;

      if (!response.ok || !payload?.submitted) {
        const fallback = response.status === 409
          ? "该 UID 已有不同资料，请到 Discord 审核频道联系管理员核对。"
          : "资料暂时未进入后台，请稍后重试。";
        setNotice(`${payload?.error || fallback}${copied ? " 审核信息已复制，可先到 Discord 粘贴提交。" : " 请手动复制预览内容并到 Discord 提交。"}`);
        return;
      }

      const savedMessage = payload.duplicate
        ? "这份资料已在 PM4 管理后台，无需重复提交。"
        : "资料已保存并进入 PM4 管理后台。";
      setNotice(`${savedMessage}${copied ? " 审核信息也已复制，正在前往 Discord UID 审核频道。" : " 正在前往 Discord UID 审核频道，请手动复制预览内容。"}`);
      window.location.assign(EXTERNAL_LINKS.discordReview);
    } catch {
      setNotice(`网络暂时不可用，资料尚未进入后台。${copied ? " 审核信息已复制，可先到 Discord 粘贴提交。" : " 请手动复制预览内容并到 Discord 提交。"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="review" className={standalone ? "review-embed review-standalone" : "review-embed"} aria-labelledby="home-review-title">
      <div className="review-lines" aria-hidden="true" />
      <div className="review-heading">
        <span className="review-kicker"><i /> 资料审核</span>
        <HeadingTag id="home-review-title">提交指标审核资料</HeadingTag>
        <p>完成注册与任务后，提交交易所 UID 和 TradingView 用户名，资料会自动进入 PM4 管理后台。</p>
      </div>

      <div className="review-layout">
        <section className="review-form-card" aria-labelledby="home-review-form-title">
          <div className="review-card-heading">
            <span>完成注册后</span>
            <h3 id="home-review-form-title">提交交易所 UID 与 TradingView 用户名</h3>
            <p>提交后会安全保存到 PM4 管理后台；Discord 审核频道继续保留为通知与人工核对流程。</p>
          </div>

          <form noValidate aria-busy={submitting} onSubmit={(event) => { event.preventDefault(); void submitReview(); }}>
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
            <label>
              <span>Discord 用户名 <b>*</b></span>
              <input
                ref={discordRef}
                value={discordUser}
                required
                aria-invalid={Boolean(errors.discord)}
                aria-describedby={errors.discord ? "review-discord-error" : undefined}
                onChange={(event) => { setDiscordUser(event.target.value); clearError("discord"); }}
                maxLength={64}
                autoComplete="off"
                placeholder="例如：pm4user"
              />
              {errors.discord && <span id="review-discord-error" className="review-notice" role="alert">{errors.discord}</span>}
            </label>
            <label className="review-honeypot" aria-hidden="true">
              <span>网站</span>
              <input value={website} onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} autoComplete="off" />
            </label>
            <label className="review-consent">
              <input
                ref={privacyRef}
                type="checkbox"
                checked={acceptedPrivacy}
                aria-invalid={Boolean(errors.privacy)}
                aria-describedby={errors.privacy ? "review-privacy-error" : undefined}
                onChange={(event) => { setAcceptedPrivacy(event.target.checked); clearError("privacy"); }}
              />
              <span>我已阅读并同意 <a href="/privacy" target="_blank">隐私政策</a> 与 <a href="/terms" target="_blank">服务条款</a>，并同意将以上资料用于返佣资格与指标权限审核。<b>*</b></span>
            </label>
            {errors.privacy && <span id="review-privacy-error" className="review-notice" role="alert">{errors.privacy}</span>}
            <div className="review-preview" aria-live="polite">
              <strong>审核信息预览</strong>
              <pre>{reviewText}</pre>
            </div>
            <div className="review-actions">
              <button className="review-copy" type="button" onClick={() => { void copyReviewToClipboard().then((copied) => setNotice(copied ? "审核信息已复制，可以粘贴到 Discord 审核频道。" : "浏览器无法自动复制，请长按或选中预览内容复制。")); }}>
                <span aria-hidden="true">▣</span> 复制审核信息
              </button>
              <button className="review-primary" type="submit" disabled={submitting}>
                <span>▣</span> {submitting ? "正在提交并同步…" : "提交审核资料并前往 UID 审核"} <span aria-hidden="true">↗</span>
              </button>
            </div>
            <a className="review-discord-help" href={EXTERNAL_LINKS.discordInvite} target="_blank" rel="noopener noreferrer">首次使用 Discord？先加入服务器 <span>↗</span></a>
            {notice && <p className="review-notice" role="status">{notice}</p>}
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
              <li><b>2</b><span>填写 TradingView 与 Discord 用户名</span></li>
              <li><b>3</b><span>提交资料并自动进入后台</span></li>
              <li><b>4</b><span>到 Discord 审核频道确认并等待开通</span></li>
            </ol>
            <div className="review-warning">
              <b>!</b>
              <p>请勿提交交易所密码、验证码、API 密钥或其他敏感信息。</p>
            </div>
          </aside>

          <section className="discord-template" aria-labelledby="discord-template-title">
            <div className="discord-template-heading">
              <span className="discord-template-icon" aria-hidden="true">DC</span>
              <span>
                <h3 id="discord-template-title">审核通过通知示例（无需填写）</h3>
                <p>审核完成后由 PM4 审核组发送</p>
              </span>
            </div>
            <div className="discord-message-preview">
              <div className="discord-bot-avatar" aria-hidden="true">P4</div>
              <div className="discord-message-body">
                <div className="discord-bot-name">PM4 权限通知 <b>APP</b></div>
                <div className="discord-embed-card">
                  <strong>✅ PM4 指标已送达</strong>
                  <dl>
                    <div><dt>用户</dt><dd>{discordDisplayUser}</dd></div>
                    <div><dt>TradingView</dt><dd>{tradingViewHandle}</dd></div>
                    <div className="discord-wide"><dt>交易所 / UID</dt><dd>{exchange || "—"} / {uid.trim() || "—"}</dd></div>
                    <div><dt>指标状态</dt><dd>专属指标已开通</dd></div>
                    <div><dt>审核状态</dt><dd>审核已通过</dd></div>
                    <div className="discord-wide"><dt>操作管理员</dt><dd>PM4 审核组</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
