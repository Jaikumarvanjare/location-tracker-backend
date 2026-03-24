export const createSessionValidation = {
  body: {
    type: 'object',
    required: ['device_id'],
    properties: {
      device_id: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

export const listSessionsValidation = {
  querystring: {
    type: 'object',
    properties: {
      device_id: { type: 'string' },
      status: { type: 'string', enum: ['active', 'ended'] },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      offset: { type: 'integer', minimum: 0, default: 0 },
      sort_by: { type: 'string', enum: ['created_at', 'started_at', 'ended_at'], default: 'created_at' },
      sort_dir: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
    },
  },
};

export const sessionParamsValidation = {
  params: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', format: 'uuid' },
    },
  },
};

export const patchSessionValidation = {
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['ended'] },
    },
  },
};