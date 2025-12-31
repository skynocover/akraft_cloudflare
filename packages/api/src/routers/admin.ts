import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { protectedProcedure } from "../index";
import { createDb } from "@akraft-cloudflare/db";
import * as schema from "@akraft-cloudflare/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { env } from "cloudflare:workers";

// Zod schemas for validation
const linkItemSchema = z.object({
  name: z.string(),
  url: z.string(),
});

const serviceUpdateSchema = z.object({
  serviceId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  topLinks: z.array(linkItemSchema).optional(),
  headLinks: z.array(linkItemSchema).optional(),
  forbidContents: z.array(z.string()).optional(),
  blockedIPs: z.array(z.string()).optional(),
  auth: z.record(z.string(), z.string()).optional(),
});

// Helper to check if user is service owner
async function checkServiceOwner(userId: string, serviceId: string) {
  const db = createDb(env.DB);
  const result = await db
    .select({ ownerId: schema.services.ownerId })
    .from(schema.services)
    .where(eq(schema.services.id, serviceId))
    .limit(1);

  const service = result[0];
  if (!service) {
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });
  }

  if (service.ownerId !== userId) {
    throw new ORPCError("FORBIDDEN", {
      message: "You are not the owner of this service",
    });
  }

  return true;
}

// Get service details
export const getService = protectedProcedure
  .input(z.object({ serviceId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    const result = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, input.serviceId))
      .limit(1);

    const service = result[0];
    if (!service) {
      throw new ORPCError("NOT_FOUND", { message: "Service not found" });
    }

    return {
      id: service.id,
      name: service.name,
      description: service.description || "",
      ownerId: service.ownerId || "",
      topLinks: service.topLinks ? JSON.parse(service.topLinks) : [],
      headLinks: service.headLinks ? JSON.parse(service.headLinks) : [],
      forbidContents: service.forbidContents
        ? JSON.parse(service.forbidContents)
        : [],
      blockedIPs: service.blockedIPs ? JSON.parse(service.blockedIPs) : [],
      auth: service.auth ? JSON.parse(service.auth) : {},
    };
  });

// Get reports for a service
export const getReports = protectedProcedure
  .input(z.object({ serviceId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    const reports = await db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.serviceId, input.serviceId))
      .orderBy(desc(schema.reports.createdAt));

    // Get thread and reply info for each report
    const reportsWithDetails = await Promise.all(
      reports.map(async (report) => {
        let thread = null;
        let reply = null;

        if (report.threadId) {
          const threadResult = await db
            .select({
              id: schema.threads.id,
              title: schema.threads.title,
              userIp: schema.threads.userIp,
            })
            .from(schema.threads)
            .where(eq(schema.threads.id, report.threadId))
            .limit(1);
          thread = threadResult[0] || null;
        }

        if (report.replyId) {
          const replyResult = await db
            .select({
              id: schema.replies.id,
              content: schema.replies.content,
              userIp: schema.replies.userIp,
            })
            .from(schema.replies)
            .where(eq(schema.replies.id, report.replyId))
            .limit(1);
          reply = replyResult[0] || null;
        }

        return {
          id: report.id,
          content: report.content,
          userIp: report.userIp || "",
          reportedIp: report.reportedIp || "",
          createdAt: report.createdAt,
          thread,
          reply,
        };
      })
    );

    return reportsWithDetails;
  });

// Delete reports
export const deleteReports = protectedProcedure
  .input(
    z.object({
      serviceId: z.string(),
      reportIds: z.array(z.string()),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    for (const reportId of input.reportIds) {
      await db.delete(schema.reports).where(eq(schema.reports.id, reportId));
    }

    return { success: true, deletedCount: input.reportIds.length };
  });

// Delete thread
export const deleteThread = protectedProcedure
  .input(
    z.object({
      serviceId: z.string(),
      threadId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    // Verify thread belongs to service
    const thread = await db
      .select()
      .from(schema.threads)
      .where(
        and(
          eq(schema.threads.id, input.threadId),
          eq(schema.threads.serviceId, input.serviceId)
        )
      )
      .limit(1);

    if (thread.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Thread not found" });
    }

    // Delete thread (cascade will delete replies)
    await db.delete(schema.threads).where(eq(schema.threads.id, input.threadId));

    return { success: true };
  });

// Delete reply
export const deleteReply = protectedProcedure
  .input(
    z.object({
      serviceId: z.string(),
      replyId: z.string(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    // Verify reply belongs to a thread in this service
    const reply = await db
      .select({
        id: schema.replies.id,
        threadId: schema.replies.threadId,
      })
      .from(schema.replies)
      .where(eq(schema.replies.id, input.replyId))
      .limit(1);

    const replyData = reply[0];
    if (!replyData) {
      throw new ORPCError("NOT_FOUND", { message: "Reply not found" });
    }

    // Verify thread belongs to service
    const thread = await db
      .select()
      .from(schema.threads)
      .where(
        and(
          eq(schema.threads.id, replyData.threadId),
          eq(schema.threads.serviceId, input.serviceId)
        )
      )
      .limit(1);

    if (thread.length === 0) {
      throw new ORPCError("FORBIDDEN", {
        message: "Reply does not belong to this service",
      });
    }

    await db.delete(schema.replies).where(eq(schema.replies.id, input.replyId));

    return { success: true };
  });

// Update service
export const updateService = protectedProcedure
  .input(serviceUpdateSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.topLinks !== undefined)
      updateData.topLinks = JSON.stringify(input.topLinks);
    if (input.headLinks !== undefined)
      updateData.headLinks = JSON.stringify(input.headLinks);
    if (input.forbidContents !== undefined)
      updateData.forbidContents = JSON.stringify(input.forbidContents);
    if (input.blockedIPs !== undefined)
      updateData.blockedIPs = JSON.stringify(input.blockedIPs);
    if (input.auth !== undefined) updateData.auth = JSON.stringify(input.auth);

    const db = createDb(env.DB);
    await db
      .update(schema.services)
      .set(updateData)
      .where(eq(schema.services.id, input.serviceId));

    return { success: true };
  });

// Delete service
export const deleteService = protectedProcedure
  .input(z.object({ serviceId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkServiceOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    await db
      .delete(schema.services)
      .where(eq(schema.services.id, input.serviceId));

    return { success: true };
  });
