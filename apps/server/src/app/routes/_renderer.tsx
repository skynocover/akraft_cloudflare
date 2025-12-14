import { jsxRenderer } from 'hono/jsx-renderer';

export default jsxRenderer(({ children, title }) => {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'HonoX App'}</title>
      </head>
      <body>{children}</body>
    </html>
  );
});
