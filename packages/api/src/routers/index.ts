import { protectedProcedure, publicProcedure } from "../index";
import type { RouterClient } from "@orpc/server";
import * as admin from "./admin";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	// Admin API
	admin: {
		getService: admin.getService,
		getReports: admin.getReports,
		deleteReports: admin.deleteReports,
		deleteThread: admin.deleteThread,
		deleteReply: admin.deleteReply,
		updateService: admin.updateService,
		deleteService: admin.deleteService,
	},
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
