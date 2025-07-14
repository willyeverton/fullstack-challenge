import { describe, it, expect, vi, beforeEach } from 'vitest';
import enrichmentService from '../enrichmentService';

// Variável global para acessar o mock
let mockAxiosInstance: any;

vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn()
      }
    }
  };
  globalThis.mockAxiosInstance = mockAxiosInstance;
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      isAxiosError: undefined // sobrescreveremos depois
    }
  };
});

// Mock do módulo de cache
vi.mock('../../utils/cache', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  }
}));

describe('enrichmentService', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Configura o mock do isAxiosError
    const axios = require('axios');
    axios.isAxiosError = vi.fn((error: unknown) => {
      return error && typeof error === 'object' && 'isAxiosError' in error;
    });
  });

  describe('getEnrichedUserData', () => {
    it('should fetch enriched user data', async () => {
      const uuid = 'test-uuid';
      const mockData = {
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe'
      };

      // Mock da resposta da API
      globalThis.mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await enrichmentService.getEnrichedUserData(uuid);

      expect(result).toEqual(mockData);
    });

    it('should handle 404 error correctly', async () => {
      const uuid = 'test-uuid';
      const mockError = {
        isAxiosError: true,
        response: {
          status: 404,
          data: 'Data not found'
        }
      };

      // Mock do erro 404
      globalThis.mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(enrichmentService.getEnrichedUserData(uuid)).rejects.toThrow();
    });
  });

  describe('refreshEnrichedUserData', () => {
    it('should force refresh of enriched data', async () => {
      const uuid = 'test-uuid';
      const mockData = {
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe'
      };

      // Mock da resposta da API
      globalThis.mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await enrichmentService.refreshEnrichedUserData(uuid);

      expect(result).toEqual(mockData);
    });
  });
});
