import { env } from 'cloudflare:workers';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { createContext } from '@akraft-cloudflare/api/context';
import { appRouter } from '@akraft-cloudflare/api/routers/index';
import { auth } from '@akraft-cloudflare/auth';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use(logger());
app.use(
  '/*',
  cors({
    origin: env.CORS_ORIGIN || '',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use('/*', async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: '/rpc',
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: '/api-reference',
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

// Import HonoX routes
import helloApi from './app/routes/api/hello';
import Home from './app/routes/index';
import { ServicePage } from './app/routes/service/servicePage';
import { ThreadPage } from './app/routes/service/threadPage';
import { getService, getThreads, getThread } from './lib/mock/data';

app.route('/api/hello', helloApi);

app.get('/', (c) => {
  return c.html(Home());
});

// Service page - list threads for a service
app.get('/service/:serviceId', (c) => {
  const serviceId = c.req.param('serviceId');
  const pageParam = c.req.query('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const pageSize = 10;

  const service = getService(serviceId);
  if (!service) {
    return c.notFound();
  }

  const { threads, totalPages } = getThreads(serviceId, currentPage, pageSize);

  return c.html(
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{service.name} - Akraft Forum</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          .line-break { white-space: pre-wrap; word-break: break-word; }
        `}</style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <ServicePage
          service={service}
          threads={threads}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </body>
    </html>
  );
});

// Thread detail page
app.get('/service/:serviceId/:threadId', (c) => {
  const serviceId = c.req.param('serviceId');
  const threadId = c.req.param('threadId');

  const service = getService(serviceId);
  if (!service) {
    return c.notFound();
  }

  const thread = getThread(serviceId, threadId);
  if (!thread) {
    return c.notFound();
  }

  return c.html(
    <html lang="zh-TW">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{thread.title} - {service.name} - Akraft Forum</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          .line-break { white-space: pre-wrap; word-break: break-word; }
        `}</style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <ThreadPage service={service} thread={thread} />
      </body>
    </html>
  );
});

export default app;
