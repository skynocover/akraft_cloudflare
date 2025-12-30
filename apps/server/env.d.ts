export type CloudflareEnv = {
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DB: D1Database;
  R2: R2Bucket;
  // R2 public URL (for production, e.g., https://pub-xxx.r2.dev or custom domain)
  // If not set, uses /api/images/:imageToken endpoint
  R2_PUBLIC_URL?: string;
  // Cloudflare Images URL (for legacy data, e.g., https://imagedelivery.net/xxx)
  CLOUDFLARE_IMAGES_URL?: string;
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
