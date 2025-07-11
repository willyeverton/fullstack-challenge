import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import api from '../api';

// Mock do axios
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      })),
    },
  };
});

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create axios instance with correct config', () => {
    // Verifica se o axios.create foi chamado com a configuração correta
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('should have response interceptors', () => {
    // Verifica se o interceptor de resposta foi configurado
    const mockCreate = axios.create as any;
    const mockInstance = mockCreate.mock.results[0].value;
    
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });
}); 