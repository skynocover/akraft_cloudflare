import { drizzle } from "drizzle-orm/d1";
import { eq, desc, sql } from "drizzle-orm";
import * as schema from "@akraft-cloudflare/db/schema";
import type { Organization, OrganizationMetadata, ThreadWithReplies, Reply } from "../../types/forum";

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
    return imageToken;
  }

  // New R2 format
  if (options?.r2PublicUrl) {
    return `${options.r2PublicUrl}/images/${imageToken}`;
  }

  // Local development: use API endpoint
  return `/api/images/${imageToken}`;
}

// Get organization by ID (replaces getService)
export async function getOrganization(
  db: DbInstance,
  organizationId: string
): Promise<Organization | null> {
  const result = await db
    .select()
    .from(schema.organization)
    .where(eq(schema.organization.id, organizationId))
    .limit(1);

  const row = result[0];
  if (!row) return null;

  const metadata = parseJsonField<OrganizationMetadata>(row.metadata, {});

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || undefined,
    logo: row.logo || undefined,
    metadata,
    createdAt: new Date(row.createdAt),
  };
}

// Alias for backward compatibility
export const getService = getOrganization;

// Get threads with pagination
export async function getThreads(
  db: DbInstance,
  organizationId: string,
  page: number = 1,
  pageSize: number = 10,
  imageUrlOptions?: ImageUrlOptions
): Promise<{ threads: ThreadWithReplies[]; totalPages: number }> {
  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.threads)
    .where(eq(schema.threads.organizationId, organizationId));

  const totalCount = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get threads with pagination (ordered by replyAt desc)
  const offset = (page - 1) * pageSize;
  const threadRows = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.organizationId, organizationId))
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
        isAdmin: reply.isAdmin || false,
        createdAt: new Date(reply.createdAt),
      }));

      return {
        id: thread.id,
        organizationId: thread.organizationId,
        title: thread.title,
        name: thread.name || "Anonymous",
        content: thread.content || "",
        userId: thread.userId || undefined,
        userIp: thread.userIp || undefined,
        imageToken: thread.imageToken || undefined,
        image: getImageUrl(thread.imageToken, imageUrlOptions),
        youtubeID: thread.youtubeId || undefined,
        isAdmin: thread.isAdmin || false,
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
  organizationId: string,
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

  // Verify it belongs to the correct organization
  if (thread.organizationId !== organizationId) return null;

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
    image: getImageUrl(reply.imageToken, imageUrlOptions),
    youtubeID: reply.youtubeId || undefined,
    sage: reply.sage || false,
    isAdmin: reply.isAdmin || false,
    createdAt: new Date(reply.createdAt),
  }));

  return {
    id: thread.id,
    organizationId: thread.organizationId,
    title: thread.title,
    name: thread.name || "Anonymous",
    content: thread.content || "",
    userId: thread.userId || undefined,
    userIp: thread.userIp || undefined,
    imageToken: thread.imageToken || undefined,
    image: getImageUrl(thread.imageToken, imageUrlOptions),
    youtubeID: thread.youtubeId || undefined,
    isAdmin: thread.isAdmin || false,
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
  const today = new Date().toISOString().split('T')[0];
  const data = `${ip}-${today}`;

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 8);
}

// Create a new thread
export async function createThread(
  db: DbInstance,
  data: {
    organizationId: string;
    title: string;
    name?: string;
    content: string;
    imageToken?: string;
    youtubeId?: string;
    userId?: string;
    userIp?: string;
    isAdmin?: boolean;
  }
): Promise<string> {
  const id = generateId();
  const now = new Date();

  await db.insert(schema.threads).values({
    id,
    organizationId: data.organizationId,
    title: data.title,
    name: data.name || "Anonymous",
    content: data.content,
    imageToken: data.imageToken || null,
    youtubeId: data.youtubeId || null,
    userId: data.userId || null,
    userIp: data.userIp || null,
    isAdmin: data.isAdmin || false,
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
    isAdmin?: boolean;
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
    isAdmin: data.isAdmin || false,
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
    organizationId: string;
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
    organizationId: data.organizationId,
    threadId: data.threadId || null,
    replyId: data.replyId || null,
    content: data.content,
    userIp: data.userIp || null,
    reportedIp: data.reportedIp || null,
    createdAt: new Date(),
  });

  return id;
}

// Get thread's organizationId (for validation)
export async function getThreadOrganizationId(
  db: DbInstance,
  threadId: string
): Promise<string | null> {
  const result = await db
    .select({ organizationId: schema.threads.organizationId })
    .from(schema.threads)
    .where(eq(schema.threads.id, threadId))
    .limit(1);

  return result[0]?.organizationId || null;
}

// Alias for backward compatibility
export const getThreadServiceId = getThreadOrganizationId;

// ========== Home Page Queries ==========

// Get all organizations that should be shown on home page
export async function getVisibleOrganizations(
  db: DbInstance
): Promise<Organization[]> {
  const rows = await db
    .select()
    .from(schema.organization)
    .where(eq(schema.organization.showOnHome, true))
    .orderBy(desc(schema.organization.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug || undefined,
    logo: row.logo || undefined,
    showOnHome: row.showOnHome,
    metadata: parseJsonField<OrganizationMetadata>(row.metadata, {}),
    createdAt: new Date(row.createdAt),
  }));
}

// Get latest threads for an organization (for home page preview)
export async function getLatestThreadsForOrganization(
  db: DbInstance,
  organizationId: string,
  limit: number = 5,
  imageUrlOptions?: ImageUrlOptions
): Promise<ThreadWithReplies[]> {
  const threadRows = await db
    .select()
    .from(schema.threads)
    .where(eq(schema.threads.organizationId, organizationId))
    .orderBy(desc(schema.threads.replyAt))
    .limit(limit);

  // Get reply counts for each thread
  const threads: ThreadWithReplies[] = await Promise.all(
    threadRows.map(async (thread) => {
      const replyCountResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.replies)
        .where(eq(schema.replies.threadId, thread.id));

      const replyCount = replyCountResult[0]?.count || 0;

      return {
        id: thread.id,
        organizationId: thread.organizationId,
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
        replies: [], // Empty for preview, just need count
        replyCount,
      };
    })
  );

  return threads;
}

// Get home page data: all visible organizations with their latest threads
export async function getHomePageData(
  db: DbInstance,
  threadsPerOrg: number = 5,
  imageUrlOptions?: ImageUrlOptions
): Promise<{ organization: Organization; threads: ThreadWithReplies[] }[]> {
  const organizations = await getVisibleOrganizations(db);

  const data = await Promise.all(
    organizations.map(async (org) => ({
      organization: org,
      threads: await getLatestThreadsForOrganization(
        db,
        org.id,
        threadsPerOrg,
        imageUrlOptions
      ),
    }))
  );

  return data;
}
