# 發文時顯示 Admin - 實作完成

## 已完成功能

### Phase 1：登入功能 ✅
1. ✅ 創建 `/login` 頁面（HonoX SSR）- Google OAuth 登入
2. ✅ 修改 TopLink，根據 session 顯示 Login/用戶名稱（不明顯樣式）
3. ✅ 實作登出功能 (`/logout`)

### Phase 2：發文標記 ✅
4. ✅ 修改 `threads` 和 `replies` schema，新增 `isAdmin` 欄位
5. ✅ 修改發文 API，檢查 session 並設置 `isAdmin`
6. ✅ 修改 PostCard，根據登入狀態顯示不同按鈕文字
   - 未登入：`Submit` / `Submit reply`
   - 已登入 (Admin)：`Submit as Admin` / `Submit reply as Admin`（紅色按鈕）

### Phase 3：顯示樣式 ✅
7. ✅ 修改 Post 元件，Admin 發文顯示特殊樣式
   - 紅色名稱
   - 紅色 "Admin" 標籤

---

## 技術細節

### 登入流程
```
用戶點擊 Login → /login 頁面 → Google OAuth → 回調原頁面
```

### Admin 判斷邏輯
- 檢查用戶是否為 organization 的 owner 或 admin
- 使用 `member` 表的 role 欄位判斷

### 修改的檔案
- `apps/server/src/app/routes/loginPage.tsx` - 登入頁面
- `apps/server/src/components/layout/TopLink.tsx` - 頂部連結（含登入/登出）
- `apps/server/src/components/layout/Header.tsx` - 首頁 Header
- `apps/server/src/components/thread/PostCard.tsx` - 發文表單
- `apps/server/src/components/thread/Post.tsx` - 貼文顯示
- `apps/server/src/components/thread/Thread.tsx` - 討論串
- `apps/server/src/components/thread/ReplyButton.tsx` - 回覆按鈕
- `apps/server/src/app/routes/service/servicePage.tsx` - 服務頁面
- `apps/server/src/app/routes/service/threadPage.tsx` - 討論串頁面
- `apps/server/src/index.ts` - 路由和 API
- `apps/server/src/lib/db/queries.ts` - 資料庫查詢
- `apps/server/src/types/forum.ts` - 類型定義
- `packages/db/src/schema/forum.ts` - 資料庫 schema

### 資料庫變更
```sql
ALTER TABLE threads ADD COLUMN is_admin INTEGER DEFAULT 0;
ALTER TABLE replies ADD COLUMN is_admin INTEGER DEFAULT 0;
```

---

## 部署注意事項

遠端資料庫需要執行遷移：
```bash
wrangler d1 execute akraft-db --remote --command="ALTER TABLE threads ADD COLUMN is_admin INTEGER DEFAULT 0; ALTER TABLE replies ADD COLUMN is_admin INTEGER DEFAULT 0;"
```
