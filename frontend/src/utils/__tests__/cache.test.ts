import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheService } from '../cache';

describe('cacheService', () => {
  beforeEach(() => {
    // Limpa o cache antes de cada teste
    cacheService.clear();
    
    // Mock do localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Mock para Date.now
    vi.spyOn(Date, 'now').mockImplementation(() => 1000);
  });
  
  it('should store and retrieve data from cache', () => {
    const key = 'testKey';
    const data = { id: 1, name: 'Test' };
    
    // Armazena dados no cache
    cacheService.set(key, data, 60);
    
    // Recupera dados do cache
    const cachedData = cacheService.get(key);
    
    expect(cachedData).toEqual(data);
  });
  
  it('should return null for expired cache items', () => {
    const key = 'expiredKey';
    const data = { id: 1, name: 'Test' };
    
    // Armazena dados no cache com TTL de 30 segundos
    cacheService.set(key, data, 30);
    
    // Avança o tempo em 31 segundos
    vi.spyOn(Date, 'now').mockImplementation(() => 1000 + 31000);
    
    // Tenta recuperar dados expirados
    const cachedData = cacheService.get(key);
    
    expect(cachedData).toBeNull();
  });
  
  it('should delete specific cache item', () => {
    const key1 = 'key1';
    const key2 = 'key2';
    const data1 = { id: 1 };
    const data2 = { id: 2 };
    
    // Armazena dois itens no cache
    cacheService.set(key1, data1, 60);
    cacheService.set(key2, data2, 60);
    
    // Remove apenas um item
    cacheService.delete(key1);
    
    // Verifica se apenas o item correto foi removido
    expect(cacheService.get(key1)).toBeNull();
    expect(cacheService.get(key2)).toEqual(data2);
  });
  
  it('should clear all cache items', () => {
    const key1 = 'key1';
    const key2 = 'key2';
    
    // Armazena dois itens no cache
    cacheService.set(key1, { id: 1 }, 60);
    cacheService.set(key2, { id: 2 }, 60);
    
    // Limpa todo o cache
    cacheService.clear();
    
    // Verifica se todos os itens foram removidos
    expect(cacheService.get(key1)).toBeNull();
    expect(cacheService.get(key2)).toBeNull();
  });
}); 