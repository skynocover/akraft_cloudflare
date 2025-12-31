-- Add activeOrganizationId to session table
ALTER TABLE `session` ADD COLUMN `active_organization_id` text;

--> statement-breakpoint

-- Create organization table
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text,
	`logo` text,
	`metadata` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);

--> statement-breakpoint

CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);

--> statement-breakpoint

CREATE INDEX `organization_slug_idx` ON `organization` (`slug`);

--> statement-breakpoint

-- Create member table
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint

CREATE INDEX `member_userId_idx` ON `member` (`user_id`);

--> statement-breakpoint

CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);

--> statement-breakpoint

-- Create invitation table
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`inviter_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint

CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);

--> statement-breakpoint

CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);
