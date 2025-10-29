import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { MCPConfig } from "./types/index.js";
import { validateApiKey, rateLimit, requestLogger } from "./middleware/auth.js";

import { PostService } from "./services/post-service.js";
import { CacheService } from "./services/cache-service.js";

import { createPostRouter } from "./routes/post-routes.js";
import { createHealthRouter } from "./routes/health-routes.js";
import { createValidateRouter } from "./routes/validate-routes.js";
import { createCacheRouter } from "./routes/cache-routes.js";

dotenv.config();

// Validación de variables de entorno
function validateEnv(): MCPConfig {
  const required = [
    "GITHUB_TOKEN",
    "GITHUB_OWNER",
    "GITHUB_REPO",
    "API_SECRET_KEY",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  return {
    github: {
      token: process.env.GITHUB_TOKEN!,
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      branch: process.env.GITHUB_BRANCH || "main",
    },
    api: {
      secretKey: process.env.API_SECRET_KEY!,
      port: parseInt(process.env.MCP_PORT || "3000"),
    },
    vercel: {
      deployHook: process.env.DEPLOY_HOOK,
    },
  };
}

// Inicialización
const config = validateEnv();
const app = express();
const postService = new PostService(config);
const cacheService = new CacheService(1800000);

// Middlewares globales
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);

app.use(helmet());

app.disable("x-powered-by");

// Health check (sin autenticación)
app.use("/api/health", createHealthRouter());

// Todas las rutas siguientes requieren autenticación
app.use(validateApiKey(config.api.secretKey));
app.use(rateLimit(20, 60000)); // 20 requests por minuto

app.use("/api/posts", createPostRouter(postService));
app.use("/api/validate", createValidateRouter(postService));
app.use("/api/cache", createCacheRouter(cacheService));

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

async function startServer() {
  const isValid = await postService.validateAccess();
  if (!isValid) {
    console.error("Failed to validate GitHub access, exiting...");
    process.exit(1);
  }

  app.listen(config.api.port, () => {
    console.log(`🚀 MCP Server running on port ${config.api.port}`);
    console.log(`📦 Repository: ${config.github.owner}/${config.github.repo}`);
    console.log(`🌿 Branch: ${config.github.branch}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("SIGTERM", () => {
  cacheService.destroy();
  process.exit(0);
});
