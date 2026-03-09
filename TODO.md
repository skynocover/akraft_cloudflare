# Cloudflare Turnstile 真人驗證 - 已完成

## 已完成項目

### Phase 1：後端驗證 ✅
1. ✅ `env.d.ts` — 新增 `CLOUDFLARE_TURNSTILE_KEY` 和 `CLOUDFLARE_TURNSTILE_SECRET`
2. ✅ `lib/safety/turnstile.ts` — 建立 Turnstile token 驗證工具
3. ✅ `index.ts` — 在 thread/reply POST handler 加入 Turnstile 驗證

### Phase 2：前端 Widget ✅
4. ✅ `Layout.tsx` — 加入 Turnstile script（explicit render 模式）+ 全域 helper
5. ✅ `PostCard.tsx` — 加入 Turnstile widget 容器，表單送出前驗證
6. ✅ `ReplyButton.tsx` — Modal 開啟時呼叫 renderTurnstileWidget()

### Phase 3：頁面串接 ✅
7. ✅ `servicePage.tsx` — 傳遞 turnstileSiteKey 給 Layout
8. ✅ `threadPage.tsx` — 傳遞 turnstileSiteKey 給 Layout
9. ✅ `index.ts` — 從 env 傳遞 key 給頁面元件

---

## 設計決策

- **使用 global variable** (`window.__TURNSTILE_SITE_KEY`) 避免 prop drilling
- **Explicit render mode** — modal 內的 widget 需要在開啟時才渲染
- **Optional** — 未設定 key 時跳過驗證，向下相容

## 修改的檔案

- `apps/server/env.d.ts` — 新增環境變數類型
- `apps/server/src/lib/safety/turnstile.ts` — 新檔案，Turnstile 驗證工具
- `apps/server/src/components/Layout.tsx` — Turnstile script + 全域 helper
- `apps/server/src/components/thread/PostCard.tsx` — Turnstile widget + 前端驗證
- `apps/server/src/components/thread/ReplyButton.tsx` — Modal 開啟時渲染 widget
- `apps/server/src/app/routes/service/servicePage.tsx` — 傳遞 turnstileSiteKey
- `apps/server/src/app/routes/service/threadPage.tsx` — 傳遞 turnstileSiteKey
- `apps/server/src/index.ts` — 傳遞 key + 後端 Turnstile 驗證

## 環境變數

```bash
CLOUDFLARE_TURNSTILE_KEY=your-site-key
CLOUDFLARE_TURNSTILE_SECRET=your-secret-key
```

## 部署注意事項

- 在 Cloudflare Workers 設定中加入 `CLOUDFLARE_TURNSTILE_KEY` 和 `CLOUDFLARE_TURNSTILE_SECRET`
- Turnstile 是 optional 的 — 未設定 key 時不影響現有功能
