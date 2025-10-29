import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Middleware para validar API Key
 */
export function validateApiKey(secretKey: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key is required",
      });
    }

    // Comparación segura para prevenir timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(apiKey),
      Buffer.from(secretKey)
    );

    if (!isValid) {
      return res.status(403).json({
        success: false,
        error: "Invalid API key",
      });
    }

    next();
  };
}

/**
 * Middleware para rate limiting simple (en memoria)
 * Para producción, usa Redis o similar
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.ip || "unknown";
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Limpia registros expirados
    if (record && now > record.resetTime) {
      rateLimitStore.delete(identifier);
    }

    const currentRecord = rateLimitStore.get(identifier);

    if (!currentRecord) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (currentRecord.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Too many requests, please try again later",
      });
    }

    currentRecord.count++;
    next();
  };
}

/**
 * Middleware para logging de requests
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${
        res.statusCode
      } (${duration}ms)`
    );
  });

  next();
}
