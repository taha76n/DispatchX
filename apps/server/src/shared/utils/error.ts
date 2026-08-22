class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

class BadRequestError extends AppError {
  constructor(message: string = "Bad Request Error") {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message: string = "Not Found Error") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized Error") {
    super(message, 405);
  }
}

class UnauthenticatedError extends AppError {
  constructor(message: string = "Unauthorized Error") {
    super(message, 405);
  }
}

class TooManyReuestsError extends AppError {
  constructor(message: string = "Too Many Requests Error") {
    super(message, 429);
  }
}

export {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  TooManyReuestsError,
  UnauthenticatedError,
};
