import { Router, Request, Response } from "express";
import { CreatePostSchema, ApiResponse } from "../types/index.js";
import { PostService } from "../services/post-service.js";

export function createPostRouter(postService: PostService): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response<ApiResponse>) => {
    try {
      const validatedInput = CreatePostSchema.parse(req.body);
      const result = await postService.createPost(validatedInput);

      res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error creating post:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.errors.map((e: any) => e.message).join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create post",
        error: error.message,
      });
    }
  });

  router.put("/:fileName", async (req: Request, res: Response<ApiResponse>) => {
    try {
      const { fileName } = req.params;
      const validatedInput = CreatePostSchema.parse(req.body);
      const result = await postService.updatePost(fileName, validatedInput);

      res.json({
        success: true,
        message: "Post updated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error updating post:", error);

      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: error.errors.map((e: any) => e.message).join(", "),
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update post",
        error: error.message,
      });
    }
  });

  return router;
}
