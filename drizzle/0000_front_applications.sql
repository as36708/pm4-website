CREATE TABLE `front_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`exchange` text NOT NULL,
	`uid` text NOT NULL,
	`tradingview_username` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`submitted_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `front_daily_metrics` (
	`day` text NOT NULL,
	`event_type` text NOT NULL,
	`exchange` text DEFAULT '' NOT NULL,
	`event_count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `event_type`, `exchange`)
);
--> statement-breakpoint
CREATE INDEX `front_applications_updated_idx` ON `front_applications` (`updated_at`);
