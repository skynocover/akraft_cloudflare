# 修改

## 1 ✅

~~修改~~
~~http://localhost:8787/service/rec_cqvkdi9bsa448tm365f0/thread_mjsl3ce8ks95dge6~~
~~這個頁面應該要將所有的reply撈出來~~
~~現在似乎沒有全撈~~

**已完成**: Thread.tsx 修改邏輯
- `isPreview=true` (service 頁面): 顯示最後 5 個 reply + 展開按鈕
- `isPreview=false` (thread 詳情頁): 顯示全部 replies

## 2 ✅

~~發文或回應時~~
~~看是否可以讓markdown即時顯示~~
~~例如~~
~~# adfs~~
~~立刻變成大的字體~~
~~如果不行~~
~~那就在content的右上角顯示一個眼睛的預覽圖示~~
~~點擊可以切換成顯示成markdown重畫的畫面~~

**已完成**: PostCard.tsx 新增預覽切換功能
- 右上角眼睛圖示 👁
- 點擊切換編輯模式 / 預覽模式
- 預覽模式顯示 Markdown 渲染結果

注意這裡說的預覽切換實際上並沒有真的預覽切換 
修正這個問題

## 3 ✅

~~詳細跟我解釋現在使用honoX 使用發文時的流程~~
~~為什麼是302~~
~~由於是SSR 因此不是使用api~~
~~是使用form嗎 還是什麼原理~~

**已解釋**: HonoX 使用傳統 HTML Form 提交
1. 表單 POST 到 `/api/service/:serviceId/thread`
2. 伺服器處理後回傳 302 Redirect
3. 瀏覽器自動跟隨重定向
4. 這是 Post/Redirect/Get (PRG) 模式，防止重複提交

## 4 ✅

~~dashboard中 設定的版面描述~~
~~在討論版頁面中 也要顯示成markdown的樣子~~
~~例如粗體等~~

**已完成**:
- 新增 `markdownToHtml()` 函數在 `lib/utils.ts`
- PostCard.tsx 的 description 使用 `dangerouslySetInnerHTML` 渲染 Markdown
- 支援: # 標題、- 列表、**粗體**、*斜體*
