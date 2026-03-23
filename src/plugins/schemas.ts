// src/plugins/schemas.ts
// Each schema has two jobs:
//   1. Fastify validation  — rejects bad requests before handler runs
//   2. Swagger docs        — tags, summary, description, response shapes

// ─── Reusable $ref targets (defined in app.ts components.schemas) ────────────

const SessionRef       = { $ref: 'Session#' };
const LocationPointRef = { $ref: 'LocationPoint#' };
const ErrorRef         = { $ref: 'Error#' };
const MetaRef          = { $ref: 'PaginationMeta#' };

// ─── Session route schemas ────────────────────────────────────────────────────

export const createSessionSchema = {
  tags:        ['Sessions'],
  summary:     'Create a new tracking session',
  description: 'Call this once when the user starts a tracking trip. Returns a session ID to attach to every location point.',
  body: {
    type: 'object',
    required: ['device_id'],
    properties: {
      device_id: {
        type: 'string',
        minLength: 1,
        description: 'Stable UUID generated once on the device and stored in local storage.',
        example: 'flutter-device-uuid-abc123',
      },
    },
    additionalProperties: false,
  },
  response: {
    201: {
      description: 'Session created successfully',
      type: 'object',
      properties: { data: SessionRef },
    },
    400: { description: 'Validation error', ...ErrorRef },
    500: { description: 'Internal error',   ...ErrorRef },
  },
};

export const listSessionsSchema = {
  tags:        ['Sessions'],
  summary:     'List all sessions',
  description: 'Returns sessions newest-first. Use device_id and status filters to narrow results.',
  querystring: {
    type: 'object',
    properties: {
      device_id: { type: 'string',  description: 'Filter by device ID' },
      status:    { type: 'string',  enum: ['active', 'ended'], description: 'Filter by status' },
      limit:     { type: 'integer', minimum: 1, maximum: 100, default: 20,  description: 'Page size (max 100)' },
      offset:    { type: 'integer', minimum: 0,               default: 0,   description: 'Pagination offset'   },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Paginated list of sessions',
      type: 'object',
      properties: {
        data: { type: 'array', items: SessionRef },
        meta: MetaRef,
      },
    },
  },
};

export const sessionParamsSchema = {
  params: {
    type: 'object',
    required: ['sessionId'],
    properties: {
      sessionId: { type: 'string', format: 'uuid', description: 'Session UUID' },
    },
  },
};

export const getSessionSchema = {
  ...sessionParamsSchema,
  tags:        ['Sessions'],
  summary:     'Get a single session by ID',
  response: {
    200: {
      description: 'Session found',
      type: 'object',
      properties: { data: SessionRef },
    },
    404: { description: 'Session not found', ...ErrorRef },
  },
};

export const patchSessionSchema = {
  ...sessionParamsSchema,
  tags:        ['Sessions'],
  summary:     'End an active session',
  description: 'Sets status to ended and stamps ended_at. This is the only valid status transition.',
  body: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['ended'],
        description: 'Only "ended" is accepted.',
        example: 'ended',
      },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Session ended successfully',
      type: 'object',
      properties: { data: SessionRef },
    },
    404: { description: 'Session not found',     ...ErrorRef },
    409: { description: 'Session already ended', ...ErrorRef },
  },
};

// ─── Location route schemas ───────────────────────────────────────────────────

// Shared field definitions used by both single and batch schemas
const locationFields = {
  latitude: {
    type: 'number', minimum: -90,  maximum: 90,
    description: 'Decimal degrees, -90 to 90',
    example: 28.6139,
  },
  longitude: {
    type: 'number', minimum: -180, maximum: 180,
    description: 'Decimal degrees, -180 to 180',
    example: 77.2090,
  },
  accuracy: {
    type: 'number', minimum: 0,
    description: 'Horizontal GPS accuracy in metres',
    example: 12.5,
  },
  altitude:    { type: ['number', 'null'], description: 'Metres above sea level',  example: 220.0 },
  speed:       { type: ['number', 'null'], description: 'Speed in m/s',             example: 1.4   },
  heading:     { type: ['number', 'null'], minimum: 0, maximum: 360, description: 'Bearing 0-360 degrees', example: 182.0 },
  recorded_at: {
    type: 'string', format: 'date-time',
    description: 'Device clock timestamp — used for ordering on the map',
    example: '2024-03-23T10:05:30.000Z',
  },
} as const;

export const postLocationSchema = {
  ...sessionParamsSchema,
  tags:        ['Locations'],
  summary:     'Post a single location point (real-time)',
  description: 'Use this while the device is online. One point per request, low-latency path.',
  body: {
    type: 'object',
    required: ['latitude', 'longitude', 'accuracy', 'recorded_at'],
    properties: locationFields,
    additionalProperties: false,
  },
  response: {
    201: {
      description: 'Location point saved',
      type: 'object',
      properties: { data: LocationPointRef },
    },
    404: { description: 'Session not found',     ...ErrorRef },
    409: { description: 'Session already ended', ...ErrorRef },
  },
};

export const batchLocationSchema = {
  ...sessionParamsSchema,
  tags:        ['Locations'],
  summary:     'Batch upload location points (offline sync)',
  description:
    'Flush the Flutter app local SQLite queue after regaining connectivity. ' +
    'Send up to 500 points per request. Duplicate points (session_id + recorded_at) are ' +
    'silently skipped so retrying is always safe. Returns 207 with per-point accepted/rejected counts.',
  body: {
    type: 'object',
    required: ['locations'],
    properties: {
      locations: {
        type: 'array',
        minItems: 1,
        maxItems: 500,
        description: '1 to 500 location objects',
        items: {
          type: 'object',
          required: ['latitude', 'longitude', 'accuracy', 'recorded_at'],
          properties: locationFields,
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  response: {
    207: {
      description: 'Batch processed. Check accepted and errors for per-point results.',
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            accepted: { type: 'integer', description: 'Points successfully saved', example: 48 },
            rejected: { type: 'integer', description: 'Points that failed',        example: 2  },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index:  { type: 'integer', description: 'Zero-based index in submitted array' },
                  reason: { type: 'string',  description: 'Why this point was rejected'         },
                },
              },
            },
          },
        },
      },
    },
    404: { description: 'Session not found', ...ErrorRef },
  },
};

export const listLocationsSchema = {
  ...sessionParamsSchema,
  tags:        ['Locations'],
  summary:     'Get all location points for a session',
  description: 'Points are always ordered by recorded_at ASC (chronological). Used by the Flutter map screen to render the path.',
  querystring: {
    type: 'object',
    properties: {
      from:   { type: 'string', format: 'date-time', description: 'Only points recorded after this time'  },
      to:     { type: 'string', format: 'date-time', description: 'Only points recorded before this time' },
      limit:  { type: 'integer', minimum: 1, maximum: 5000, default: 1000, description: 'Max points per response' },
      offset: { type: 'integer', minimum: 0,                default: 0,    description: 'Pagination offset'       },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Ordered list of location points',
      type: 'object',
      properties: {
        data: { type: 'array', items: LocationPointRef },
        meta: MetaRef,
      },
    },
    404: { description: 'Session not found', ...ErrorRef },
  },
};