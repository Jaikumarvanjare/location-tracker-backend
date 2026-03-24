// Handles database operations for sessions
import { NotFoundError, ConflictError } from '../../utils/AppError';
import { db } from '../../db';
import { sessions } from '../../db/schema';
import { eq, desc, asc, sql } from 'drizzle-orm';

export async function createSessionService(fastify: any, device_id: string) {
  const result = await db.insert(sessions)
    .values({ deviceId: device_id })
    .returning();

  return result[0];
}

export async function listSessionsService(fastify: any, limit: number, offset: number, sort_by: string = 'created_at', sort_dir: string = 'desc') {
  const validSortColumns = ['created_at', 'started_at', 'ended_at'];
  const columnStr = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
  
  let orderCol;
  if (columnStr === 'started_at') orderCol = sessions.startedAt;
  else if (columnStr === 'ended_at') orderCol = sessions.endedAt;
  else orderCol = sessions.createdAt;

  const orderFunc = sort_dir.toLowerCase() === 'asc' ? asc : desc;

  const rows = await db.select()
    .from(sessions)
    .orderBy(orderFunc(orderCol))
    .limit(limit)
    .offset(offset);

  const countRes = await db.select({ count: sql`count(*)`.mapWith(Number) }).from(sessions);

  return {
    rows,
    count: countRes[0].count,
  };
}

export async function getSessionService(fastify: any, sessionId: string) {
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId));
  return result[0];
}

export async function endSessionService(fastify: any, sessionId: string) {
  const existing = await db.select().from(sessions).where(eq(sessions.id, sessionId));

  if (!existing.length) {
    throw new NotFoundError('Session not found');
  }

  if (existing[0].status === 'ended') {
    throw new ConflictError('Session already ended');
  }

  const result = await db.update(sessions)
    .set({ status: 'ended', endedAt: sql`NOW()` })
    .where(eq(sessions.id, sessionId))
    .returning();

  return result[0];
}