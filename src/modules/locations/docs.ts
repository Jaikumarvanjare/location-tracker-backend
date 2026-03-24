import { LocationPointRef, ErrorRef, MetaRef } from '../../shared/schemas';

export const postLocationDocs = {
  tags: ['Locations'],
  response: {
    201: { type: 'object', properties: { data: LocationPointRef } },
    404: ErrorRef,
    409: ErrorRef,
  },
};

export const batchLocationDocs = {
  tags: ['Locations'],
  response: {
    207: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            accepted: { type: 'integer' },
            rejected: { type: 'integer' },
            errors: { type: 'array' },
          },
        },
      },
    },
  },
};

export const listLocationsDocs = {
  tags: ['Locations'],
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array', items: LocationPointRef },
        meta: MetaRef,
      },
    },
  },
};