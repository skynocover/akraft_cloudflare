import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { createDb } from "@akraft-cloudflare/db";
import * as schema from "@akraft-cloudflare/db/schema/auth";

// Generate a unique ID (similar to Better Auth's internal ID generation)
function generateId() {
	return crypto.randomUUID().replace(/-/g, "");
}

// Factory function to create auth instance with proper env binding
export function createAuth(env: {
	DB: D1Database;
	CORS_ORIGIN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
}) {
	const db = createDb(env.DB);

	// Build trusted origins list (include www and non-www variants)
	const buildTrustedOrigins = (urls: string[]) => {
		const origins = new Set<string>();
		for (const url of urls) {
			if (!url) continue;
			origins.add(url);
			// Add www variant if not present
			if (url.includes("://www.")) {
				origins.add(url.replace("://www.", "://"));
			} else if (url.match(/:\/\/[^/]+/) && !url.includes("://localhost")) {
				origins.add(url.replace("://", "://www."));
			}
		}
		return Array.from(origins);
	};

	const auth = betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: schema,
		}),
		// Include dashboard (CORS_ORIGIN) and server (BETTER_AUTH_URL) with www/non-www variants
		trustedOrigins: buildTrustedOrigins([env.CORS_ORIGIN, env.BETTER_AUTH_URL]),
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: "lax",
				// secure should be true for HTTPS (production)
				secure: env.BETTER_AUTH_URL.startsWith("https://"),
				httpOnly: true,
			},
		},
		plugins: [
			organization({
				// Allow users to create organizations
				allowUserToCreateOrganization: true,
				// Default role for organization creator
				creatorRole: "owner",
			}),
		],
		databaseHooks: {
			user: {
				create: {
					after: async (user) => {
						try {
							// Auto-create organization for new users
							const orgId = generateId();
							const memberId = generateId();
							const orgName = `${user.name}'s board`;
							const orgSlug = `${user.id.slice(0, 8)}-board`;
							const now = new Date();

							// Insert organization directly into database
							await db.insert(schema.organization).values({
								id: orgId,
								name: orgName,
								slug: orgSlug,
								createdAt: now,
							});

							// Add user as owner of the organization
							await db.insert(schema.member).values({
								id: memberId,
								userId: user.id,
								organizationId: orgId,
								role: "owner",
								createdAt: now,
							});

							console.log(`Created default organization "${orgName}" for user ${user.id}`);
						} catch (error) {
							// If organization creation fails, just log it
							console.error("Failed to create default organization for user:", user.id, error);
						}
					},
				},
			},
		},
	});

	return auth;
}

// Export type for client usage
export type Auth = ReturnType<typeof createAuth>;
