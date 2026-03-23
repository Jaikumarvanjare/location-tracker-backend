import Fastify, { FastifyInstance } from 'fastify';
import fastifyPostgres from '@fastify/postgres';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { sessionRoutes } from './routes/sessions';
import { locationRoutes } from './routes/locations';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        strict: false, // ✅ allows "example"
      },
    },
  });

  // ───────── DB ─────────
  await app.register(fastifyPostgres, {
    connectionString: process.env.DATABASE_URL,
  });

  // ───────── REGISTER SCHEMAS (IMPORTANT) ─────────
  app.addSchema({
    $id: 'Session',
    type: 'object',
    properties: {
      id: { type: 'string' },
      device_id: { type: 'string' },
      status: { type: 'string', enum: ['active', 'ended'] },
      started_at: { type: 'string' },
      ended_at: { type: ['string', 'null'] },
      created_at: { type: 'string' },
    },
  });

  app.addSchema({
    $id: 'LocationPoint',
    type: 'object',
    properties: {
      id: { type: 'string' },
      session_id: { type: 'string' },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      accuracy: { type: 'number' },
      altitude: { type: ['number', 'null'] },
      speed: { type: ['number', 'null'] },
      heading: { type: ['number', 'null'] },
      recorded_at: { type: 'string' },
      created_at: { type: 'string' },
    },
  });

  app.addSchema({
    $id: 'PaginationMeta',
    type: 'object',
    properties: {
      total: { type: 'number' },
      limit: { type: 'number' },
      offset: { type: 'number' },
    },
  });

  app.addSchema({
    $id: 'Error',
    type: 'object',
    properties: {
      error: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  });

  // ───────── SWAGGER ─────────
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Location Tracker API',
        version: '1.0.0',
      },
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  // ───────── ROUTES ─────────
  await app.register(sessionRoutes, { prefix: '/api/v1' });
  await app.register(locationRoutes, { prefix: '/api/v1' });

  // ───────── ERROR HANDLER ─────────
  app.setErrorHandler((error, _req, reply) => {
    if ((error as any).validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
      },
    });
  });

  // ───────── HEALTH ─────────
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}