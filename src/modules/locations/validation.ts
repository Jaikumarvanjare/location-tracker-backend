export const locationFields = {
  latitude: { type: 'number', minimum: -90, maximum: 90 },
  longitude: { type: 'number', minimum: -180, maximum: 180 },
  accuracy: { type: 'number', minimum: 0 },
  recorded_at: { type: 'string', format: 'date-time' },
};

export const postLocationValidation = {
  body: {
    type: 'object',
    required: ['latitude', 'longitude', 'accuracy', 'recorded_at'],
    properties: locationFields,
  },
};

export const batchLocationValidation = {
  body: {
    type: 'object',
    required: ['locations'],
    properties: {
      locations: {
        type: 'array',
        items: {
          type: 'object',
          required: ['latitude', 'longitude', 'accuracy', 'recorded_at'],
          properties: locationFields,
        },
      },
    },
  },
};

export const listLocationsValidation = {
  querystring: {
    type: 'object',
    properties: {
      limit: { type: 'integer', default: 1000 },
      offset: { type: 'integer', default: 0 },
      sort_by: { type: 'string', enum: ['recorded_at', 'created_at'], default: 'recorded_at' },
      sort_dir: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
    },
  },
};