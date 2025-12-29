# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **discussion forum platform** built as a full-stack TypeScript monorepo targeting Cloudflare Workers deployment. The application combines a public-facing forum with SEO-optimized pages and an admin dashboard for content moderation.

**Application Purpose:**
- **Forum System:** Users can create discussion threads, post replies, and report inappropriate content
- **Content Moderation:** Admin-only dashboard for managing reports and deleting content
- **SEO Requirements:** Public forum pages rendered server-side via HonoX for search engine optimization

**Key Technologies:**
- **Monorepo:** Turborepo with pnpm workspaces
- **Frontend:** React 19, TanStack Router (file-based routing), TailwindCSS, shadcn/ui
- **Backend:** Hono, HonoX (SSR forum pages), ORPC (type-safe RPC), Better-Auth
- **Database:** Drizzle ORM with SQLite/D1 (Cloudflare)
- **Runtime:** Cloudflare Workers (with Node.js compatibility enabled)



## Architecture

### Monorepo Structure

```
akraft-cloudflare/
├── apps/
│   ├── web/                 # Admin dashboard (React SPA)
│   └── server/              # Backend API + SSR forum (Hono + HonoX)
└── packages/
    ├── api/                 # ORPC routers & business logic
    ├── auth/                # Better-Auth configuration
    ├── db/                  # Drizzle schema & client
    └── config/              # Shared TypeScript configs
```

### Application Domains

This project has **two distinct frontend experiences**:

1. **Public Forum (HonoX in `apps/server`):**
   - Server-side rendered pages for SEO
   - Routes defined in `apps/server/src/app/routes/`
   - Accessible to all users (guests and authenticated)
   - Examples: thread listings, thread detail pages, user profiles

2. **Admin Dashboard (React in `apps/web`):**
   - Client-side React SPA
   - Admin-only access (requires authentication + admin role)
   - Content moderation interface
   - Examples: report management, content deletion, user management

### Data Flow & Type Safety

1. **Database � API � Server � Web:**
   - `packages/db`: Define schema with Drizzle
   - `packages/api`: Create ORPC procedures using `publicProcedure` or `protectedProcedure`
   - `packages/api/routers/index.ts`: Export `appRouter` with all procedures
   - `apps/server`: Handle incoming requests via `RPCHandler` or `OpenAPIHandler`
   - `apps/web`: Call procedures using auto-generated type-safe client

2. **ORPC Type Safety:**
   - All API procedures are defined in `packages/api`
   - `publicProcedure`: No authentication required
   - `protectedProcedure`: Requires authenticated session (middleware checks `context.session.user`)
   - Context created in `packages/api/context.ts` from Hono context + Better-Auth session
   - Client types auto-inferred via `AppRouterClient` export

3. **Authentication Flow:**
   - Better-Auth configured in `packages/auth/src/index.ts`
   - Uses Drizzle adapter with auth tables in `packages/db/schema/auth`
   - Session retrieved in `createContext()` and available to all procedures
   - Auth endpoints mounted at `/api/auth/*` in server

### Server Request Routing

The server (`apps/server/src/index.ts`) handles requests in this order:

1. CORS middleware (allows configured origins)
2. Better-Auth endpoints (`/api/auth/*`)
3. RPC endpoints (`/rpc/*`) - handled by `RPCHandler`
4. OpenAPI reference (`/api-reference`) - handled by `OpenAPIHandler`
5. Custom routes (e.g., HonoX pages, manual routes)

### Environment Variables

Required environment variables are typed in `apps/server/env.d.ts`:

```typescript
export type CloudflareEnv = {
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DB: D1Database;  // Cloudflare D1 binding
};
```

Set these in `.env` files for local development. For production, configure them in Cloudflare Workers settings.

### Cloudflare Workers Compatibility

- `wrangler.jsonc` includes `nodejs_compat` flag (required for Better-Auth's `async_hooks`)
- Database uses Cloudflare D1 (SQLite-compatible)
- Import from `cloudflare:workers` to access `env` bindings
- File system APIs (like HonoX's `createApp()` with glob) won't work - use manual routing instead

### Adding New API Procedures

1. Define procedure in `packages/api/routers/` (or create new router file)
2. Add to `appRouter` object in `packages/api/routers/index.ts`
3. Types automatically flow to frontend via `AppRouterClient`
4. Call from web using ORPC client hooks

### Working with Database

1. Define/update schema in `packages/db/src/schema/`
2. Run `pnpm run db:push` to apply changes
3. Access via `db` export from `@akraft-cloudflare/db`
4. Use in API procedures through context

### Package Manager

This project uses **pnpm** with workspaces. The catalog feature in `pnpm-workspace.yaml` centralizes dependency versions. Use `catalog:` in package.json to reference catalog versions.

## Forum Domain Model

### Core Entities

1. **Services**
   - Top-level entity that groups related discussion threads
   - Each service has a unique ID (e.g., `66a6eca2bfccee3f04a52bc4`)
   - Contains multiple threads
   - Stored in `packages/db/src/schema/`

2. **Threads**
   - Discussion topics within a service
   - Each thread has a unique ID (e.g., `rec_d4utebsgmio87vvfiqig`)
   - Belongs to a specific service (foreign key relationship)
   - Created by any user (authenticated or guest)
   - Can be reported and deleted (admin-only)

3. **Replies** (within `threads`)
   - Responses to threads
   - Created by any user (authenticated or guest)
   - Can be reported and deleted (admin-only)
   - Nested structure: reply belongs to thread

4. **Reports**
   - Can target either threads or replies
   - Created by any user to flag inappropriate content
   - Types: spam, harassment, misinformation, etc.
   - Managed by admins via dashboard

5. **Users & Admin Roles**
   - Standard users: Can create threads, replies, and reports
   - Admins: All user permissions + content deletion + report management
   - Role stored in user schema (check `packages/db/schema/auth`)

### Permission Model

**Public Actions (no authentication required):**
- View threads and replies
- Create threads
- Create replies
- Submit reports

**Admin-Only Actions (requires admin role):**
- Delete threads
- Delete replies
- View all reports
- Resolve/dismiss reports
- Ban users (if implemented)

### Routing Strategy

**SEO-Critical Routes (HonoX SSR in `apps/server`):**
- `/service/:serviceId` - Service page displaying all threads for a specific service
  - Example: `/service/66a6eca2bfccee3f04a52bc4`
  - Lists all discussion threads under this service

- `/service/:serviceId/:threadId` - Thread detail page showing all replies
  - Example: `/service/66a6eca2bfccee3f04a52bc4/rec_d4utebsgmio87vvfiqig`
  - Displays thread content and all replies
  - Includes reply form for authenticated users

**Important:** Register these routes manually in `apps/server/src/index.ts` (HonoX's auto-routing doesn't work in Workers)

### Implementation Guidelines

When adding forum features:
1. Define database schema in `packages/db/src/schema/forum.ts` (create if needed)
2. Create ORPC procedures in `packages/api/routers/forum.ts` (create if needed)
3. Add admin-only procedures using `protectedProcedure` with role check middleware
4. Implement HonoX pages for public forum in `apps/server/src/app/routes/`
5. Implement admin UI in `apps/web/src/routes/admin/`
6. Remember: manual route registration required for HonoX routes in server

## Critical Rules

### ✅ DO
- 使用 TypeScript，不要使用 `any` 類型
- 為每個函數定義參數和返回類型
- Always start by creating a detailed todo list for the current task.
- Check the todo list before starting each step, and update it after each step.
- 確認TODO.md 的內容 必要時可以修改 例如做完或是你認為需要加上或補充的
- 重構時，盡可能使用我給你的程式碼，而不是直接重寫一份新的，目的是讓畫面跟之前保持相同
- 除非Shadcn沒有或是我指定，不然只能使用Shadcn當作元件 而不是自己做一個
- 需要shadcn時 使用指令安裝新的shadcn元件
- 資料庫會使用D1, Drizzle ORM, 開發時使用本地D1
- 儲存檔案使用R2 開發時使用本地R2
- 登入使用Better Auth, 登入相關頁面則使用Better Auth UI
- 在測試時 開啟了服務需要關閉 否則port會被佔用
- 使用axios而不是fetch

### ❌ NEVER
- **不要修改 package.json 的依賴版本**
- **不要創建超過 300 行的組件文件**
- 不要自己寫CSS, 而是使用tailwind
- 不要使用Alchemy來做部署

### ⚠️ IMPORTANT
如果 Claude 建議違反上述規則，請要求我（用戶）確認。