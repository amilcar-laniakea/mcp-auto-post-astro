import { Router, Request, Response } from "express";
import { CacheService } from "../services/cache-service.js";

export function createCacheRouter(cacheService: CacheService): Router {
  const router = Router();
  /* POST /api/cache/posts
   * Guarda un post temporalmente (para preview)
   */
  router.post("/posts", async (req: Request, res: Response) => {
    try {
      const { postId, postData, ttl } = req.body;

      if (!postId || !postData) {
        return res.status(400).json({
          success: false,
          error: "postId and postData are required",
        });
      }

      // Guarda en caché
      cacheService.set(postId, postData, ttl);

      res.json({
        success: true,
        message: "Post cached successfully",
        data: {
          postId,
          expiresIn: ttl || 1800000,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/cache/posts/:postId
   * Recupera un post temporal
   */
  router.get("/posts/:postId", async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const postData = cacheService.get(postId);

      if (!postData) {
        return res.status(404).json({
          success: false,
          error: "Post not found or expired",
        });
      }

      res.json({
        success: true,
        data: postData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * DELETE /api/cache/posts/:postId
   * Elimina un post temporal (después de publicar o cancelar)
   */
  router.delete("/posts/:postId", async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      const deleted = cacheService.delete(postId);

      res.json({
        success: true,
        deleted,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  /**
   * GET /api/cache/stats
   * Obtiene estadísticas del caché (útil para debugging)
   */
  router.get("/stats", async (req: Request, res: Response) => {
    try {
      const stats = cacheService.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}
