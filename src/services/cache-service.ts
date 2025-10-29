/**
 * Servicio de caché en memoria para posts temporales
 * Los posts expiran automáticamente después del TTL
 */
export class CacheService {
  private cache: Map<string, { data: any; expiresAt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private defaultTTL: number = 3600000) {
    // 1 hora por defecto
    // Limpia entradas expiradas cada 5 minutos
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000);
  }

  /**
   * Guarda datos en el caché
   */
  set(key: string, data: any, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Recupera datos del caché
   * Retorna null si no existe o expiró
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    // Verifica si expiró
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Elimina una entrada del caché
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Verifica si existe una key
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verifica si expiró
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Limpia entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Limpia el intervalo al destruir
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}
