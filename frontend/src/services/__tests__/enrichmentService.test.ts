import { describe, it, expect, vi, beforeEach } from 'vitest';
import enrichmentService from '../enrichmentService';
import axios from 'axios';

// Mock do módulo axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    })),
    isAxiosError: vi.fn()
  }
}));

// Mock do módulo de cache
vi.mock('../../utils/cache', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn()
  }
}));

describe('enrichmentService', () => {
  let mockAxiosInstance: any;
  
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Configura o mock do axios
    mockAxiosInstance = axios.create();
    
    // Configura o mock do isAxiosError
    (axios.isAxiosError as any).mockImplementation((error: unknown) => {
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
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });
      
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
      mockAxiosInstance.get.mockRejectedValue(mockError);
      
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
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });
      
      const result = await enrichmentService.refreshEnrichedUserData(uuid);
      
      expect(result).toEqual(mockData);
    });
  });
}); 