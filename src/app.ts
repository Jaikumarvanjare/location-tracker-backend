import Fastify, { FastifyInstance } from 'fastify';
import fastifyPostgres from '@fastify/postgres';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { sessionRoutes } from './modules/sessions/routes';
import { locationRoutes } from './modules/locations/routes';
import { validationError, internalError } from './utils/error';
import { env } from './config/env';
import { AppError } from './utils/AppError';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        strict: false, // allows "example" in schemas
      },
    },
  });

  // ───────── DATABASE ─────────
  await app.register(fastifyPostgres, {
    connectionString: env.DATABASE_URL,
  });

  // ───────── REGISTER SCHEMAS ─────────
  app.addSchema({
    $id: 'Session',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      device_id: { type: 'string' },
      status: { type: 'string', enum: ['active', 'ended'] },
      started_at: { type: ['string', 'null'], format: 'date-time' },
      ended_at: { type: ['string', 'null'], format: 'date-time' },
      created_at: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
  });

  app.addSchema({
    $id: 'LocationPoint',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      session_id: { type: 'string', format: 'uuid' },
      latitude: { type: 'number', minimum: -90, maximum: 90 },
      longitude: { type: 'number', minimum: -180, maximum: 180 },
      accuracy: { type: 'number', minimum: 0 },
      altitude: { type: ['number', 'null'] },
      speed: { type: ['number', 'null'] },
      heading: { type: ['number', 'null'], minimum: 0, maximum: 360 },
      recorded_at: { type: 'string', format: 'date-time' },
      created_at: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
  });

  app.addSchema({
    $id: 'PaginationMeta',
    type: 'object',
    properties: {
      total: { type: 'number' },
      limit: { type: 'number' },
      offset: { type: 'number' },
    },
    additionalProperties: false,
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
        required: ['code', 'message'],
        additionalProperties: false,
      },
    },
    required: ['error'],
    additionalProperties: false,
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
    uiConfig: {
      deepLinking: true,
    },
  });

  // ───────── ROUTES ─────────
  await app.register(sessionRoutes, { prefix: '/api/v1' });
  await app.register(locationRoutes, { prefix: '/api/v1' });

  // ───────── ERROR HANDLER ─────────
  app.setErrorHandler((error, _req, reply) => {

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.name,
          message: error.message,
        }
      });
    }

    if ((error as any).validation) {
      return reply.status(400).send(
        validationError(error.message)
      );
    }

    return reply.status(500).send(
      internalError(error.message)
    );
  });

  // ───────── HEALTH CHECK ─────────
  app.get('/health', async () => ({ status: 'ok' }));

  return app;
}