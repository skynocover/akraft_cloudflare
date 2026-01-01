# TODO

重做後端根目錄的部分
我希望進去之後是一個可以展示所有organization的版面
有點類似reddit或是4chan
畫面上會展示現有的所有版面 以及最新的討論串 並顯示這些討論串的附圖或是youtube
如果都沒有則顯示討論串文字

header的部分可以跟前端也就是dashboard共用
左上角首頁 右上角則是github及登入按鈕
後端的討論版右上角按鈕按下後 會跳轉到前端的首頁

右上角的github連結改為
https://github.com/skynocover/akraft_cloudflare

管理頁面則增加switch看是否要顯示在首頁

---

## 詳細規劃

### 第一階段：資料庫變更

#### 1.1 新增 `showOnHome` 欄位到 organization 表
- **檔案**: `packages/db/src/schema/auth.ts`
- **變更**: 在 `organization` 表新增 `showOnHome` 欄位（boolean，預設 false）
- **執行**: `pnpm db:push` 套用變更

```typescript
// 新增欄位
showOnHome: integer("show_on_home", { mode: "boolean" })
  .default(false)
  .notNull(),
```

---

### 第二階段：後端 SSR 首頁重構

#### 2.1 建立首頁查詢函數
- **檔案**: `apps/server/src/lib/db/queries.ts`
- **新增函數**:
  - `getAllVisibleOrganizations()` - 取得所有 showOnHome=true 的 organization
  - `getLatestThreadsByOrganization(orgId, limit)` - 取得該 organization 最新的討論串

#### 2.2 建立首頁元件
- **檔案**: `apps/server/src/app/routes/index.tsx`
- **重構**: 將現有的歡迎頁改為 organization 列表頁面
- **版面設計**（類似 Reddit/4chan）:
  ```
  ┌─────────────────────────────────────────────────────────┐
  │ Header（共用元件）                                        │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  ┌─────────────────┐  ┌─────────────────┐              │
  │  │ Organization 1  │  │ Organization 2  │              │
  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │              │
  │  │ │ 最新討論串1  │ │  │ │ 最新討論串1  │ │              │
  │  │ │ (圖片/YT)   │ │  │ │ (圖片/YT)   │ │              │
  │  │ └─────────────┘ │  │ └─────────────┘ │              │
  │  │ ┌─────────────┐ │  │ ┌─────────────┐ │              │
  │  │ │ 最新討論串2  │ │  │ │ 最新討論串2  │ │              │
  │  │ │ (文字預覽)  │ │  │ │ (文字預覽)  │ │              │
  │  │ └─────────────┘ │  │ └─────────────┘ │              │
  │  └─────────────────┘  └─────────────────┘              │
  │                                                         │
  └─────────────────────────────────────────────────────────┘
  ```

#### 2.3 建立 OrganizationCard 元件
- **檔案**: `apps/server/src/components/home/OrganizationCard.tsx`
- **功能**:
  - 顯示 organization 名稱和 logo
  - 顯示最新 3-5 個討論串預覽
  - 點擊跳轉到 `/service/:organizationId`

#### 2.4 建立 ThreadPreview 元件
- **檔案**: `apps/server/src/components/home/ThreadPreview.tsx`
- **功能**:
  - 優先顯示圖片縮圖（若有 imageToken）
  - 其次顯示 YouTube 預覽（若有 youtubeId）
  - 否則顯示文字預覽（截取前 100 字元）
  - 顯示標題、回覆數量、最後回覆時間

---

### 第三階段：共用 Header 元件

#### 3.1 建立後端 Header 元件
- **檔案**: `apps/server/src/components/layout/Header.tsx`
- **注意**: HonoX 是 SSR，不能使用 React hooks
- **功能**:
  - 左上角：Logo "Akraft"（連結到 `/`）
  - 右上角：GitHub 按鈕 + 登入/管理按鈕
- **登入按鈕行為**:
  - 點擊後跳轉到前端 Dashboard（`CORS_ORIGIN` 環境變數）

```tsx
// HonoX Header 結構（無 React hooks）
<header class="flex items-center justify-between py-4 px-4 border-b">
  <a href="/" class="text-2xl font-bold">Akraft</a>
  <nav class="flex items-center space-x-2">
    <a href="https://github.com/skynocover/akraft_cloudflare"
       target="_blank" class="...">
      <GithubIcon />
    </a>
    <a href={dashboardUrl} class="...">管理</a>
  </nav>
</header>
```

#### 3.2 更新前端 Header 的 GitHub 連結
- **檔案**: `apps/web/src/components/header.tsx`
- **變更**: 將 GitHub 連結改為 `https://github.com/skynocover/akraft_cloudflare`

---

### 第四階段：管理頁面新增「顯示在首頁」開關

#### 4.1 更新 ORPC API
- **檔案**: `packages/api/routers/admin.ts`（或 index.ts）
- **變更**: `updateService` procedure 新增 `showOnHome` 參數

#### 4.2 更新 ServiceEditor 元件
- **檔案**: `apps/web/src/components/service/ServiceEditor.tsx`
- **新增**: Switch 元件控制「是否顯示在首頁」
- **UI 位置**: 放在 Service 設定的最上方或最顯眼位置

```tsx
<div class="flex items-center justify-between">
  <div>
    <Label>顯示在首頁</Label>
    <p class="text-sm text-muted-foreground">
      開啟後此版面會顯示在網站首頁
    </p>
  </div>
  <Switch checked={showOnHome} onCheckedChange={...} />
</div>
```

---

### 第五階段：路由整合

#### 5.1 更新 server index.ts
- **檔案**: `apps/server/src/index.ts`
- **變更**:
  - 更新首頁路由 `GET /` 使用新的首頁元件
  - 確保 Layout 包含共用 Header

#### 5.2 確保環境變數正確傳遞
- 後端需要 `CORS_ORIGIN` 來產生 Dashboard 連結
- 首頁 Header 的「管理」按鈕連結到 `{CORS_ORIGIN}/dashboard`

---

## 檔案變更清單

| 階段 | 檔案路徑 | 操作 |
|------|----------|------|
| 1 | `packages/db/src/schema/auth.ts` | 修改 |
| 2 | `apps/server/src/lib/db/queries.ts` | 修改 |
| 2 | `apps/server/src/app/routes/index.tsx` | 重構 |
| 2 | `apps/server/src/components/home/OrganizationCard.tsx` | 新增 |
| 2 | `apps/server/src/components/home/ThreadPreview.tsx` | 新增 |
| 3 | `apps/server/src/components/layout/Header.tsx` | 新增 |
| 3 | `apps/web/src/components/header.tsx` | 修改 |
| 4 | `packages/api/routers/admin.ts` | 修改 |
| 4 | `apps/web/src/components/service/ServiceEditor.tsx` | 修改 |
| 5 | `apps/server/src/index.ts` | 修改 |

---

## 執行順序

1. [ ] **階段 1**: 資料庫變更 + db:push
2. [ ] **階段 3.2**: 更新前端 GitHub 連結（簡單，先做）
3. [ ] **階段 4**: 管理頁面新增開關（需要先有 API）
4. [ ] **階段 2**: 後端首頁重構
5. [ ] **階段 3.1**: 後端 Header 元件
6. [ ] **階段 5**: 路由整合與測試

---

## 注意事項

### HonoX SSR 限制
- 不能使用 React hooks（useState, useEffect 等）
- 事件處理必須用 inline JavaScript 字串
- 使用 HTML 原生屬性名（class, onclick）

### 共用元件的差異
前端（React）和後端（HonoX）的 Header 雖然視覺上相似，但實作不同：
- 前端：使用 `authClient.useSession()` 取得登入狀態
- 後端：不檢查登入狀態，只提供連結跳轉到 Dashboard

### 圖片顯示
- 圖片使用 `/api/images/:imageToken` 路徑
- YouTube 預覽使用 `https://img.youtube.com/vi/{youtubeId}/mqdefault.jpg`

### 響應式設計
- 使用 Tailwind CSS grid 或 flexbox
- 手機：1 欄
- 平板：2 欄
- 桌面：3-4 欄
