# apps/web CLAUDE.md

此文件提供 `apps/web` 的實作細節和開發規範。

## 概述

這是一個 **React SPA** 管理後台應用，負責：
- Service 管理（設定編輯）
- 檢舉內容管理
- 用戶認證（登入/註冊）

## 目錄結構

```
src/
├── main.tsx                    # 應用入口
├── routeTree.gen.ts            # TanStack Router 自動生成
├── routes/                     # 頁面路由
│   ├── __root.tsx              # 根佈局
│   ├── index.tsx               # 首頁
│   ├── login.tsx               # 登入頁
│   ├── dashboard.tsx           # Dashboard 佈局（含認證守衛）
│   ├── dashboard.index.tsx     # Dashboard 首頁（Service 列表）
│   └── dashboard.$serviceId.tsx # Service 管理頁
├── components/                 # React 元件
│   ├── header.tsx              # 頁首
│   ├── user-menu.tsx           # 用戶選單
│   ├── loader.tsx              # 載入動畫
│   ├── sign-in-form.tsx        # 登入表單
│   ├── sign-up-form.tsx        # 註冊表單
│   ├── theme-provider.tsx      # 主題提供者
│   ├── mode-toggle.tsx         # 暗/亮模式切換
│   ├── service/                # Service 相關元件
│   │   ├── ServiceEditor.tsx   # Service 設定編輯器
│   │   ├── ReportList.tsx      # 檢舉列表
│   │   └── LoadingOverlay.tsx  # 載入遮罩
│   └── ui/                     # shadcn/ui 元件
├── lib/                        # 工具函數
│   ├── utils.ts                # 通用工具（cn 函數）
│   └── auth-client.ts          # Better-Auth 客戶端
├── utils/
│   └── orpc.ts                 # ORPC 客戶端配置
└── mock/
    └── data.ts                 # Mock 資料（開發用）
```

## TanStack Router 路由結構

### 檔案命名規則

| 檔案名 | 路由路徑 | 說明 |
|--------|----------|------|
| `index.tsx` | `/` | 首頁 |
| `login.tsx` | `/login` | 登入頁 |
| `dashboard.tsx` | `/dashboard` | Dashboard 佈局（Layout Route） |
| `dashboard.index.tsx` | `/dashboard` | Dashboard 首頁內容 |
| `dashboard.$serviceId.tsx` | `/dashboard/:serviceId` | 動態路由 |

### 巢狀路由（Nested Routes）

`dashboard.tsx` 是一個 **Layout Route**，必須包含 `<Outlet />` 來渲染子路由：

```tsx
// dashboard.tsx - 佈局路由
import { Outlet } from "@tanstack/react-router";

function RouteComponent() {
  return <Outlet />;  // 子路由會在這裡渲染
}
```

子路由的命名規則：
- `dashboard.index.tsx` → `/dashboard` 的預設內容
- `dashboard.$serviceId.tsx` → `/dashboard/:serviceId` 的內容

### 認證守衛

在 `beforeLoad` 中檢查認證狀態：

```tsx
export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});
```

## ORPC 客戶端使用

### 配置

`src/utils/orpc.ts`:

```typescript
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { AppRouterClient } from "@akraft-cloudflare/api/routers/index";

export const link = new RPCLink({
  url: `${import.meta.env.VITE_SERVER_URL}/rpc`,
  fetch(url, options) {
    return fetch(url, {
      ...options,
      credentials: "include",  // 重要：傳送認證 Cookie
    });
  },
});

export const client: AppRouterClient = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
```

### 使用範例

```tsx
import { orpc } from "@/utils/orpc";

// 查詢
const { data, isLoading } = orpc.admin.getReports.useQuery({
  input: { serviceId },
});

// 變更
const deleteMutation = orpc.admin.deleteReports.useMutation();
await deleteMutation.mutateAsync({ reportIds: [id] });
```

## Better-Auth 客戶端

### 配置

`src/lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
});
```

### 使用範例

```tsx
import { authClient } from "@/lib/auth-client";

// 取得 Session
const { data: session } = await authClient.getSession();

// 登入
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// 登出
await authClient.signOut();
```

## 環境變數

在 `.env` 中設定：

```bash
VITE_SERVER_URL=http://localhost:8788
```

**注意**：Vite 環境變數必須以 `VITE_` 開頭才能在客戶端使用。

## UI 元件規範

### shadcn/ui 使用

所有 UI 元件優先使用 shadcn/ui：

```bash
# 安裝新元件
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
```

已安裝的元件：
- Card, Button, Input, Textarea
- Tabs, Table, Checkbox
- Tooltip, AlertDialog
- Dropdown Menu, Separator
- Sonner (Toast)

### 樣式規範

使用 Tailwind CSS，避免自訂 CSS：

```tsx
// ✅ 正確
<div className="flex items-center gap-2 p-4 bg-muted rounded-lg">

// ❌ 錯誤
<div style={{ display: 'flex', padding: '16px' }}>
```

## 本地開發

```bash
# 啟動開發伺服器
pnpm dev
```

預設運行在 `http://localhost:3001`

**注意**：開發時需要同時啟動 `apps/server`，因為 web 需要呼叫 server 的 API。

## 與 Server 的 CORS 關係

`apps/web` 運行在 `localhost:3001`，需要呼叫 `apps/server`（`localhost:8788`）的 API。

Server 端 CORS 設定（`apps/server/.dev.vars`）：
```bash
CORS_ORIGIN=http://localhost:3001
```

確保：
1. `CORS_ORIGIN` 設定正確
2. ORPC 請求包含 `credentials: "include"`
3. Cookie 的 SameSite 設定允許跨域

## Service 管理頁面結構

`/dashboard/:serviceId` 頁面包含兩個主要元件：

### ServiceEditor

編輯 Service 設定：
- Name（名稱）
- Description（描述）
- Top Links（頂部連結）
- Head Links（標頭連結）
- Forbidden Contents（禁止詞）
- Blocked IPs（封鎖 IP）
- Auth Settings（認證設定）

### ReportList

管理檢舉內容：
- 顯示所有檢舉
- 批次刪除檢舉
- 檢視檢舉詳情
- 刪除相關的 Thread/Reply

## 測試帳號

開發環境測試帳號：
- 帳號：`user@gmail.com`
- 密碼：`123456789`
- 已設為 Dota2 service 的 owner
