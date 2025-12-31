# 組織

實作以下部分

1. ~~如果現在還沒有 那麼需要安裝better auth的organization~~ ✅ 已完成
2. ~~organization就是目前的service 為了簡潔 你可以把兩個做整合 前端叫做service DB叫做organize~~ ✅ 已完成
3. ~~用戶註冊時 自動建立一個組織 名稱為 {username}'s board 也可以自行建立~~ ✅ 已完成
4. ~~跟一般的SaaS相同 用戶在dashboard時可以在左上角切換組織 切換到哪一個組織記錄在localstorage~~ ✅ 已完成
5. ~~在後台也就是web的那個vite服務登入後 會自動跳轉到localstorage記錄的組織 http://localhost:3001/dashboard/rec_cqvkdi9bsa448tm365f0~~ ✅ 已完成
6. ~~如果找不到紀錄的組織 那就找其中一個組織 然後跳轉就去~~ ✅ 已完成
7. ~~如果用戶沒有組織 則跳轉到一個頁面 讓用戶自行建立~~ ✅ 已完成

## 實作說明

### 1. Better Auth Organization Plugin
- 在 `packages/auth/src/index.ts` 安裝了 organization plugin
- 在 `apps/web/src/lib/auth-client.ts` 添加了 organizationClient

### 2. 資料庫 Schema
- 在 `packages/db/src/schema/auth.ts` 添加了：
  - `organization` 表：儲存組織資訊
  - `member` 表：用戶與組織的關聯
  - `invitation` 表：組織邀請
  - `session` 表添加 `activeOrganizationId` 欄位

### 3. 自動建立組織
- 使用 Better Auth 的 `databaseHooks.user.create.after` 在用戶註冊後自動建立組織
- 組織名稱格式：`{username}'s board`

### 4. 組織切換器
- 新增 `apps/web/src/components/service-switcher.tsx`
- 在 dashboard 頁面的 header 左上角顯示
- 選擇的組織 ID 儲存在 localStorage (`akraft-active-service`)

### 5. Dashboard 重導向邏輯
- 更新 `apps/web/src/routes/dashboard.tsx` 的 beforeLoad
- 自動重導向到 localStorage 記錄的組織或第一個組織

### 6. 建立組織頁面
- 新增 `apps/web/src/routes/dashboard.create.tsx`
- 當用戶沒有任何組織時會被導向此頁面


