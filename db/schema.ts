import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const frontApplications = sqliteTable("front_applications", {
  id: text("id").primaryKey().notNull(),
  exchange: text("exchange").notNull(),
  uid: text("uid").notNull(),
  tradingViewUsername: text("tradingview_username").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: text("submitted_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const frontDailyMetrics = sqliteTable("front_daily_metrics", {
  day: text("day").notNull(),
  eventType: text("event_type").notNull(),
  exchange: text("exchange").notNull().default(""),
  eventCount: integer("event_count").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.day, table.eventType, table.exchange] })]);
