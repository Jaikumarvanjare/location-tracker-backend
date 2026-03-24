// Handles database operations for locations
import { NotFoundError, ConflictError } from '../../utils/AppError';
import { db } from '../../db';
import { locations, sessions } from '../../db/schema';
import { eq, asc, sql } from 'drizzle-orm';

export async function validateActiveSession(fastify: any, sessionId: string) {
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId));

  if (!result.length) {
    throw new NotFoundError('Session not found');
  }

  if (result[0].status === 'ended') {
    throw new ConflictError('Session has already ended');
  }

  return { session: result[0] };
}

export async function createLocationService(fastify: any, data: any) {
  const result = await db.insert(locations)
    .values({
      sessionId: data.sessionId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy,
      recordedAt: new Date(data.recorded_at),
    })
    .returning();

  return result[0];
}

export async function batchLocationService(fastify: any, sessionId: string, locs: any[]) {
  let accepted = 0;
  let rejected = 0;
  const errors: any[] = [];

  for (let i = 0; i < locs.length; i++) {
    const loc = locs[i];
    try {
      await db.insert(locations)
        .values({
          sessionId,
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          recordedAt: new Date(loc.recorded_at),
        })
        .onConflictDoNothing({ target: [locations.sessionId, locations.recordedAt] });
      
      accepted++;
    } catch (err: any) {
      rejected++;
      errors.push({
        index: i,
        reason: err.message,
      });
    }
  }

  return { accepted, rejected, errors };
}

export async function listLocationsService(
  fastify: any,
  sessionId: string,
  limit: number,
  offset: number
) {
  const rows = await db.select()
    .from(locations)
    .where(eq(locations.sessionId, sessionId))
    .orderBy(asc(locations.recordedAt))
    .limit(limit)
    .offset(offset);

  const countRes = await db.select({ count: sql`count(*)`.mapWith(Number) })
    .from(locations)
    .where(eq(locations.sessionId, sessionId));

  return {
    rows,
    count: countRes[0].count,
  };
}