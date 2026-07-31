export const siteConfig = {
  brand: "PM4",
  discordReviewUrl: "https://discord.com/channels/942442247209779230/1296106331543175219",
  discordCommunityUrl: "https://discord.gg/D5CPTzQafD",
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
    discord: "https://discord.gg/D5CPTzQafD",
    telegram: "https://t.me/as36701",
    email: null,
  },
} as const;

export const heroStats = [
  { value: "手续费优惠", label: "按交易所规则执行", tone: "default" },
  { value: "PM4 指标", label: "TradingView 专属工具", tone: "default" },
  { value: "UID + TV", label: "双重资料审核", tone: "default" },
  { value: "每 7 天审核", label: "达标后自动续期", tone: "default" },
] as const;

export type Exchange = {
  name: string;
  logo: string;
  rebate: string;
  makerFee: string;
  takerFee: string;
  code: string;
  desktopOrder: number;
  desktopFeatured: boolean;
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
    logo: "https://www.weex.com/trade_static/favicon.ico",
    rebate: "30%",
    makerFee: "0.02%",
    takerFee: "0.08%",
    code: "PM4WEEX",
    desktopOrder: 4,
    desktopFeatured: false,
    description: "专属注册与资料审核通道",
    newUserStatus: "支持",
    existingUserStatus: "需确认",
    indicatorStatus: "完成审核",
    registerUrl: "https://www.weex.com/register",
    transferUrl: "#support",
    status: "open",
    featured: true,
  },
  {
    name: "Bybit",
    logo: "https://www.bybit.com/favicon.ico",
    rebate: "33%",
    makerFee: "0.02%",
    takerFee: "0.055%",
    code: "PM4BYBIT",
    desktopOrder: 1,
    desktopFeatured: true,
    description: "支持新用户注册，老用户可申请确认",
    newUserStatus: "支持",
    existingUserStatus: "可申请",
    indicatorStatus: "按活动规则审核",
    registerUrl: "https://partner.bybit.com/b/PPMM44",
    transferUrl: "https://www.bybit.com/zh-TW/help-center/article/How-to-Transfer-Your-Identity-to-Another-Account",
    status: "open",
    featured: false,
  },
  {
    name: "Bitget",
    logo: "https://www.bitget.com/baseasset/favicon4.png",
    rebate: "30%",
    makerFee: "0.02%",
    takerFee: "0.06%",
    code: "PM4BITGET",
    desktopOrder: 2,
    desktopFeatured: false,
    description: "专属注册与资料审核通道",
    newUserStatus: "支持",
    existingUserStatus: "需确认",
    indicatorStatus: "UID 审核",
    registerUrl: "https://partner.bitget.com/bg/r1ky845p",
    transferUrl: "#support",
    status: "open",
    featured: false,
  },
  {
    name: "BingX",
    logo: "https://bingx.com/favicon.ico",
    rebate: "30%",
    makerFee: "0.02%",
    takerFee: "0.05%",
    code: "PM4BINGX",
    desktopOrder: 3,
    desktopFeatured: false,
    description: "合作规则更新中",
    newUserStatus: "暂未开放",
    existingUserStatus: "需确认",
    indicatorStatus: "规则更新中",
    registerUrl: "https://iciclebridge.com/zh-tc/invite/GHO8MG87",
    transferUrl: "#support",
    status: "pending",
    featured: false,
  },
];

export const processSteps = [
  {
    step: "01",
    title: "选择交易所",
    description:
      "通过 PM4 专属邀请链接注册合作交易所，或确认现有账户是否支持身份转移。",
  },
  {
    step: "02",
    title: "完成 KYC 与入金",
    description:
      "完成交易所身份认证，并按照当前活动规则完成首次入金。",
  },
  {
    step: "03",
    title: "提交审核资料",
    description:
      "提交交易所 UID、TradingView 用户名及当前活动要求的审核信息。",
  },
  {
    step: "04",
    title: "审核并开通指标",
    description:
      "确认注册关系、KYC、入金和活动资格后，为 TradingView 账户添加 PM4 专属指标权限。",
  },
] as const;

export const accessRules = [
  "通过 PM4 专属链接注册合作交易所",
  "提交交易所 UID 和 TradingView 用户名",
  "新注册用户可按当前活动规则获得 7 天体验权限",
  "系统每 7 天审核最近 7 天交易量，达到要求后续期 7 天",
  "未达到要求时权限暂停，后续重新达标即可恢复",
] as const;

export const desktopAccessRules = [
  "新用户可按当前活动规则获得体验权限",
  "每 7 天审核最近 7 天交易量",
  "达到当前活动要求后续期 7 天",
  "未达到要求时指标权限暂停",
  "后续重新达到要求后恢复指标权限",
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
    question: "提交资料后多久可以开通？",
    answer:
      "审核时间取决于注册关系、KYC、入金与资料完整度。资料完整并满足当前活动要求后，将尽快完成开通。",
  },
  {
    question: "TradingView需要付费版吗？",
    answer:
      "指标权限与 TradingView 套餐是两套独立机制，具体使用限制以 TradingView 当前规则为准。",
  },
  {
    question: "没达到审核要求后怎么办？",
    answer:
      "系统按页面说明的周期审核，未达到当前活动要求时指标权限会暂停；后续重新达到对应交易所的审核要求后，可申请恢复权限。",
  },
  {
    question: "指标是否保证盈利？",
    answer:
      "不保证。指标只用于辅助分析，任何交易都存在亏损风险，用户需要独立作出交易决定。",
  },
] as const;

export const desktopFaqs = faqs;
