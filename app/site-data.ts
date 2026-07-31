export const siteConfig = {
  brand: "PM4",
  discordReviewUrl: "",
  discordServerName: "PM4 Discord",
  copyTemplateTitle: "【PM4 指标开通审核】",
  copySuccessMessage: "审核信息已复制，请前往 Discord 粘贴提交。",
  nav: [
    { label: "首页", href: "#home" },
    { label: "支持交易所", href: "#exchanges" },
    { label: "开通流程", href: "#process" },
    { label: "提交审核", href: "#submit" },
    { label: "常见问题", href: "#faq" },
  ],
  contacts: {
    discord: null,
    telegram: null,
    email: null,
    onlineService: null,
  },
} as const;

export const heroStats = [
  { value: "手续费优惠", label: "按交易所规则执行", tone: "default" },
  { value: "PM4 指标", label: "TradingView 专属工具", tone: "default" },
  { value: "UID + TV", label: "双重资料审核", tone: "default" },
  { value: "每 7 天", label: "权限审核周期", tone: "default" },
] as const;

export type Exchange = {
  name: string;
  logo: string;
  rebate: string;
  description: string;
  newUserStatus: string;
  existingUserStatus: string;
  indicatorStatus: string;
  registerUrl: string | null;
  transferUrl: string | null;
  status: "open" | "pending";
  featured: boolean;
};

export const exchanges: Exchange[] = [
  {
    name: "WEEX",
    logo: "/exchanges/weex.svg",
    rebate: "30%",
    description: "专属注册与资料审核通道",
    newUserStatus: "支持",
    existingUserStatus: "需确认",
    indicatorStatus: "完成审核",
    registerUrl: "https://www.weex.com/register",
    transferUrl: "#submit",
    status: "open",
    featured: true,
  },
  {
    name: "Bybit",
    logo: "/exchanges/bybit.svg",
    rebate: "33%",
    description: "支持新用户注册，老用户可申请确认",
    newUserStatus: "支持",
    existingUserStatus: "可申请",
    indicatorStatus: "按活动规则审核",
    registerUrl: "https://www.bybit.com/register",
    transferUrl: "#submit",
    status: "open",
    featured: false,
  },
  {
    name: "Bitget",
    logo: "/exchanges/bitget.svg",
    rebate: "30%",
    description: "专属注册与资料审核通道",
    newUserStatus: "支持",
    existingUserStatus: "需确认",
    indicatorStatus: "UID 审核",
    registerUrl: "https://www.bitget.com/register",
    transferUrl: "#submit",
    status: "open",
    featured: false,
  },
  {
    name: "BingX",
    logo: "/exchanges/bingx.svg",
    rebate: "30%",
    description: "合作规则更新中",
    newUserStatus: "暂未开放",
    existingUserStatus: "需确认",
    indicatorStatus: "规则更新中",
    registerUrl: null,
    transferUrl: "#submit",
    status: "pending",
    featured: false,
  },
];

export const processSteps = [
  {
    step: "01",
    title: "选择交易所",
    description:
      "通过 PM4 专属邀请链接注册合作交易所，或确认现有账户是否支持绑定。",
  },
  {
    step: "02",
    title: "提交审核资料",
    description:
      "提交交易所 UID、TradingView 用户名及当前活动要求的审核信息。",
  },
  {
    step: "03",
    title: "审核并开通指标",
    description:
      "资料审核通过后，为你的 TradingView 账户添加 PM4 专属指标权限。",
  },
] as const;

export const accessRules = [
  "通过 PM4 专属链接注册合作交易所",
  "提交交易所 UID 和 TradingView 用户名",
  "新注册用户可按当前活动规则获得 7 天体验权限",
  "系统每 7 天审核最近 7 天交易量，达到要求后续期 7 天",
  "未达到要求时权限暂停，后续重新达标即可恢复",
] as const;

export const whyPm4 = [
  "长期公开直播与交易复盘",
  "指标围绕实际交易场景设计",
  "注册、审核与权限规则透明",
  "提供清晰的中文使用说明",
  "不单独出售指标",
  "是否使用合作交易所由用户自行决定",
] as const;

export const faqs = [
  {
    question: "指标需要单独购买吗？",
    answer:
      "不需要。通过对应合作流程并满足当前活动审核条件后，可免费开通指标权限。",
  },
  {
    question: "老交易所账户可以参加吗？",
    answer:
      "不同交易所规则不同。请查看对应交易所卡片中的“老用户绑定”状态，或提交资料前联系客服确认。",
  },
  {
    question: "提交 UID 后多久可以开通？",
    answer:
      "审核时间取决于注册关系与资料完整度。审核结果会通过你填写的联系方式通知。",
  },
  {
    question: "TradingView 需要付费版吗？",
    answer:
      "指标权限与 TradingView 套餐是两套独立机制，具体使用限制以 TradingView 当前规则为准。",
  },
  {
    question: "为什么需要定期审核交易量？",
    answer:
      "指标权限与合作交易所当前活动条件相关，因此需要按周期确认是否持续满足对应规则。",
  },
  {
    question: "没达到交易量后，指标会立即失效吗？",
    answer:
      "不会因单次波动立即处理。系统按页面说明的周期审核，未达要求时权限会暂停。",
  },
  {
    question: "后续达到要求可以恢复吗？",
    answer:
      "可以。后续重新达到对应交易所的当前审核要求后，可申请恢复权限。",
  },
  {
    question: "指标是否保证盈利？",
    answer:
      "不保证。指标只用于辅助分析，任何交易都存在亏损风险，用户需要独立作出交易决定。",
  },
  {
    question: "如何联系人工客服？",
    answer:
      "可通过页面右下角客服入口查看已配置的联系方式。未配置的渠道不会显示。",
  },
  {
    question: "我的 UID 和个人资料是否安全？",
    answer:
      "资料仅用于验证注册关系与指标开通审核。正式提交前请阅读隐私说明，并确认页面已连接安全的提交服务。",
  },
] as const;
