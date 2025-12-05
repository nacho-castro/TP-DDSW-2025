export class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Errores específicos para mejor manejo
export class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id
      ? `${resource} con ID '${id}' no encontrado`
      : `${resource} no encontrado`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.resourceId = id;
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

export class InvalidIdError extends ValidationError {
  constructor(field = 'ID') {
    super(`${field} no válido`, field.toLowerCase());
  }
}