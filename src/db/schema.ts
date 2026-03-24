import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  doublePrecision, 
  index, 
  unique 
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const sessions = pgTable('sessions', {
  id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
  deviceId: text('device_id').notNull(),
  status: text('status').default('active'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    deviceIdx: index('idx_sessions_device').on(table.deviceId),
  };
});

export const locations = pgTable('locations', {
  id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey(),
  sessionId: uuid('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  accuracy: doublePrecision('accuracy').notNull(),
  altitude: doublePrecision('altitude'),
  speed: doublePrecision('speed'),
  heading: doublePrecision('heading'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    sessionTimeIdx: index('idx_locations_session_time').on(table.sessionId, table.recordedAt),
    sessionTimeUnique: unique().on(table.sessionId, table.recordedAt),
  };
});
