export type CloudflareEnv = {
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DB: D1Database;
  R2: R2Bucket;
  // Content Safety (Azure)
  CONTENT_SAFETY_ENDPOINT?: string;
  CONTENT_SAFETY_API_KEY?: string;
};

declare global {
  type Env = CloudflareEnv;
}

declare module 'cloudflare:workers' {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
