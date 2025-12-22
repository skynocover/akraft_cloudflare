import { jsxRenderer } from 'hono/jsx-renderer';

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props?: { title?: string }): Response | Promise<Response>
  }
}

export default jsxRenderer(({ children, title }: { children?: unknown; title?: string }) => {
  return (
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Akraft Forum'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          .line-break { white-space: pre-wrap; word-break: break-word; }
        `}</style>
      </head>
      <body class="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
});
