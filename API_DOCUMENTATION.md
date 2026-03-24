# Location Tracker API Documentation

Welcome to the Location Tracker API documentation. This API is built using Fastify and exposes endpoints to manage tracking sessions and location data.

## Base URL
All API v1 endpoints are prefixed with `/api/v1`

---

## Schemas

### Session
```json
{
  "id": "uuid",
  "device_id": "string",
  "status": "active | ended",
  "started_at": "date-time | null",
  "ended_at": "date-time | null",
  "created_at": "date-time"
}
```

### LocationPoint
```json
{
  "id": "uuid",
  "session_id": "uuid",
  "latitude": "number (Decimal degrees, -90 to 90)",
  "longitude": "number (Decimal degrees, -180 to 180)",
  "accuracy": "number (Horizontal GPS accuracy in metres)",
  "altitude": "number | null (Metres above sea level)",
  "speed": "number | null (Speed in m/s)",
  "heading": "number | null (Bearing 0-360 degrees)",
  "recorded_at": "date-time",
  "created_at": "date-time"
}
```

### PaginationMeta
```json
{
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

### Error
```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

---

## Sessions

### Create a new tracking session
**POST** `/api/v1/sessions`

Call this once when the user starts a tracking trip. Returns a session ID to attach to every location point.

**Request Body**
```json
{
  "device_id": "flutter-device-uuid-abc123" // Stable UUID
}
```

**Responses**
- `201 Created`: Session created successfully. Returns `{ data: Session }`.
- `400 Bad Request`: Validation error.
- `500 Internal Server Error`: Internal error.

---

### List all sessions
**GET** `/api/v1/sessions`

Returns sessions newest-first. Use device_id and status filters to narrow results.

**Query Parameters**
- `device_id` (string): Filter by device ID
- `status` (string, enum: `active`, `ended`): Filter by status
- `limit` (interger, default: 20, max: 100): Page size
- `offset` (integer, default: 0): Pagination offset

**Responses**
- `200 OK`: Paginated list of sessions. Returns `{ data: [Session], meta: PaginationMeta }`.

---

### Get a single session by ID
**GET** `/api/v1/sessions/:sessionId`

**Path Parameters**
- `sessionId` (uuid): Session UUID

**Responses**
- `200 OK`: Session found. Returns `{ data: Session }`.
- `404 Not Found`: Session not found.

---

### End an active session
**PATCH** `/api/v1/sessions/:sessionId`

Sets status to ended and stamps ended_at. This is the only valid status transition.

**Path Parameters**
- `sessionId` (uuid): Session UUID

**Request Body**
```json
{
  "status": "ended"
}
```

**Responses**
- `200 OK`: Session ended successfully. Returns `{ data: Session }`.
- `404 Not Found`: Session not found.
- `409 Conflict`: Session already ended.

---

## Locations

### Post a single location point (real-time)
**POST** `/api/v1/sessions/:sessionId/locations`

Use this while the device is online. One point per request, low-latency path.

**Path Parameters**
- `sessionId` (uuid): Session UUID

**Request Body**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 12.5,
  "recorded_at": "2024-03-23T10:05:30.000Z"
}
```
*Optional fields:* `altitude`, `speed`, `heading`

**Responses**
- `201 Created`: Location point saved. Returns `{ data: LocationPoint }`.
- `404 Not Found`: Session not found.
- `409 Conflict`: Session already ended.

---

### Batch upload location points (offline sync)
**POST** `/api/v1/sessions/:sessionId/locations/batch`

Flush the Flutter app local SQLite queue after regaining connectivity. Send up to 500 points per request. Duplicate points (session_id + recorded_at) are silently skipped so retrying is always safe.

**Path Parameters**
- `sessionId` (uuid): Session UUID

**Request Body**
```json
{
  "locations": [
    {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "accuracy": 12.5,
      "recorded_at": "2024-03-23T10:05:30.000Z"
    }
  ]
}
```

**Responses**
- `207 Multi-Status`: Batch processed. 
  ```json
  {
    "data": {
      "accepted": 48,
      "rejected": 2,
      "errors": [
        {
          "index": 1,
          "reason": "duplicate key value violates unique constraint"
        }
      ]
    }
  }
  ```
- `404 Not Found`: Session not found.

---

### Get all location points for a session
**GET** `/api/v1/sessions/:sessionId/locations`

Points are always ordered by recorded_at ASC (chronological). Used by the Flutter map screen to render the path.

**Path Parameters**
- `sessionId` (uuid): Session UUID

**Query Parameters**
- `from` (string, date-time): Only points recorded after this time
- `to` (string, date-time): Only points recorded before this time
- `limit` (integer, default: 1000, max: 5000): Max points per response
- `offset` (integer, default: 0): Pagination offset

**Responses**
- `200 OK`: Ordered list of location points. Returns `{ data: [LocationPoint] }`. (Pagination meta not included in query logic but defined in schema, falling back to basic array structure)
- `404 Not Found`: Session not found.
