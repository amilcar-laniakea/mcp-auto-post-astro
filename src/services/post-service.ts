import { CreatePostInput, MCPConfig } from "../types/index.js";
import { GitHubService } from "./github-service.js";
import {
  generateFileName,
  generatePostContent,
  getPostPath,
  isValidFileName,
} from "./post-generator.js";

export class PostService {
  private githubService: GitHubService;
  private vercelDeployHook?: string;

  constructor(config: MCPConfig) {
    this.githubService = new GitHubService(config.github);
    this.vercelDeployHook = config.vercel?.deployHook;
  }

  /**
   * Crea un nuevo post en el blog
   */
  async createPost(input: CreatePostInput) {
    // Genera el nombre del archivo si no se provee
    let fileName = input.fileName || generateFileName(input.title);

    // Valida seguridad del nombre de archivo
    if (!isValidFileName(fileName)) {
      throw new Error("Invalid file name: contains dangerous characters");
    }

    // Asegura extensión .md
    if (!/\.(md|mdx)$/i.test(fileName)) {
      fileName += ".md";
    }

    // Genera el contenido del post
    const content = generatePostContent(input);

    // Obtiene el path completo
    const filePath = getPostPath(fileName);

    // Crea el archivo en GitHub
    const commitMessage = `feat: add new post "${input.title}"`;

    try {
      const result = await this.githubService.createFile(
        filePath,
        content,
        commitMessage
      );

      // Trigger Vercel deployment si está configurado
      if (this.vercelDeployHook) {
        await this.triggerVercelDeploy();
      }

      return {
        fileName,
        path: filePath,
        commitUrl: result.commitUrl,
        sha: result.sha,
      };
    } catch (error: any) {
      console.error("Error creating post:", error);
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  /**
   * Actualiza un post existente
   */
  async updatePost(fileName: string, input: CreatePostInput) {
    // Valida seguridad
    if (!isValidFileName(fileName)) {
      throw new Error("Invalid file name: contains dangerous characters");
    }

    // Genera contenido actualizado
    const content = generatePostContent(input);
    const filePath = getPostPath(fileName);

    // Actualiza en GitHub
    const commitMessage = `chore: update post "${input.title}"`;

    try {
      const result = await this.githubService.updateFile(
        filePath,
        content,
        commitMessage
      );

      // Trigger Vercel deployment
      if (this.vercelDeployHook) {
        await this.triggerVercelDeploy();
      }

      return {
        fileName,
        path: filePath,
        commitUrl: result.commitUrl,
        sha: result.sha,
      };
    } catch (error: any) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }

  /**
   * Verifica acceso al repositorio
   */
  async validateAccess(): Promise<boolean> {
    return await this.githubService.validateAccess();
  }

  /**
   * Trigger deployment en Vercel
   */
  private async triggerVercelDeploy(): Promise<void> {
    if (!this.vercelDeployHook) return;

    try {
      await fetch(this.vercelDeployHook, { method: "POST" });
      console.log("Vercel deployment triggered");
    } catch (error) {
      console.error("Failed to trigger Vercel deployment:", error);
      // No lanza error, solo logea
    }
  }
}
