// Handles request/response logic for locations

import {
  createLocationService,
  batchLocationService,
  listLocationsService,
  validateActiveSession,
} from './service';



export async function createLocationHandler(req: any, reply: any) {
  // Validate session before inserting location
  await validateActiveSession(req.server, req.params.sessionId);

  const data = await createLocationService(req.server, {
    sessionId: req.params.sessionId,
    ...req.body,
  });

  return reply.status(201).send({ data });
}

export async function batchLocationHandler(req: any, reply: any) {

  // Validate session before batch insert
  await validateActiveSession(req.server, req.params.sessionId);

  const result = await batchLocationService(
    req.server,
    req.params.sessionId,
    req.body.locations
  );

  return reply.status(207).send({
    data: result,
  });
}

export async function listLocationsHandler(req: any) {

  const { limit = 1000, offset = 0 } = req.query;

  const result = await listLocationsService(
    req.server,
    req.params.sessionId,
    limit,
    offset
  );

  return {
    data: result.rows,
    meta: { total: result.count, limit, offset },
  };
}