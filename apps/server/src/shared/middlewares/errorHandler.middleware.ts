import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { AppError } from "../utils/error.js";
import { logger } from "../utils/logger.js";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Something Went Wrong";

  if (err instanceof AppError && err.isOperational) {
    logger.warn("Operational error", {
      error: message,
      statusCode,
      route: req.route?.path ?? req.originalUrl,
      method: req.method,
    });
  } else {
    logger.error("Unhandled error", {
      error: message,
      stack: err.stack,
      statusCode,
      route: req.route?.path ?? req.originalUrl,
      method: req.method,
    });
  }
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Server Error" : message,
  });
};
