import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log the incoming request
  logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;

    logger.info("Request completed", {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};
