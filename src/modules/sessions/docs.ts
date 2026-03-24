import { SessionRef, ErrorRef, MetaRef } from '../../shared/schemas';

export const createSessionDocs = {
  tags: ['Sessions'],
  summary: 'Create session',
  response: {
    201: { type: 'object', properties: { data: SessionRef } },
    400: ErrorRef,
    500: ErrorRef,
  },
};

export const listSessionsDocs = {
  tags: ['Sessions'],
  summary: 'List sessions',
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array', items: SessionRef },
        meta: MetaRef,
      },
    },
  },
};

export const getSessionDocs = {
  tags: ['Sessions'],
  response: {
    200: { type: 'object', properties: { data: SessionRef } },
    404: ErrorRef,
  },
};

export const patchSessionDocs = {
  tags: ['Sessions'],
  response: {
    200: { type: 'object', properties: { data: SessionRef } },
    404: ErrorRef,
    409: ErrorRef,
  },
};