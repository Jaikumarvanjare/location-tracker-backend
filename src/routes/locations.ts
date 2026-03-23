import { FastifyInstance } from 'fastify';
import {
  postLocationSchema,
  batchLocationSchema,
  listLocationsSchema,
} from '../plugins/schemas';

export async function locationRoutes(fastify: FastifyInstance) {

  fastify.post('/sessions/:sessionId/locations',
    { schema: postLocationSchema },
    async (req: any, reply) => {

      const { sessionId } = req.params;
      const { latitude, longitude, accuracy, recorded_at } = req.body;

      const result = await fastify.pg.query(
        `INSERT INTO locations (session_id, latitude, longitude, accuracy, recorded_at)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [sessionId, latitude, longitude, accuracy, recorded_at]
      );

      return reply.status(201).send({ data: result.rows[0] });
    }
  );

  fastify.get('/sessions/:sessionId/locations',
    { schema: listLocationsSchema },
    async (req: any) => {

      const { sessionId } = req.params;

      const result = await fastify.pg.query(
        `SELECT * FROM locations WHERE session_id=$1`,
        [sessionId]
      );

      return { data: result.rows };
    }
  );
}