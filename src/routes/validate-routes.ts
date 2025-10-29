import { Router, Request, Response } from "express";
import { PostService } from "../services/post-service.js";

export function createValidateRouter(postService: PostService): Router {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const isValid = await postService.validateAccess();

      if (isValid) {
        res.json({
          success: true,
          message: "GitHub access validated successfully",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to validate GitHub access",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  return router;
}
