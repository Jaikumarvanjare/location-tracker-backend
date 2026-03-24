// Defines routes for location module
// Combines validation and swagger documentation

import { FastifyInstance } from 'fastify';

import {
  createLocationHandler,
  batchLocationHandler,
  listLocationsHandler,
} from './controller';

import {
  postLocationValidation,
  batchLocationValidation,
  listLocationsValidation,
} from './validation';

import {
  postLocationDocs,
  batchLocationDocs,
  listLocationsDocs,
} from './docs';

import { sessionParamsValidation } from '../sessions/validation';

export async function locationRoutes(fastify: FastifyInstance) {

  // Add single location point
  fastify.post('/sessions/:sessionId/locations', {
    schema: {
      ...sessionParamsValidation,
      ...postLocationValidation,
      ...postLocationDocs,
    },
  }, createLocationHandler);

  // Batch upload locations
  fastify.post('/sessions/:sessionId/locations/batch', {
    schema: {
      ...sessionParamsValidation,
      ...batchLocationValidation,
      ...batchLocationDocs,
    },
  }, batchLocationHandler);

  // Get locations with pagination and ordering
  fastify.get('/sessions/:sessionId/locations', {
    schema: {
      ...sessionParamsValidation,
      ...listLocationsValidation,
      ...listLocationsDocs,
    },
  }, listLocationsHandler);
}