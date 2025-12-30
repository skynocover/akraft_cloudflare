import { drizzle } from "drizzle-orm/d1";
import { eq, desc, sql } from "drizzle-orm";
import * as schema from "@akraft-cloudflare/db/schema";
import type { Service, ThreadWithReplies, Reply } from "../../types/forum";

// Create db instance from D1 binding
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// Type for the db instance
type DbInstance = ReturnType<typeof createDb>;

// Parse JSON fields safely
function parseJsonField<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

// Check if imageToken is new R2 format (starts with img_)
function isR2ImageToken(imageToken: string): boolean {
  return imageToken.startsWith('img_');
}

// Image URL options
interface ImageUrlOptions {
  r2PublicUrl?: string;
  cloudflareImagesUrl?: string;
}

// Convert imageToken to full image URL
// - Old format (Cloudflare Images): uses cloudflareImagesUrl
// - New format (R2): uses r2PublicUrl if set, otherwise /api/images/:token
function getImageUrl(
  imageToken: string | null | undefined,
  options?: ImageUrlOptions
): string | undefined {
  if (!imageToken) return undefined;

  // Old Cloudflare Images format
  if (!isR2ImageToken(imageToken)) {
    if (options?.cloudflareImagesUrl) {
      return `${options.cloudflareImagesUrl}/${imageToken}/public`;
    }
    // Fallback: return token as-is (shouldn't happen in production)
    return imageToken;
  }

  // New R2 format
  if (options?.r2PublicUrl) {
    // Production: use R2 public URL
    return `${options.r2PublicUrl}/images/${imageToken}`;
  }

  // Local development: use API endpoint
  return `/api/images/${imageToken}`;
}

// Get service by ID
export async function getService(
  db: DbInstance,
  serviceId: string
): Promise<Service | null> {
  const result = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, serviceId))
    .limit(1);

  const row = result[0];
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    ownerId: row.ownerId || "",
    topLinks: parseJsonField(row.topLinks, []),
    headLinks: parseJsonField(row.headLinks, []),
    forbidContents: parseJsonField(row.forbidContents, []),
    blockedIPs: parseJsonField(row.blockedIPs, []),
  };
}

// Get threads with pagination
export async function getThreads(
  db: DbInstance,
  serviceId: string,
  page: number = 1,
  pageSize: number = 10,
  imageUrlOptions?: ImageUrlOptions
): Promise<{ threads: ThreadWithReplies[]; totalPages: number }> {
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.threads)
    .where(eq(schema.threads.serviceId, serviceId));

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get threads with pagination (ordered by replyAt desc)
  const offset = (page - 1) * pageSize;
  const threadRows = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.serviceId, serviceId))
    .orderBy(desc(schema.threads.replyAt))
    .limit(pageSize)
    .offset(offset);

  // Get replies for each thread
  const threads: ThreadWithReplies[] = await Promise.all(
    threadRows.map(async (thread) => {
      const replyRows = await db
        .select()
        .from(schema.replies)
        .where(eq(schema.replies.threadId, thread.id))
        .orderBy(schema.replies.createdAt);

      const replies: Reply[] = replyRows.map((reply) => ({
        id: reply.id,
        threadId: reply.threadId,
        name: reply.name || "Anonymous",
        content: reply.content || "",
        userId: reply.userId || undefined,
        userIp: reply.userIp || undefined,
        imageToken: reply.imageToken || undefined,
        image: getImageUrl(reply.imageToken, imageUrlOptions),
        youtubeID: reply.youtubeId || undefined,
        sage: reply.sage || false,
        createdAt: new Date(reply.createdAt),
      }));

      return {
        id: thread.id,
        serviceId: thread.serviceId,
        title: thread.title,
        name: thread.name || "Anonymous",
        content: thread.content || "",
        userId: thread.userId || undefined,
        userIp: thread.userIp || undefined,
        imageToken: thread.imageToken || undefined,
        image: getImageUrl(thread.imageToken, imageUrlOptions),
        youtubeID: thread.youtubeId || undefined,
        replyAt: new Date(thread.replyAt),
        createdAt: new Date(thread.createdAt),
        replies,
      };
    })
  );

  return { threads, totalPages };
}

// Get single thread with all replies
export async function getThread(
  db: DbInstance,
  serviceId: string,
  threadId: string,
  imageUrlOptions?: ImageUrlOptions
): Promise<ThreadWithReplies | null> {
  const threadRows = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.id, threadId))
    .limit(1);

  const thread = threadRows[0];
  if (!thread) return null;

  // Verify it belongs to the correct service
  if (thread.serviceId !== serviceId) return null;

  // Get all replies
  const replyRows = await db
    .select()
    .from(schema.replies)
    .where(eq(schema.replies.threadId, threadId))
    .orderBy(schema.replies.createdAt);

  const replies: Reply[] = replyRows.map((reply) => ({
    id: reply.id,
    threadId: reply.threadId,
    name: reply.name || "Anonymous",
    content: reply.content || "",
    userId: reply.userId || undefined,
    userIp: reply.userIp || undefined,
    imageToken: reply.imageToken || undefined,
    image: getImageUrl(reply.imageToken, r2PublicUrl),
    youtubeID: reply.youtubeId || undefined,
    sage: reply.sage || false,
    createdAt: new Date(reply.createdAt),
  }));

  return {
    id: thread.id,
    serviceId: thread.serviceId,
    title: thread.title,
    name: thread.name || "Anonymous",
    content: thread.content || "",
    userId: thread.userId || undefined,
    userIp: thread.userIp || undefined,
    imageToken: thread.imageToken || undefined,
    image: getImageUrl(thread.imageToken, r2PublicUrl),
    youtubeID: thread.youtubeId || undefined,
    replyAt: new Date(thread.replyAt),
    createdAt: new Date(thread.createdAt),
    replies,
  };
}

// Generate unique ID
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}${random}`;
}

// Generate consistent user ID from IP + date (same IP on same day = same ID)
export async function generateUserIdFromIp(ip: string): Promise<string> {
  // Get today's date in YYYY-MM-DD format (UTC)
  const today = new Date().toISOString().split('T')[0];
  const data = `${ip}-${today}`;

  // Hash using Web Crypto API (available in Cloudflare Workers)
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

  // Convert to hex and take first 8 characters
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 8);
}

// Create a new thread
export async function createThread(
  db: DbInstance,
  data: {
    serviceId: string;
    title: string;
    name?: string;
    content: string;
    imageToken?: string;
    youtubeId?: string;
    userId?: string;
    userIp?: string;
  }
): Promise<string> {
  const id = generateId();
  const now = new Date();

  await db.insert(schema.threads).values({
    id,
    serviceId: data.serviceId,
    title: data.title,
    name: data.name || "Anonymous",
    content: data.content,
    imageToken: data.imageToken || null,
    youtubeId: data.youtubeId || null,
    userId: data.userId || null,
    userIp: data.userIp || null,
    replyAt: now,
    createdAt: now,
  });

  return id;
}

// Create a new reply
export async function createReply(
  db: DbInstance,
  data: {
    threadId: string;
    name?: string;
    content: string;
    imageToken?: string;
    youtubeId?: string;
    sage?: boolean;
    userId?: string;
    userIp?: string;
  }
): Promise<string> {
  const id = generateId();
  const now = new Date();

  await db.insert(schema.replies).values({
    id,
    threadId: data.threadId,
    name: data.name || "Anonymous",
    content: data.content,
    imageToken: data.imageToken || null,
    youtubeId: data.youtubeId || null,
    sage: data.sage || false,
    userId: data.userId || null,
    userIp: data.userIp || null,
    createdAt: now,
  });

  // Update thread's replyAt if not sage
  if (!data.sage) {
    await db
      .update(schema.threads)
      .set({ replyAt: now })
      .where(eq(schema.threads.id, data.threadId));
  }

  return id;
}

// Create a new report
export async function createReport(
  db: DbInstance,
  data: {
    serviceId: string;
    threadId?: string;
    replyId?: string;
    content: string;
    userIp?: string;
    reportedIp?: string;
  }
): Promise<string> {
  const id = generateId();

  await db.insert(schema.reports).values({
    id,
    serviceId: data.serviceId,
    threadId: data.threadId || null,
    replyId: data.replyId || null,
    content: data.content,
    userIp: data.userIp || null,
    reportedIp: data.reportedIp || null,
    createdAt: new Date(),
  });

  return id;
}

// Get thread's serviceId (for validation)
export async function getThreadServiceId(
  db: DbInstance,
  threadId: string
): Promise<string | null> {
  const result = await db
    .select({ serviceId: schema.threads.serviceId })
    .from(schema.threads)
    .where(eq(schema.threads.id, threadId))
    .limit(1);

  return result[0]?.serviceId || null;
}
