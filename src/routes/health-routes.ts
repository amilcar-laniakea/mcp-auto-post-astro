import { Router, Request, Response } from "express";
import * as rateLimitModule from "express-rate-limit";

const rateLimit = rateLimitModule.default;

export function createHealthRouter(): Router {
  const router = Router();

  const healthRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    statusCode: 500,
    message: {
      status: "error",
      message: "Too many health check requests - FORCED FAILURE",
    },
  });

  router.get("/", healthRateLimit, (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return router;
}
