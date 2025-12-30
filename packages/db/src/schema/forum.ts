import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

// Services table (forums/boards)
export const services = sqliteTable(
  "services",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    ownerId: text("owner_id").references(() => user.id, { onDelete: "set null" }),
    // JSON fields stored as text
    auth: text("auth"), // JSON: {reply, report, thread, visible} permissions
    topLinks: text("top_links"), // JSON array of {url, name}
    headLinks: text("head_links"), // JSON array of {url, name}
    forbidContents: text("forbid_contents"), // JSON array of forbidden words
    blockedIPs: text("blocked_ips"), // JSON array of blocked IPs
    visible: integer("visible", { mode: "boolean" }).default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("services_ownerId_idx").on(table.ownerId)]
);

// Threads table
export const threads = sqliteTable(
  "threads",
  {
    id: text("id").primaryKey(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
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
    index("threads_serviceId_idx").on(table.serviceId),
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
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
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
    index("reports_serviceId_idx").on(table.serviceId),
    index("reports_threadId_idx").on(table.threadId),
    index("reports_replyId_idx").on(table.replyId),
  ]
);

// Relations
export const servicesRelations = relations(services, ({ one, many }) => ({
  owner: one(user, {
    fields: [services.ownerId],
    references: [user.id],
  }),
  threads: many(threads),
  reports: many(reports),
}));

export const threadsRelations = relations(threads, ({ one, many }) => ({
  service: one(services, {
    fields: [threads.serviceId],
    references: [services.id],
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
  service: one(services, {
    fields: [reports.serviceId],
    references: [services.id],
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
