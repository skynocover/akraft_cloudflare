import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { organization } from "./auth";

// Threads table - references organization instead of services
export const threads = sqliteTable(
  "threads",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    name: text("name").default("Anonymous"), // Poster display name
    content: text("content"),
    imageToken: text("image_token"), // Image file reference (R2)
    youtubeId: text("youtube_id"), // YouTube video ID
    userId: text("user_id"), // Short hash for anonymous identification
    userIp: text("user_ip"), // IP address (for moderation)
    replyAt: integer("reply_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("threads_organizationId_idx").on(table.organizationId),
    index("threads_replyAt_idx").on(table.replyAt),
  ]
);

// Replies table
export const replies = sqliteTable(
  "replies",
  {
    id: text("id").primaryKey(),
    threadId: text("thread_id")
      .notNull()
      .references(() => threads.id, { onDelete: "cascade" }),
    name: text("name").default("Anonymous"), // Poster display name
    content: text("content"),
    imageToken: text("image_token"), // Image file reference (R2)
    youtubeId: text("youtube_id"), // YouTube video ID
    sage: integer("sage", { mode: "boolean" }).default(false), // Don't bump thread
    userId: text("user_id"), // Short hash for anonymous identification
    userIp: text("user_ip"), // IP address (for moderation)
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("replies_threadId_idx").on(table.threadId),
    index("replies_createdAt_idx").on(table.createdAt),
  ]
);

// Reports table (for content moderation)
export const reports = sqliteTable(
  "reports",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    threadId: text("thread_id").references(() => threads.id, {
      onDelete: "set null",
    }),
    replyId: text("reply_id").references(() => replies.id, {
      onDelete: "set null",
    }),
    content: text("content").notNull(), // Report reason
    userIp: text("user_ip"), // Reporter's IP
    reportedIp: text("reported_ip"), // Reported content's IP
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("reports_organizationId_idx").on(table.organizationId),
    index("reports_threadId_idx").on(table.threadId),
    index("reports_replyId_idx").on(table.replyId),
  ]
);

// Relations
export const threadsRelations = relations(threads, ({ one, many }) => ({
  organization: one(organization, {
    fields: [threads.organizationId],
    references: [organization.id],
  }),
  replies: many(replies),
  reports: many(reports),
}));

export const repliesRelations = relations(replies, ({ one, many }) => ({
  thread: one(threads, {
    fields: [replies.threadId],
    references: [threads.id],
  }),
  reports: many(reports),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  organization: one(organization, {
    fields: [reports.organizationId],
    references: [organization.id],
  }),
  thread: one(threads, {
    fields: [reports.threadId],
    references: [threads.id],
  }),
  reply: one(replies, {
    fields: [reports.replyId],
    references: [replies.id],
  }),
}));
