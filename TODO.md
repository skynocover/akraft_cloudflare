# 修改 - 已完成

## 圖片儲存遷移 (Cloudflare Images → R2)

### 實作方式

不需要新增資料庫欄位，透過 `imageToken` 格式判斷：

- **舊格式（Cloudflare Images）**：不以 `img_` 開頭
  - URL: `{CLOUDFLARE_IMAGES_URL}/{imageToken}/public`

- **新格式（R2）**：以 `img_` 開頭
  - 本地測試: `/api/images/{imageToken}`
  - 正式環境: `{R2_PUBLIC_URL}/images/{imageToken}`

### 環境變數

```typescript
// env.d.ts
R2_PUBLIC_URL?: string;           // 例如 https://pub-xxx.r2.dev
CLOUDFLARE_IMAGES_URL?: string;   // 例如 https://imagedelivery.net/xxx
```

**正式環境設定範例：**
```bash
R2_PUBLIC_URL=https://pub-xxx.r2.dev
CLOUDFLARE_IMAGES_URL=https://imagedelivery.net/BFt8NicDCgLDzBn7OOPidw
```

### 修改的檔案

1. `apps/server/env.d.ts` - 新增 R2_PUBLIC_URL、CLOUDFLARE_IMAGES_URL 環境變數
2. `apps/server/src/lib/db/queries.ts` - 修改 getImageUrl 邏輯，使用 ImageUrlOptions
3. `apps/server/src/index.ts` - 傳遞 imageUrlOptions 給 query 函數
