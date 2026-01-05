-- Migration: Add show_on_home column to organization table
ALTER TABLE `organization` ADD `show_on_home` integer DEFAULT false NOT NULL;
