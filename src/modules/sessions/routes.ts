// Defines routes for session module
// Combines validation and swagger documentation

import { FastifyInstance } from 'fastify';

import {
  createSessionHandler,
  listSessionsHandler,
  getSessionHandler,
  endSessionHandler,
} from './controller';

import {
  createSessionValidation,
  listSessionsValidation,
  sessionParamsValidation,
  patchSessionValidation,
} from './validation';

import {
  createSessionDocs,
  listSessionsDocs,
  getSessionDocs,
  patchSessionDocs,
} from './docs';

export async function sessionRoutes(fastify: FastifyInstance) {

  // Create session
  fastify.post('/sessions', {
    schema: {
      ...createSessionValidation,
      ...createSessionDocs,
    },
  }, createSessionHandler);

  // List sessions with pagination
  fastify.get('/sessions', {
    schema: {
      ...listSessionsValidation,
      ...listSessionsDocs,
    },
  }, listSessionsHandler);

  // Get single session
  fastify.get('/sessions/:sessionId', {
    schema: {
      ...sessionParamsValidation,
      ...getSessionDocs,
    },
  }, getSessionHandler);

  // End session
  fastify.patch('/sessions/:sessionId', {
    schema: {
      ...sessionParamsValidation,
      ...patchSessionValidation,
      ...patchSessionDocs,
    },
  }, endSessionHandler);
}