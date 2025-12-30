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

// Database queries
import {
  createDb,
  getService,
  getThreads,
  getThread,
  createThread,
  createReply,
  createReport,
  getThreadServiceId,
  generateId,
} from './lib/db/queries';

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

// Service page - display thread list
app.get('/service/:serviceId', async (c) => {
  const serviceId = c.req.param('serviceId');
  const page = parseInt(c.req.query('page') || '1', 10);
  const adminUrl = env.CORS_ORIGIN || '';

  const db = createDb(env.DB);
  const service = await getService(db, serviceId);
  const { threads, totalPages } = service
    ? await getThreads(db, serviceId, page, 10)
    : { threads: [], totalPages: 0 };

  const html = ServicePage({ serviceId, page, service, threads, totalPages, adminUrl });
  return c.html(html as string);
});

// Thread page - display thread details
app.get('/service/:serviceId/:threadId', async (c) => {
  const serviceId = c.req.param('serviceId');
  const threadId = c.req.param('threadId');
  const adminUrl = env.CORS_ORIGIN || '';

  const db = createDb(env.DB);
  const service = await getService(db, serviceId);
  const thread = await getThread(db, serviceId, threadId);

  const html = ThreadPage({ serviceId, service, thread, adminUrl });
  return c.html(html as string);
});

// API: Create new thread
app.post('/api/service/:serviceId/thread', async (c) => {
  const serviceId = c.req.param('serviceId');
  const formData = await c.req.formData();

  const title = formData.get('title') as string;
  const name = formData.get('name') as string || 'Anonymous';
  const content = formData.get('content') as string;
  const youtubeLink = formData.get('youtubeLink') as string;

  // Extract YouTube ID from URL
  let youtubeId: string | undefined;
  if (youtubeLink) {
    const match = youtubeLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    youtubeId = match ? match[1] : undefined;
  }

  // Get client IP
  const userIp = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

  // Generate user ID hash from IP
  const userId = generateId('user').slice(-8);

  const db = createDb(env.DB);

  // TODO: Handle image upload to R2
  const imageToken: string | undefined = undefined;

  try {
    await createThread(db, {
      serviceId,
      title,
      name,
      content,
      imageToken,
      youtubeId,
      userId,
      userIp,
    });

    // Redirect back to service page
    return c.redirect(`/service/${serviceId}`);
  } catch (error) {
    console.error('Error creating thread:', error);
    return c.text('Error creating thread', 500);
  }
});

// API: Create new reply
app.post('/api/service/:serviceId/reply', async (c) => {
  const serviceId = c.req.param('serviceId');
  const formData = await c.req.formData();

  const threadId = formData.get('threadId') as string;
  const name = formData.get('name') as string || 'Anonymous';
  const content = formData.get('content') as string;
  const youtubeLink = formData.get('youtubeLink') as string;
  const sage = formData.get('sage') === 'on';

  // Extract YouTube ID from URL
  let youtubeId: string | undefined;
  if (youtubeLink) {
    const match = youtubeLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    youtubeId = match ? match[1] : undefined;
  }

  // Get client IP
  const userIp = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

  // Generate user ID hash from IP
  const userId = generateId('user').slice(-8);

  const db = createDb(env.DB);

  // Verify thread belongs to service
  const threadServiceId = await getThreadServiceId(db, threadId);
  if (threadServiceId !== serviceId) {
    return c.text('Invalid thread', 400);
  }

  // TODO: Handle image upload to R2
  const imageToken: string | undefined = undefined;

  try {
    await createReply(db, {
      threadId,
      name,
      content,
      imageToken,
      youtubeId,
      sage,
      userId,
      userIp,
    });

    // Redirect back to thread page
    return c.redirect(`/service/${serviceId}/${threadId}`);
  } catch (error) {
    console.error('Error creating reply:', error);
    return c.text('Error creating reply', 500);
  }
});

// API: Create report
app.post('/api/service/:serviceId/report', async (c) => {
  const serviceId = c.req.param('serviceId');
  const formData = await c.req.formData();

  const threadId = formData.get('threadId') as string || undefined;
  const replyId = formData.get('replyId') as string || undefined;
  const content = formData.get('content') as string;
  const reportedIp = formData.get('reportedIp') as string || undefined;

  // Get client IP
  const userIp = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

  const db = createDb(env.DB);

  try {
    await createReport(db, {
      serviceId,
      threadId,
      replyId,
      content,
      userIp,
      reportedIp,
    });

    // Redirect back to previous page
    const referer = c.req.header('Referer') || `/service/${serviceId}`;
    return c.redirect(referer);
  } catch (error) {
    console.error('Error creating report:', error);
    return c.text('Error creating report', 500);
  }
});

export default app;
