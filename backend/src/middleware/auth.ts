import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { logger } from "../utils/logger";

// Middleware to authenticate JWT tokens
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        logger.error("JWT authentication error", { error: err.message });
        return res.status(500).json({
          success: false,
          message: "Authentication error",
        });
      }

      if (!user) {
        logger.warn("JWT authentication failed", {
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Add user to request object
      req.user = user;
      next();
    }
  )(req, res, next);
};

// Middleware to authenticate local strategy (for login)
export const authenticateLocal = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        logger.error("Local authentication error", { error: err.message });
        return res.status(500).json({
          success: false,
          message: "Authentication error",
        });
      }

      if (!user) {
        logger.warn("Local authentication failed", {
          email: req.body.email,
          ip: req.ip,
        });
        return res.status(401).json({
          success: false,
          message: info?.message || "Invalid credentials",
        });
      }

      // Add user to request object
      req.user = user;
      next();
    }
  )(req, res, next);
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err) {
      logger.error("Optional JWT authentication error", { error: err.message });
    }

    // Add user to request object if available
    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
};
