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
    { label: "提交审核", href: "#submit" },
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
  rebateTiming: string;
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
    name: "Bybit",
    logo: "https://www.bybit.com/favicon.ico",
    rebate: "33%",
    makerFee: "0.02%",
    takerFee: "0.055%",
    rebateTiming: "每日 13:00 前",
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
    rebateTiming: "次日 16:30 起",
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
    rebateTiming: "次日 03:00",
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
