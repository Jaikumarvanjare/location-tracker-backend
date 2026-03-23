import { FastifyInstance } from 'fastify';
import {
  createSessionSchema,
  listSessionsSchema,
  getSessionSchema,
  patchSessionSchema,
} from '../plugins/schemas';

export async function sessionRoutes(fastify: FastifyInstance) {

  fastify.post('/sessions', { schema: createSessionSchema }, async (req: any, reply) => {
    const result = await fastify.pg.query(
      `INSERT INTO sessions (device_id)
       VALUES ($1)
       RETURNING *`,
      [req.body.device_id]
    );

    return reply.status(201).send({ data: result.rows[0] });
  });

  fastify.get('/sessions', { schema: listSessionsSchema }, async (req: any) => {
    const { limit, offset } = req.query;

    const data = await fastify.pg.query(
      `SELECT * FROM sessions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      data: data.rows,
      meta: { total: data.rowCount, limit, offset },
    };
  });

  fastify.get('/sessions/:sessionId', { schema: getSessionSchema }, async (req: any, reply) => {
    const result = await fastify.pg.query(
      `SELECT * FROM sessions WHERE id = $1`,
      [req.params.sessionId]
    );

    if (!result.rows.length) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: 'Session not found' } });
    }

    return { data: result.rows[0] };
  });

  fastify.patch('/sessions/:sessionId', { schema: patchSessionSchema }, async (req: any) => {
    const result = await fastify.pg.query(
      `UPDATE sessions SET status='ended', ended_at=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.sessionId]
    );

    return { data: result.rows[0] };
  });
}