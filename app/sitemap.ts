import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-30T00:00:00.000Z");
  return [
    { url: "https://cpm4.com/", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://cpm4.com/review", lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://cpm4.com/review/manual", lastModified, changeFrequency: "monthly", priority: 0.4 },
    { url: "https://cpm4.com/transfer/bybit", lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://cpm4.com/transfer/okx", lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://cpm4.com/transfer/gate", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://cpm4.com/transfer/bitget", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://cpm4.com/privacy", lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: "https://cpm4.com/terms", lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
