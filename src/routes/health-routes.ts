import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";

export function createHealthRouter(): Router {
  const router = Router();

  const healthRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: {
      status: "error",
      message: "Too many health check requests",
    },
  });

  router.get("/", healthRateLimit, (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return router;
}
