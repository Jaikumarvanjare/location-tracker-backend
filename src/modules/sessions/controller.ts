// Handles request/response logic for sessions

import { NotFoundError } from '../../utils/AppError';
import {
  createSessionService,
  listSessionsService,
  getSessionService,
  endSessionService,
} from './service';

export async function createSessionHandler(req: any, reply: any) {
  const data = await createSessionService(req.server, req.body.device_id);
  return reply.status(201).send({ data });
}

export async function listSessionsHandler(req: any) {
  const { limit, offset, sort_by, sort_dir } = req.query;

  const result = await listSessionsService(req.server, limit, offset, sort_by, sort_dir);

  return {
    data: result.rows,
    meta: { total: result.count, limit, offset },
  };
}

export async function getSessionHandler(req: any, reply: any) {
  const data = await getSessionService(req.server, req.params.sessionId);

  if (!data) {
    throw new NotFoundError('Session not found');
  }

  return { data };
}

export async function endSessionHandler(req: any, reply: any) {
  const data = await endSessionService(req.server, req.params.sessionId);

  return { data };
}