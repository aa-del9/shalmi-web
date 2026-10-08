export class ServiceError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

export class UnauthorizedError extends ServiceError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends ServiceError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends ServiceError {
  constructor(message = 'Invalid input') {
    super('VALIDATION', message);
    this.name = 'ValidationError';
  }
}

export class ConflictError extends ServiceError {
  constructor(message = 'Conflict') {
    super('CONFLICT', message);
    this.name = 'ConflictError';
  }
}

export class InvalidStateError extends ServiceError {
  constructor(message = 'Invalid state transition') {
    super('INVALID_STATE', message);
    this.name = 'InvalidStateError';
  }
}
