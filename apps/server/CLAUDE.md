# apps/server CLAUDE.md

此文件提供 `apps/server` 的實作細節和開發規範。

## 概述

這是一個 **Hono + HonoX** 伺服器應用，負責：
- 公開論壇的 SSR 頁面（SEO 優化）
- Forum API endpoints（thread/reply/report）
- R2 圖片上傳與服務
- ORPC RPC 處理
- Better-Auth 認證端點

## 目錄結構

```
src/
├── index.ts                    # 主入口，所有路由註冊
├── env.d.ts                    # Cloudflare 環境變數類型
├── types/
│   └── forum.ts                # 論壇相關 TypeScript 類型
├── app/routes/                 # HonoX SSR 頁面
│   ├── index.tsx               # 首頁
│   ├── api/hello.ts            # 測試 API
│   └── service/
│       ├── servicePage.tsx     # /service/:serviceId 頁面
│       └── threadPage.tsx      # /service/:serviceId/:threadId 頁面
├── components/                 # HonoX 元件
│   ├── Layout.tsx              # 主要佈局（含 Tailwind CDN）
│   ├── layout/                 # 佈局元件
│   │   ├── TopLink.tsx         # 頂部連結列
│   │   ├── Title.tsx           # 標題元件
│   │   └── Pagination.tsx      # 分頁元件
│   ├── thread/                 # 討論串元件
│   │   ├── Thread.tsx          # 討論串主體
│   │   ├── Post.tsx            # 貼文內容
│   │   ├── PostCard.tsx        # 發文/回覆表單
│   │   ├── ReplyButton.tsx     # 回覆按鈕
│   │   └── ReportButton.tsx    # 檢舉按鈕
│   └── ui/                     # shadcn/ui 元件
├── lib/                        # 工具模組
│   ├── utils.ts                # 通用工具（cn 函數）
│   ├── db/
│   │   └── queries.ts          # 資料庫查詢函數
│   ├── r2/
│   │   └── upload.ts           # R2 上傳工具
│   └── safety/
│       ├── moderation.ts       # IP封鎖、禁止詞、頻率限制
│       └── content-safety.ts   # Azure Content Safety API
└── mock/
    └── data.ts                 # Mock 資料（開發用）
```

## HonoX 元件撰寫規範

### 1. 不使用 React Client 特性

HonoX 元件是伺服器端渲染，**不支援**：
- `'use client'` 指令
- `useState`, `useEffect` 等 React hooks
- `useRouter`, `useParams` 等 Next.js hooks
- Event handlers 作為函數（如 `onClick={() => {}}`）

### 2. 使用 Inline JavaScript

客戶端互動必須使用 inline JavaScript 字串：

```tsx
// ✅ 正確：使用 onclick 字串
<button onclick="document.getElementById('modal').style.display='block'">
  Open Modal
</button>

// ❌ 錯誤：使用 onClick 函數
<button onClick={() => setOpen(true)}>
  Open Modal
</button>
```

### 3. 動態 ID 處理

使用唯一 ID 避免衝突：

```tsx
const uniqueId = `modal-${threadId}`;

<div id={uniqueId}>...</div>
<button onclick={`document.getElementById('${uniqueId}').style.display='block'`}>
  Open
</button>
```

### 4. JSX 屬性命名

使用 HTML 原生屬性名（小寫）：

| React | HonoX |
|-------|-------|
| `className` | `class` |
| `onClick` | `onclick` |
| `onChange` | `onchange` |
| `htmlFor` | `for` |

### 5. 類型導入

使用 Hono 的 JSX 類型：

```tsx
import type { FC } from "hono/jsx";

interface Props {
  title: string;
}

export const MyComponent: FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

## API Endpoints

所有端點在 `src/index.ts` 中定義：

### 公開論壇 API

| Method | Path | 描述 |
|--------|------|------|
| GET | `/service/:serviceId` | Service 頁面（SSR） |
| GET | `/service/:serviceId/:threadId` | Thread 頁面（SSR） |
| POST | `/api/service/:serviceId/thread` | 建立討論串 |
| POST | `/api/service/:serviceId/reply` | 建立回覆 |
| POST | `/api/service/:serviceId/report` | 建立檢舉 |
| GET | `/api/images/:imageToken` | 取得 R2 圖片 |

### 認證 & RPC

| Method | Path | 描述 |
|--------|------|------|
| GET/POST | `/api/auth/*` | Better-Auth 端點 |
| * | `/rpc/*` | ORPC RPC 端點 |
| * | `/api-reference` | OpenAPI 文件 |

## R2 圖片上傳

### 配置

`wrangler.jsonc`:
```json
"r2_buckets": [
  {
    "binding": "R2",
    "bucket_name": "akraft-images"
  }
]
```

### 上傳流程

```typescript
import { uploadImage } from './lib/r2/upload';

// 1. 取得上傳的檔案
const imageFile = formData.get('image') as File;

// 2. 上傳到 R2
const result = await uploadImage(env.R2, imageFile);
if (result.success) {
  // 3. 儲存 imageToken 到資料庫
  const imageToken = result.imageToken;
}
```

### 限制

- 檔案大小：最大 5MB
- 支援格式：JPEG, PNG, GIF, WebP
- 儲存路徑：`images/{imageToken}.{ext}`

## Content Safety & Moderation

### 審核順序

建立 thread/reply 時的檢查順序：

1. **IP 封鎖檢查** - 檢查用戶 IP 是否在黑名單
2. **禁止詞檢查** - 檢查內容是否包含禁止詞
3. **頻率限制** - 每 IP 每分鐘最多 10 次發文
4. **Content Safety** - Azure API 檢測有害內容（如已配置）

### 使用範例

```typescript
import { checkModeration } from './lib/safety/moderation';
import { isContentSafetyEnabled, checkContentSafety } from './lib/safety/content-safety';

// 1. 基本審核
const moderationResult = checkModeration(service, userIp, content, title);
if (!moderationResult.allowed) {
  return c.text(moderationResult.reason, 403);
}

// 2. 進階內容安全（可選）
if (isContentSafetyEnabled(env.CONTENT_SAFETY_ENDPOINT, env.CONTENT_SAFETY_API_KEY)) {
  const safetyResult = await checkContentSafety(
    env.CONTENT_SAFETY_ENDPOINT,
    env.CONTENT_SAFETY_API_KEY,
    { text: content, imageData }
  );
  if (!safetyResult.safe) {
    return c.text(`Content blocked: ${safetyResult.blockedCategories.join(', ')}`, 403);
  }
}
```

## 環境變數

本地開發設定在 `.dev.vars`：

```bash
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_SECRET=your-secret
BETTER_AUTH_URL=http://localhost:8788

# 可選：Azure Content Safety
CONTENT_SAFETY_ENDPOINT=https://your-resource.cognitiveservices.azure.com
CONTENT_SAFETY_API_KEY=your-api-key
```

## 本地開發

```bash
# 啟動開發伺服器
pnpm dev

# 資料庫操作
pnpm db:push      # 套用 schema 變更
pnpm db:studio    # 開啟 Drizzle Studio
```

預設運行在 `http://localhost:8788`

## 路由註冊注意事項

由於 Cloudflare Workers 不支援檔案系統 API，HonoX 的自動路由無法使用。
所有路由必須在 `src/index.ts` 中手動註冊：

```typescript
// 手動註冊 SSR 頁面
app.get('/service/:serviceId', async (c) => {
  // ...
  return c.html(ServicePage({ ... }));
});

// 手動註冊 API 端點
app.post('/api/service/:serviceId/thread', async (c) => {
  // ...
});
```
