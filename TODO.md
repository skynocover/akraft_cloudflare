# 重構專案

這是一個重構專案
目的是將原本Opennext的專案遷移到現有專案
過去專案的內容在`/src`內

專案為類似4Chan的討論版結構
service為各種版面（對應 Better Auth 的 organization）
版面內有多個討論串threads
討論串有多個回應reply以及回報report
開啟threads以及reply不需要任何權限

管理頁面則會有管理員 為owner
可以刪除threads或是reply
這部分就需要管理員

規劃如下
- 討論版使用HonoX 因此不會call api 而是使用SSR 在apps/server內
- 討論版會有管理員管理頁面 這部分使用vite 在apps/web內
- service = Better Auth 的 organization（前端顯示 service，DB 用 organization）

## 遵守規則

- 重構畫面的部分時 盡可能使用原本的`/src`的程式碼 而不是自己寫
- 先做mock畫面 讓我先看畫面如何 之後再實作server部分以及DB部分
- 規劃時 可以分成各個階段 逐步完成

---

# 重構階段規劃

## 階段總覽

| 階段 | 名稱 | 目標 | 狀態 |
|------|------|------|------|
| 1 | 環境準備 | 安裝所有 shadcn 元件、設定 Tailwind | ✅ 完成 |
| 2 | Mock 畫面 - 公開論壇 | HonoX SSR 頁面（假資料） | ✅ 完成 |
| 3 | Mock 畫面 - 管理後台 | React SPA 管理頁面（假資料） | ✅ 完成 |
| 4 | 資料庫 Schema | threads, replies, reports 表結構 | ✅ 完成 |
| 5 | 整合 - 公開論壇 | HonoX 直接查詢 DB | 待開始 |
| 6 | 整合 - 管理後台 | API + 權限控制 | 待開始 |
| 7 | 檔案上傳 | R2 整合 | 待開始 |
| 8 | 進階功能 | 內容審核、IP封鎖等 | 待開始 |

---

## 階段 1: 環境準備

**目標**: 一次性安裝所有必要的 shadcn/ui 元件和設定

### 1.1 apps/server (HonoX) shadcn 元件
安裝以下元件：
- [x] Card
- [x] Button
- [x] Separator
- [x] Input
- [x] Textarea
- [x] Tabs
- [x] Alert
- [x] Checkbox
- [x] Dialog（用於回覆彈窗）

### 1.2 apps/web (React SPA) shadcn 元件
安裝以下元件：
- [x] Card
- [x] Button
- [x] Input
- [x] Textarea
- [x] Tabs
- [x] Table
- [x] Checkbox
- [x] Tooltip
- [x] AlertDialog
- [x] Sonner/Toast

### 1.3 共用設定
- [x] 確認 Tailwind CSS 設定正確
- [x] 設定共用的 CSS 變數（Layout 元件）
- [x] 建立 apps/server Layout 元件（含 Tailwind CDN）

---

## 階段 2: Mock 畫面 - 公開論壇 (HonoX SSR)

**目標**: 在 `apps/server` 中建立論壇頁面的靜態 Mock 版本

### 2.1 建立 Mock 資料
在 `apps/server/src/mock/`:
- [x] `data.ts` - Mock service、threads、replies 資料

### 2.2 遷移元件到 apps/server
從 `/src/components` 遷移（調整為 HonoX 相容）:

**佈局元件** (`apps/server/src/components/layout/`)
- [x] `TopLink.tsx` - 頂部連結列
- [x] `Title.tsx` - 標題元件
- [x] `Pagination.tsx` - 分頁元件

**討論串元件** (`apps/server/src/components/thread/`)
- [x] `Thread.tsx` - 討論串元件（含回覆列表）
- [x] `Post.tsx` - 貼文內容（PostMeta, PostComponent, PostContent）
- [x] `PostCard.tsx` - 發文/回覆表單
- [x] `ReplyButton.tsx` - 回覆按鈕
- [x] `ReportButton.tsx` - 檢舉按鈕

### 2.3 建立 HonoX 頁面路由
手動註冊路由（保持原本結構）:

- [x] `/service/:serviceId` - Service 頁面
  - 顯示討論串列表
  - 包含 TopLink, Title, PostCard, Pagination, Thread 元件

- [x] `/service/:serviceId/:threadId` - 討論串詳情頁
  - 顯示完整討論串和所有回覆
  - 包含 TopLink, Title, Thread 元件

### 修改 (已完成)

- [x] placeholder 一律使用英文
- [x] 回覆改用icon 跟舊版相同
- [x] 上傳圖片貨貼上youtube連結使用tab切換 跟舊版相同
- [x] thread title的最右邊 在No. 右側 應該有回報的按鈕 使用紅色旗幟 跟舊版相同
- [x] 回覆按鈕按下應該是跳彈窗 跟舊版相同
- [x] 點擊 threads title 右側的No.thread 應該是跳出回覆的彈窗 並且加上 >> No.thread 跟舊版相同
- [x] 展開回覆不是直接跳一個新的頁面 而是展開 跟舊版相同
- [x] mock 資料多放一點 這樣我才能測試換頁功能 (現在有 25+ 討論串可測試分頁)

---

## 階段 3: Mock 畫面 - 管理後台 (React SPA)

**目標**: 在 `apps/web` 中建立管理頁面的靜態 Mock 版本

### 3.1 建立 Mock 資料
在 `apps/web/src/mock/`:
- [x] `data.ts` - Mock service、reports 資料

### 3.2 遷移管理元件
從 `/src/components/service` 遷移:

- [x] `ReportList.tsx` - 檢舉列表管理
- [x] `ServiceEditor.tsx` - Service 設定編輯器
- [x] `LoadingOverlay.tsx` - 載入遮罩

### 3.3 建立管理頁面路由
在 `apps/web/src/routes/`:

- [x] `/dashboard/:serviceId` - 管理後台主頁
  - ServiceEditor 元件
  - ReportList 元件
  - 權限檢查 UI (Mock)

---

## 階段 4: 資料庫 Schema

**目標**: 在 `packages/db` 中建立論壇相關表結構

資料需要參考xata-backup

### 4.1 建立獨立 services 表（基於 xata-backup 結構）
- [x] 建立 services 表（不使用 organization，因舊資料有額外欄位）
- [x] 包含 auth, topLinks, headLinks, forbidContents, blockedIPs 等 JSON 欄位

### 4.2 建立論壇 Schema
在 `packages/db/src/schema/forum.ts`:

```
services 表:
- id, name, description, ownerId
- auth, topLinks, headLinks (JSON)
- forbidContents, blockedIPs (JSON)
- visible, createdAt, updatedAt

threads 表:
- id, serviceId, title, name, content
- imageToken, youtubeId
- userId, userIp
- replyAt, createdAt

replies 表:
- id, threadId, name, content
- imageToken, youtubeId
- sage, userId, userIp
- createdAt

reports 表:
- id, serviceId, threadId, replyId
- content, userIp, reportedIp
- createdAt
```

### 4.3 匯出 Schema
- [x] 在 `packages/db/src/schema/index.ts` 匯出
- [x] 執行 `wrangler d1 execute` 建立本地表

---

## 階段 5: 整合 - 公開論壇

**目標**: HonoX 頁面直接查詢 DB（不透過 API）

### 5.1 建立資料查詢函數
在 `apps/server/src/lib/db/` 或直接在路由中:

- [ ] `getOrganization(orgId)` - 取得 service 資訊
- [ ] `getThreads(orgId, page, pageSize)` - 取得討論串列表
- [ ] `getThread(orgId, threadId)` - 取得單一討論串含回覆

### 5.2 替換 Mock 資料
- [ ] `/service/:serviceId` 使用實際 DB 查詢
- [ ] `/service/:serviceId/:threadId` 使用實際 DB 查詢

### 5.3 實作表單提交
建立 API endpoint（在 apps/server 中）:

- [ ] `POST /api/service/:serviceId/thread` - 建立討論串
- [ ] `POST /api/service/:serviceId/reply` - 建立回覆
- [ ] `POST /api/service/:serviceId/report` - 建立檢舉

---

## 階段 6: 整合 - 管理後台

**目標**: 管理頁面連接 API 和權限控制

### 6.1 建立管理 API (ORPC)
在 `packages/api/src/routers/admin.ts`:

```
需認證 (protectedProcedure + owner check):
- getReports(orgId) - 取得檢舉列表
- deleteReports(reportIds, deleteAssociated?)
- deleteThread(threadId)
- deleteReply(replyId)
- updateOrganization(orgId, data) - 更新 service 設定
```

### 6.2 權限整合
- [ ] 檢查用戶是否為 organization owner
- [ ] 非 owner 顯示錯誤訊息

### 6.3 連接 API
- [ ] ServiceEditor 儲存功能
- [ ] ReportList CRUD 功能

---

## 階段 7: 檔案上傳 (R2)

**目標**: 整合 Cloudflare R2 實現圖片上傳

### 7.1 R2 設定
- [ ] 設定 R2 bucket（wrangler.jsonc）
- [ ] 建立上傳 API endpoint

### 7.2 整合到元件
- [ ] PostCard 圖片上傳
- [ ] 圖片顯示使用 R2 URL

---

## 階段 8: 進階功能

**目標**: 實作內容審核和安全功能

### 8.1 內容安全
- [ ] NSFW 圖片檢測（Azure Content Safety 或替代）

### 8.2 安全功能
- [ ] IP 封鎖功能
- [ ] 禁止詞過濾
- [ ] 發文頻率限制

---

# 架構說明

## Service = Organization

```
前端顯示          DB 實際存儲
─────────        ────────────
service      →   organization (Better Auth)
serviceId    →   organizationId
owner        →   organization owner
```

## 資料流

### 公開論壇 (HonoX SSR)
```
瀏覽器 → HonoX Server → 直接查詢 DB → SSR 渲染 → HTML
```

### 管理後台 (React SPA)
```
瀏覽器 → React App → ORPC API → DB
                  ↓
            Better Auth 驗證
```

---

# 原始碼對照表

| 原始檔案 (`/src`) | 目標位置 | 用途 |
|------------------|---------|------|
| `components/thread/Thread.tsx` | `apps/server/src/components/thread/` | 討論串 (HonoX) |
| `components/thread/Post.tsx` | `apps/server/src/components/thread/` | 貼文內容 (HonoX) |
| `components/thread/PostCard.tsx` | `apps/server/src/components/thread/` | 發文表單 (HonoX) |
| `components/thread/ReplyButton.tsx` | `apps/server/src/components/thread/` | 回覆按鈕 (HonoX) |
| `components/thread/ReportButton.tsx` | `apps/server/src/components/thread/` | 檢舉按鈕 (HonoX) |
| `components/layout/TopLink.tsx` | `apps/server/src/components/layout/` | 頂部連結 (HonoX) |
| `components/layout/Title.tsx` | `apps/server/src/components/layout/` | 標題 (HonoX) |
| `components/layout/Pagination.tsx` | `apps/server/src/components/layout/` | 分頁 (HonoX) |
| `components/service/ReportList.tsx` | `apps/web/src/components/service/` | 檢舉管理 (React) |
| `components/service/serviceEditor.tsx` | `apps/web/src/components/service/` | Service編輯 (React) |

---

# 技術變更對照

| 原技術 | 新技術 | 說明 |
|--------|--------|------|
| Next.js (App Router) | HonoX (SSR) + React (SPA) | 框架 |
| Xata | Drizzle ORM + D1 | 資料庫 |
| Stack Auth | Better Auth | 認證 |
| services 表 | organization (Better Auth) | Service 存儲 |
| Next.js API Routes | HonoX routes + ORPC | API |
| Cloudflare Images | R2 | 圖片存儲 |

---

# 注意事項

1. **HonoX 路由**: 需手動在 `apps/server/src/index.ts` 註冊，保持原本 `/service/:serviceId` 結構

2. **SSR vs Client**: 論壇頁面用 SSR 直接查 DB，管理後台用 Client + API

3. **Service = Organization**: 不建立獨立 services 表，直接使用 Better Auth 的 organization

4. **元件調整**: 移除 `'use client'`、`useRouter` 等 Next.js 特有程式碼，改用 HonoX 相容寫法
