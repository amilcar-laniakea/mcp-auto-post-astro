import { Octokit } from "@octokit/rest";
import { MCPConfig } from "../types/index.js";

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private branch: string;

  constructor(config: MCPConfig["github"]) {
    this.octokit = new Octokit({
      auth: config.token,
    });
    this.owner = config.owner;
    this.repo = config.repo;
    this.branch = config.branch;
  }

  /**
   * Verifica si un archivo ya existe en el repositorio
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: this.branch,
      });
      return true;
    } catch (error: any) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Crea un nuevo archivo en el repositorio
   */
  async createFile(
    path: string,
    content: string,
    commitMessage: string
  ): Promise<{ commitUrl: string; sha: string }> {
    // Verifica que no exista
    const exists = await this.fileExists(path);
    if (exists) {
      throw new Error(`File ${path} already exists in repository`);
    }

    // Crea el archivo
    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message: commitMessage,
      content: Buffer.from(content).toString("base64"),
      branch: this.branch,
    });

    return {
      commitUrl: response.data.commit.html_url || "",
      sha: response.data.commit.sha || "",
    };
  }

  /**
   * Actualiza un archivo existente
   */
  async updateFile(
    path: string,
    content: string,
    commitMessage: string
  ): Promise<{ commitUrl: string; sha: string }> {
    // Obtiene el SHA actual del archivo
    const fileData = await this.octokit.repos.getContent({
      owner: this.owner,
      repo: this.repo,
      path,
      ref: this.branch,
    });

    if (Array.isArray(fileData.data) || fileData.data.type !== "file") {
      throw new Error(`Path ${path} is not a file`);
    }

    // Actualiza el archivo
    const response = await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message: commitMessage,
      content: Buffer.from(content).toString("base64"),
      branch: this.branch,
      sha: fileData.data.sha,
    });

    return {
      commitUrl: response.data.commit.html_url || "",
      sha: response.data.commit.sha || "",
    };
  }

  /**
   * Verifica que el token y permisos sean válidos
   */
  async validateAccess(): Promise<boolean> {
    try {
      await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo,
      });
      return true;
    } catch (error) {
      console.error("GitHub access validation failed:", error);
      return false;
    }
  }
}
