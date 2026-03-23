export interface Session {
  id: string;
  device_id: string;
  status: 'active' | 'ended';
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface LocationPoint {
  id: string;
  session_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  recorded_at: string;
  created_at: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
}