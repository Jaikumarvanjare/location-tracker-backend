export type AppErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SESSION_ENDED'
  | 'SESSION_ALREADY_ENDED'
  | 'INTERNAL_ERROR';

// Standard error response format
export function buildError(code: AppErrorCode, message: string) {
  return {
    error: {
      code,
      message,
    },
  };
}

// Helper functions for common errors

export function notFound(message = 'Resource not found') {
  return buildError('NOT_FOUND', message);
}

export function validationError(message: string) {
  return buildError('VALIDATION_ERROR', message);
}

export function sessionEnded(message = 'Session already ended') {
  return buildError('SESSION_ENDED', message);
}

export function sessionAlreadyEnded(message = 'Session already ended') {
  return buildError('SESSION_ALREADY_ENDED', message);
}

export function internalError(message = 'Something went wrong') {
  return buildError('INTERNAL_ERROR', message);
}