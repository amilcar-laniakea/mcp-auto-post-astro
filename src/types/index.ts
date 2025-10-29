import { z } from 'zod';

/**
 * Schema de validación para crear un post
 */
export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  image: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  category: z.string().optional().default(''),
  draft: z.boolean().optional().default(false),
  lang: z.string().optional().default(''),
  content: z.string().optional().default(''),
  fileName: z.string().optional(), // Si no se provee, se genera del título
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

/**
 * Respuesta de la API
 */
export interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    fileName: string;
    path: string;
    commitUrl?: string;
  };
  error?: string;
}

/**
 * Configuración del MCP
 */
export interface MCPConfig {
  github: {
    token: string;
    owner: string;
    repo: string;
    branch: string;
  };
  api: {
    secretKey: string;
    port: number;
  };
  vercel?: {
    deployHook?: string;
  };
}