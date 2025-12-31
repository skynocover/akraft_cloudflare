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

// Metadata schema for organization forum settings
const metadataSchema = z.object({
  topLinks: z.array(linkItemSchema).optional(),
  headLinks: z.array(linkItemSchema).optional(),
  forbidContents: z.array(z.string()).optional(),
  blockedIPs: z.array(z.string()).optional(),
  auth: z.record(z.string(), z.string()).optional(),
  visible: z.boolean().optional(),
});

const organizationUpdateSchema = z.object({
  organizationId: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  logo: z.string().optional(),
  metadata: metadataSchema.optional(),
});

// Helper to check if user is organization member with owner role
async function checkOrganizationOwner(userId: string, organizationId: string) {
  const db = createDb(env.DB);
  const result = await db
    .select({ role: schema.member.role })
    .from(schema.member)
    .where(
      and(
        eq(schema.member.organizationId, organizationId),
        eq(schema.member.userId, userId)
      )
    )
    .limit(1);

  const membership = result[0];
  if (!membership) {
    throw new ORPCError("NOT_FOUND", { message: "Organization not found or you are not a member" });
  }

  if (membership.role !== "owner" && membership.role !== "admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "You don't have permission to manage this organization",
    });
  }

  return true;
}

// Get organization details (replaces getService)
export const getService = protectedProcedure
  .input(z.object({ serviceId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkOrganizationOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    const result = await db
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.id, input.serviceId))
      .limit(1);

    const org = result[0];
    if (!org) {
      throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
    }

    // Parse metadata
    let metadata = {};
    if (org.metadata) {
      try {
        metadata = JSON.parse(org.metadata);
      } catch {
        metadata = {};
      }
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug || "",
      logo: org.logo || "",
      description: "", // For backward compatibility
      ownerId: "", // Deprecated - use member table
      topLinks: (metadata as Record<string, unknown>).topLinks || [],
      headLinks: (metadata as Record<string, unknown>).headLinks || [],
      forbidContents: (metadata as Record<string, unknown>).forbidContents || [],
      blockedIPs: (metadata as Record<string, unknown>).blockedIPs || [],
      auth: (metadata as Record<string, unknown>).auth || {},
    };
  });

// Get reports for an organization
export const getReports = protectedProcedure
  .input(z.object({ serviceId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkOrganizationOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    const reports = await db
      .select()
      .from(schema.reports)
      .where(eq(schema.reports.organizationId, input.serviceId))
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
    await checkOrganizationOwner(userId, input.serviceId);

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
    await checkOrganizationOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    // Verify thread belongs to organization
    const thread = await db
      .select()
      .from(schema.threads)
      .where(
        and(
          eq(schema.threads.id, input.threadId),
          eq(schema.threads.organizationId, input.serviceId)
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
    await checkOrganizationOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    // Verify reply belongs to a thread in this organization
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

    // Verify thread belongs to organization
    const thread = await db
      .select()
      .from(schema.threads)
      .where(
        and(
          eq(schema.threads.id, replyData.threadId),
          eq(schema.threads.organizationId, input.serviceId)
        )
      )
      .limit(1);

    if (thread.length === 0) {
      throw new ORPCError("FORBIDDEN", {
        message: "Reply does not belong to this organization",
      });
    }

    await db.delete(schema.replies).where(eq(schema.replies.id, input.replyId));

    return { success: true };
  });

// Update organization (replaces updateService)
export const updateService = protectedProcedure
  .input(
    z.object({
      serviceId: z.string(),
      name: z.string().optional(),
      slug: z.string().optional(),
      logo: z.string().optional(),
      // Backward compatibility fields stored in metadata
      description: z.string().optional(),
      topLinks: z.array(linkItemSchema).optional(),
      headLinks: z.array(linkItemSchema).optional(),
      forbidContents: z.array(z.string()).optional(),
      blockedIPs: z.array(z.string()).optional(),
      auth: z.record(z.string(), z.string()).optional(),
    })
  )
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkOrganizationOwner(userId, input.serviceId);

    const db = createDb(env.DB);

    // Get current organization to merge metadata
    const current = await db
      .select()
      .from(schema.organization)
      .where(eq(schema.organization.id, input.serviceId))
      .limit(1);

    if (current.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
    }

    // Parse existing metadata
    let existingMetadata: Record<string, unknown> = {};
    if (current[0].metadata) {
      try {
        existingMetadata = JSON.parse(current[0].metadata);
      } catch {
        existingMetadata = {};
      }
    }

    // Build updated metadata
    const updatedMetadata = {
      ...existingMetadata,
      ...(input.topLinks !== undefined && { topLinks: input.topLinks }),
      ...(input.headLinks !== undefined && { headLinks: input.headLinks }),
      ...(input.forbidContents !== undefined && { forbidContents: input.forbidContents }),
      ...(input.blockedIPs !== undefined && { blockedIPs: input.blockedIPs }),
      ...(input.auth !== undefined && { auth: input.auth }),
      ...(input.description !== undefined && { description: input.description }),
    };

    // Build update object
    const updateData: Record<string, unknown> = {
      metadata: JSON.stringify(updatedMetadata),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.slug !== undefined) updateData.slug = input.slug;
    if (input.logo !== undefined) updateData.logo = input.logo;

    await db
      .update(schema.organization)
      .set(updateData)
      .where(eq(schema.organization.id, input.serviceId));

    return { success: true };
  });

// Delete organization (replaces deleteService)
export const deleteService = protectedProcedure
  .input(z.object({ serviceId: z.string() }))
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;
    await checkOrganizationOwner(userId, input.serviceId);

    const db = createDb(env.DB);
    await db
      .delete(schema.organization)
      .where(eq(schema.organization.id, input.serviceId));

    return { success: true };
  });
