/**
 * Utilitário simples de cache para o frontend
 * Implementa um cache em memória com expiração
 */

interface CacheItem<T> {
  value: T;
  expiry: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Define um item no cache
   * @param key Chave do item
   * @param value Valor a ser armazenado
   * @param ttlSeconds Tempo de vida em segundos (padrão: 5 minutos)
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiry });
  }
  
  /**
   * Obtém um item do cache
   * @param key Chave do item
   * @returns O valor armazenado ou undefined se não encontrado ou expirado
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // Se o item não existe ou expirou, retorna undefined
    if (!item || Date.now() > item.expiry) {
      if (item) this.delete(key); // Remove itens expirados
      return undefined;
    }
    
    return item.value as T;
  }
  
  /**
   * Remove um item do cache
   * @param key Chave do item a ser removido
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Limpa todos os itens expirados do cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Exporta uma instância única do serviço de cache
export const cacheService = new CacheService();

// Configura uma limpeza periódica do cache (a cada 5 minutos)
setInterval(() => {
  cacheService.cleanup();
}, 5 * 60 * 1000); 