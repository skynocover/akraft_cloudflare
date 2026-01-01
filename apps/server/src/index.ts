import { env } from 'cloudflare:workers';
import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { RPCHandler } from '@orpc/server/fetch';
import { onError } from '@orpc/server';
import { createContext } from '@akraft-cloudflare/api/context';
import { appRouter } from '@akraft-cloudflare/api/routers/index';
import { createAuth } from '@akraft-cloudflare/auth';
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
  generateUserIdFromIp,
  getHomePageData,
} from './lib/db/queries';

// R2 upload helper
import { uploadImage } from './lib/r2/upload';

// Safety & Moderation
import { checkModeration } from './lib/safety/moderation';
import { isContentSafetyEnabled, checkContentSafety } from './lib/safety/content-safety';

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

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  const auth = createAuth(env);
  return auth.handler(c.req.raw);
});

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
import { HomePage } from './app/routes/homePage';
import { ServicePage } from './app/routes/service/servicePage';
import { ThreadPage } from './app/routes/service/threadPage';

app.route('/api/hello', helloApi);

// Home page - display all visible organizations with their latest threads
app.get('/', async (c) => {
  const dashboardUrl = env.CORS_ORIGIN || '';
  const db = createDb(env.DB);
  const imageUrlOptions = {
    r2PublicUrl: env.R2_PUBLIC_URL,
    cloudflareImagesUrl: env.CLOUDFLARE_IMAGES_URL,
  };

  const organizations = await getHomePageData(db, 5, imageUrlOptions);

  const html = HomePage({ organizations, dashboardUrl });
  return c.html(html as string);
});

// Service page - display thread list
app.get('/service/:serviceId', async (c) => {
  const serviceId = c.req.param('serviceId');
  const page = parseInt(c.req.query('page') || '1', 10);
  const adminUrl = env.CORS_ORIGIN || '';

  const db = createDb(env.DB);
  const service = await getService(db, serviceId);
  const imageUrlOptions = {
    r2PublicUrl: env.R2_PUBLIC_URL,
    cloudflareImagesUrl: env.CLOUDFLARE_IMAGES_URL,
  };
  const { threads, totalPages } = service
    ? await getThreads(db, serviceId, page, 10, imageUrlOptions)
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
  const imageUrlOptions = {
    r2PublicUrl: env.R2_PUBLIC_URL,
    cloudflareImagesUrl: env.CLOUDFLARE_IMAGES_URL,
  };
  const thread = await getThread(db, serviceId, threadId, imageUrlOptions);

  const html = ThreadPage({ serviceId, service, thread, adminUrl });
  return c.html(html as string);
});

// API: Serve images from R2
app.get('/api/images/:imageToken', async (c) => {
  const imageToken = c.req.param('imageToken');
  const key = `images/${imageToken}`;

  try {
    const object = await env.R2.get(key);
    if (!object) {
      return c.text('Image not found', 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error serving image:', error);
    return c.text('Error serving image', 500);
  }
});

// API: Create new thread
app.post('/api/service/:serviceId/thread', async (c) => {
  const serviceId = c.req.param('serviceId');
  const formData = await c.req.formData();

  const title = formData.get('title') as string;
  const name = formData.get('name') as string || 'Anonymous';
  const content = formData.get('content') as string || '';
  const youtubeLink = formData.get('youtubeLink') as string;
  const imageFile = formData.get('image') as File | null;

  // Validate: need either content or image
  const hasImage = imageFile && imageFile.size > 0;
  if (!content.trim() && !hasImage) {
    return c.text('Please enter content or upload an image', 400);
  }

  // Extract YouTube ID from URL
  let youtubeId: string | undefined;
  if (youtubeLink) {
    const match = youtubeLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    youtubeId = match ? match[1] : undefined;
  }

  // Get client IP
  const userIp = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

  // Generate user ID hash from IP + date (same IP on same day = same ID)
  const userId = await generateUserIdFromIp(userIp);

  const db = createDb(env.DB);

  // Get service for moderation settings
  const service = await getService(db, serviceId);
  if (!service) {
    return c.text('Service not found', 404);
  }

  // Check moderation (IP blocking, forbidden words, rate limiting)
  const moderationResult = checkModeration(service, userIp, content, title);
  if (!moderationResult.allowed) {
    return c.text(moderationResult.reason || 'Content not allowed', 403);
  }

  // Check content safety (Azure Content Safety API)
  let imageData: ArrayBuffer | undefined;
  if (imageFile && imageFile.size > 0) {
    imageData = await imageFile.arrayBuffer();
  }

  if (isContentSafetyEnabled(env.CONTENT_SAFETY_ENDPOINT, env.CONTENT_SAFETY_API_KEY)) {
    const safetyResult = await checkContentSafety(
      env.CONTENT_SAFETY_ENDPOINT!,
      env.CONTENT_SAFETY_API_KEY!,
      { text: `${title} ${content}`, imageData }
    );

    if (!safetyResult.safe) {
      console.log('Content blocked by safety check:', safetyResult.blockedCategories);
      return c.text(`Content blocked: ${safetyResult.blockedCategories.join(', ')}`, 403);
    }
  }

  // Handle image upload to R2
  let imageToken: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(env.R2, imageFile);
    if (uploadResult.success) {
      imageToken = uploadResult.imageToken;
    } else {
      console.error('Image upload failed:', uploadResult.error);
      // Continue without image - don't fail the whole request
    }
  }

  try {
    await createThread(db, {
      organizationId: serviceId,
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
  const content = formData.get('content') as string || '';
  const youtubeLink = formData.get('youtubeLink') as string;
  const sage = formData.get('sage') === 'on';
  const imageFile = formData.get('image') as File | null;

  // Validate: need either content or image
  const hasImage = imageFile && imageFile.size > 0;
  if (!content.trim() && !hasImage) {
    return c.text('Please enter content or upload an image', 400);
  }

  // Extract YouTube ID from URL
  let youtubeId: string | undefined;
  if (youtubeLink) {
    const match = youtubeLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    youtubeId = match ? match[1] : undefined;
  }

  // Get client IP
  const userIp = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';

  // Generate user ID hash from IP + date (same IP on same day = same ID)
  const userId = await generateUserIdFromIp(userIp);

  const db = createDb(env.DB);

  // Verify thread belongs to service
  const threadServiceId = await getThreadServiceId(db, threadId);
  if (threadServiceId !== serviceId) {
    return c.text('Invalid thread', 400);
  }

  // Get service for moderation settings
  const service = await getService(db, serviceId);
  if (!service) {
    return c.text('Service not found', 404);
  }

  // Check moderation (IP blocking, forbidden words, rate limiting)
  const moderationResult = checkModeration(service, userIp, content);
  if (!moderationResult.allowed) {
    return c.text(moderationResult.reason || 'Content not allowed', 403);
  }

  // Check content safety (Azure Content Safety API)
  let imageData: ArrayBuffer | undefined;
  if (imageFile && imageFile.size > 0) {
    imageData = await imageFile.arrayBuffer();
  }

  if (isContentSafetyEnabled(env.CONTENT_SAFETY_ENDPOINT, env.CONTENT_SAFETY_API_KEY)) {
    const safetyResult = await checkContentSafety(
      env.CONTENT_SAFETY_ENDPOINT!,
      env.CONTENT_SAFETY_API_KEY!,
      { text: content, imageData }
    );

    if (!safetyResult.safe) {
      console.log('Content blocked by safety check:', safetyResult.blockedCategories);
      return c.text(`Content blocked: ${safetyResult.blockedCategories.join(', ')}`, 403);
    }
  }

  // Handle image upload to R2
  let imageToken: string | undefined = undefined;
  if (imageFile && imageFile.size > 0) {
    const uploadResult = await uploadImage(env.R2, imageFile);
    if (uploadResult.success) {
      imageToken = uploadResult.imageToken;
    } else {
      console.error('Image upload failed:', uploadResult.error);
      // Continue without image - don't fail the whole request
    }
  }

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
      organizationId: serviceId,
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
