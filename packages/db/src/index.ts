import * as schema from "./schema";

import { drizzle } from "drizzle-orm/d1";

// Factory function to create db instance from D1 binding
// Use this instead of global db for Cloudflare Workers compatibility
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
