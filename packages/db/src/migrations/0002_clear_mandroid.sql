ALTER TABLE `replies` ADD `is_admin` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `threads` ADD `is_admin` integer DEFAULT false;