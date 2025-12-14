import { NotFoundHandler } from 'honox/types';

const handler: NotFoundHandler = (c) => {
  return c.render(
    <html>
      <head>
        <meta charset="utf-8" />
        <title>404 Not Found</title>
      </head>
      <body>
        <h1>404 Not Found</h1>
        <p>The page you are looking for does not exist.</p>
      </body>
    </html>,
    404
  );
};

export default handler;
