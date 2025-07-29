export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    if (field) {
      this.message = `${field}: ${message}`;
    }
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`;
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, resource?: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, operation?: string) {
    super(message, 500, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

export class ScoreValidationError extends ValidationError {
  constructor(message: string, trackId?: string, time?: number) {
    super(message, "score");
    this.name = "ScoreValidationError";
    this.message = `Score validation failed: ${message}`;
  }
}

export class TrackNotFoundError extends NotFoundError {
  constructor(trackId: string) {
    super("Track", trackId);
    this.name = "TrackNotFoundError";
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(userId: string) {
    super("User", userId);
    this.name = "UserNotFoundError";
  }
}
