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

app.route('/api/hello', helloApi);

app.get('/', (c) => {
  return c.html(Home());
});

// Service 頁面 - 顯示討論串列表
app.get('/service/:serviceId', (c) => {
  const serviceId = c.req.param('serviceId');
  const page = parseInt(c.req.query('page') || '1', 10);
  const html = ServicePage({ serviceId, page });
  return c.html(html as string);
});

// Thread 頁面 - 顯示討論串詳情
app.get('/service/:serviceId/:threadId', (c) => {
  const serviceId = c.req.param('serviceId');
  const threadId = c.req.param('threadId');
  const html = ThreadPage({ serviceId, threadId });
  return c.html(html as string);
});

export default app;
