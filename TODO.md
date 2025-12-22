# 遷移進度

## 已完成

### HonoX SSR 組件遷移
- [x] 設置 TailwindCSS (使用 CDN)
- [x] 建立 mock 資料 (services, threads, replies)
- [x] 建立 HonoX 版本的基礎 UI 組件 (Card, Button, Separator)
- [x] 建立 HonoX 版本的 layout 組件 (TopLink, Title, Pagination)
- [x] 建立 HonoX 版本的 thread 組件 (Thread, Post, PostCard)
- [x] 建立 Service 列表頁面 `/service/:serviceId`
- [x] 建立 Thread 詳情頁面 `/service/:serviceId/:threadId`
- [x] 註冊路由到 index.tsx

### shadcn/ui 樣式整合
- [x] 建立 cn() 工具函數 (clsx + tailwind-merge)
- [x] 新增依賴套件 (class-variance-authority, clsx, tailwind-merge)
- [x] 更新 Card 組件使用 shadcn 樣式
- [x] 更新 Button 組件使用 cva variants
- [x] 建立 Input 組件 (shadcn 樣式)
- [x] 建立 Textarea 組件 (shadcn 樣式)
- [x] 建立 Tabs 組件 (TabsList, TabsTrigger, TabsContent)
- [x] 建立 Checkbox 組件 (shadcn 樣式)
- [x] 建立 Label 組件 (shadcn 樣式)
- [x] 更新 Separator 組件使用 cn()
- [x] 更新 PostCard 使用新的 shadcn 組件
- [x] 更新 Thread 組件使用 buttonVariants

### 檔案結構
```
apps/server/src/
├── components/
│   ├── layout/
│   │   ├── TopLink.tsx
│   │   ├── Title.tsx
│   │   ├── Pagination.tsx
│   │   └── index.ts
│   ├── thread/
│   │   ├── Post.tsx
│   │   ├── PostCard.tsx
│   │   ├── Thread.tsx
│   │   └── index.ts
│   └── ui/
│       ├── Button.tsx     # shadcn style with cva variants
│       ├── Card.tsx       # shadcn style
│       ├── Checkbox.tsx   # shadcn style
│       ├── Input.tsx      # shadcn style
│       ├── Label.tsx      # shadcn style
│       ├── Separator.tsx  # shadcn style
│       ├── Tabs.tsx       # shadcn style (Tabs, TabsList, TabsTrigger, TabsContent)
│       ├── Textarea.tsx   # shadcn style
│       └── index.ts
├── lib/
│   ├── mock/
│   │   └── data.ts        # Mock 資料
│   ├── types.ts           # 類型定義
│   └── utils.ts           # cn() 工具函數, formatTime, getImageUrl
├── app/routes/
│   └── service/
│       ├── servicePage.tsx
│       └── threadPage.tsx
└── index.tsx              # 主入口，包含路由定義
```

## 待辦事項

### 資料庫整合
- [ ] 建立 Drizzle schema (`packages/db/src/schema/forum.ts`)
- [ ] 實作真實的資料庫查詢取代 mock 資料
- [ ] 建立 ORPC procedures

### 功能完善
- [ ] 實作發文功能 (POST handler)
- [ ] 實作回覆功能
- [ ] 實作舉報功能
- [ ] 實作使用者驗證整合

### 樣式優化
- [ ] 從 CDN 改為建構 TailwindCSS
- [ ] 完善 responsive design

### Admin Dashboard
- [ ] 建立 Admin 頁面 (使用 React SPA)
- [ ] 舉報管理功能
- [ ] 內容管理功能

## 測試

啟動開發伺服器：
```bash
cd apps/server
pnpm run dev
```

訪問：
- Service 頁面：http://localhost:8787/service/66a6eca2bfccee3f04a52bc4
- Thread 詳情：http://localhost:8787/service/66a6eca2bfccee3f04a52bc4/rec_d4utebsgmio87vvfiqig
