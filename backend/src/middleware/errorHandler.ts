import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default error values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log the error with context
  logger.error("Unhandled error occurred", {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    endpoint: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: (req as any).user?.id,
  });

  // Development vs Production error handling
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};

const sendErrorDev = (err: CustomError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    },
  });
};

const sendErrorProd = (err: CustomError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        timestamp: new Date().toISOString(),
      },
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error("Unhandled operational error", {
      error: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      },
    });
  }
};

// Async error wrapper with logging
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    Promise.resolve(fn(req, res, next)).catch((error) => {
      const duration = Date.now() - startTime;

      // Log the error with request context
      logger.error("Async handler error", {
        error: error.message,
        stack: error.stack,
        endpoint: req.path,
        method: req.method,
        duration,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      });

      next(error);
    });
  };

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // Log request start
  logger.info(`Request started: ${req.method} ${req.path}`, {
    method: req.method,
    endpoint: req.path,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: (req as any).user?.id,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - startTime;
    logger.requestLog(req, duration, res.statusCode);
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
