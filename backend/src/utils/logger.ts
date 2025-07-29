import { Request } from "express";

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  trackId?: string;
  scoreId?: string;
  endpoint?: string;
  method?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] ${level} | ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  error(message: string, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // Request-specific logging
  requestLog(req: Request, duration: number, statusCode: number): void {
    const context: LogContext = {
      method: req.method,
      endpoint: req.path,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      duration,
      statusCode,
      userId: (req as any).user?.id,
    };

    const level = statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `${req.method} ${req.path} - ${statusCode} (${duration}ms)`;

    this.log(level, message, context);
  }

  // API-specific logging
  apiLog(operation: string, details: any, context?: LogContext): void {
    this.info(`API ${operation}`, { ...context, details });
  }

  // Database operation logging
  dbLog(
    operation: string,
    collection: string,
    details?: any,
    context?: LogContext
  ): void {
    this.debug(`DB ${operation} on ${collection}`, { ...context, details });
  }

  // Score submission logging
  scoreLog(
    operation: string,
    trackId: string,
    time: number,
    userId: string,
    context?: LogContext
  ): void {
    this.info(`Score ${operation}`, {
      ...context,
      trackId,
      time,
      userId,
      formattedTime: this.formatTime(time),
    });
  }

  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = milliseconds % 1000;
    return `${minutes}:${seconds.toString().padStart(2, "0")}.${ms
      .toString()
      .padStart(3, "0")}`;
  }
}

export const logger = new Logger();
